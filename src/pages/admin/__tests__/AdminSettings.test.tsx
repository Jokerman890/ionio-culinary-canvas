import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminSettings from '@/pages/admin/AdminSettings'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: (...args: unknown[]) => mockFrom(...args),
    },
}))

vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}))

vi.mock('@/components/admin/AdminLayout', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="admin-layout">{children}</div>
    ),
}))

describe('AdminSettings', () => {
    it('rendert Formular nach dem Laden', async () => {
        mockFrom.mockReturnValue({
            select: () => ({
                eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn() }),
            }),
        })

        // fetchSettings uses select('*') without eq, so return data directly
        mockFrom.mockImplementation(() => ({
            select: () => Promise.resolve({ data: [], error: null }),
        }))

        render(<AdminSettings />)

        await waitFor(() => expect(screen.getByText('Einstellungen')).toBeInTheDocument())
        expect(screen.getByLabelText('Telefonnummer')).toBeInTheDocument()
    })
})