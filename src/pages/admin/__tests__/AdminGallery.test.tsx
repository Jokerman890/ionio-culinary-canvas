import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminGallery from '@/pages/admin/AdminGallery'

const mockFrom = vi.hoisted(() => vi.fn())
const mockStorage = vi.hoisted(() => ({
    from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'url' } })),
        remove: vi.fn(),
    })),
}))

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: (...args: unknown[]) => mockFrom(...args),
        storage: mockStorage,
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

describe('AdminGallery', () => {
    it('rendert leeren Zustand wenn keine Bilder vorhanden sind', async () => {
        mockFrom.mockReturnValue({
            select: () => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        })

        render(<AdminGallery />)

        await waitFor(() => expect(screen.getByText('Galerie')).toBeInTheDocument())
        expect(screen.getByText('Noch keine Bilder vorhanden. Laden Sie Ihre ersten Fotos hoch.')).toBeInTheDocument()
    })
})