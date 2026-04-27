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
    it('rendert den Standardbild-Import-State wenn keine Galerie-Bilder vorhanden sind', async () => {
        mockFrom.mockReturnValue({
            select: () => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        })

        render(<AdminGallery />)

        await waitFor(() => expect(screen.getByText('Galerie')).toBeInTheDocument())
        expect(screen.getByText('Verwalten Sie die Bilder, die auf der Website angezeigt werden.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Aktualisieren' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Bild hinzufügen' })).toBeInTheDocument()
        expect(screen.getByText('Die aktuellen Standard-Bilder der Website. Importieren Sie diese, um sie bearbeiten und austauschen zu können.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Standardbilder importieren' })).toBeInTheDocument()
        expect(screen.getByText('Restaurant Innenraum')).toBeInTheDocument()
        expect(screen.getByText('Griechischer Salat')).toBeInTheDocument()
        expect(screen.getByText('Grill')).toBeInTheDocument()
        expect(screen.getByText('Lammkoteletts')).toBeInTheDocument()
        expect(screen.getByText('Baklava')).toBeInTheDocument()
        expect(screen.getByText('Gegrillter Fisch')).toBeInTheDocument()
        expect(screen.getByText('Die sichtbaren Bilder werden in der Galerie auf der Website angezeigt. Solange keine Bilder hochgeladen sind, werden Standard-Bilder verwendet.')).toBeInTheDocument()
    })
})
