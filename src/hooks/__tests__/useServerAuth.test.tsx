import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useServerAuth } from '@/hooks/useServerAuth'

const mockGetSession = vi.hoisted(() => vi.fn())
const mockInvoke = vi.hoisted(() => vi.fn())

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            getSession: (...args: unknown[]) => mockGetSession(...args),
        },
        functions: {
            invoke: (...args: unknown[]) => mockInvoke(...args),
        },
    },
}))

describe('useServerAuth', () => {
    beforeEach(() => {
        mockGetSession.mockReset()
        mockInvoke.mockReset()
    })

    it('setzt Status auf nicht authentifiziert, wenn keine Session vorhanden ist', async () => {
        mockGetSession.mockResolvedValue({ data: { session: null } })

        const { result } = renderHook(() => useServerAuth())

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.isVerified).toBe(true)
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.error).toBe(null)
    })

    it('setzt Admin-Status wenn verify-admin erfolgreich ist', async () => {
        mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
        mockInvoke.mockResolvedValue({ data: { isAdmin: true }, error: null })

        const { result } = renderHook(() => useServerAuth())

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(mockInvoke).toHaveBeenCalledWith('verify-admin')
        expect(result.current.isVerified).toBe(true)
        expect(result.current.isAdmin).toBe(true)
        expect(result.current.error).toBe(null)
    })

    it('setzt Fehler wenn verify-admin fehlschlägt', async () => {
        mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
        mockInvoke.mockResolvedValue({ data: null, error: new Error('boom') })

        const { result } = renderHook(() => useServerAuth())

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.isVerified).toBe(true)
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.error).toBe('boom')
    })
})