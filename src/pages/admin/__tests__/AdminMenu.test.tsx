import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminMenu from '@/pages/admin/AdminMenu'

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

describe('AdminMenu', () => {
    it('rendert leeren Zustand wenn keine Kategorien vorhanden sind', async () => {
        mockFrom.mockImplementation((table: string) => ({
            select: () => ({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        }))

        render(<AdminMenu />)

        await waitFor(() => {
            expect(screen.getByText('Erstellen Sie zuerst eine Kategorie')).toBeInTheDocument()
        })
        expect(screen.getAllByText('Speisekarte').length).toBeGreaterThan(0)
    })
})