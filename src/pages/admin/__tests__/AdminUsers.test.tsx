import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminUsers from '@/pages/admin/AdminUsers'

const mockFrom = vi.hoisted(() => vi.fn())
const mockGetSession = vi.hoisted(() => vi.fn())
const mockInvoke = vi.hoisted(() => vi.fn())

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: (...args: unknown[]) => mockFrom(...args),
        auth: {
            getSession: (...args: unknown[]) => mockGetSession(...args),
        },
        functions: {
            invoke: (...args: unknown[]) => mockInvoke(...args),
        },
    },
}))

vi.mock('@/contexts/AuthContext', () => ({
    useAuthContext: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}))

vi.mock('@/components/admin/AdminLayout', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="admin-layout">{children}</div>
    ),
}))

describe('AdminUsers', () => {
    it('zeigt Zugriff verweigert wenn serverseitig kein Admin', async () => {
        mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
        mockInvoke.mockResolvedValue({ data: { isAdmin: false }, error: null })

        render(<AdminUsers />)

        await waitFor(() => expect(screen.getByText('Zugriff verweigert')).toBeInTheDocument())
    })
})