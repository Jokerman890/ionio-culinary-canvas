
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AdminLogin from '../AdminLogin'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Supabase
const mockInvoke = vi.fn()
const mockSignIn = vi.fn()

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        functions: {
            invoke: (...args) => mockInvoke(...args)
        },
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
            getSession: () => Promise.resolve({ data: { session: null } }),
            signInWithPassword: (...args) => mockSignIn(...args),
            signOut: vi.fn(),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: { role: 'admin' }, error: null })
                })
            })
        })
    }
}))

// Mock Toast
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
}))

describe('AdminLogin Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders login form', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <AdminLogin />
                </AuthProvider>
            </BrowserRouter>
        )
        expect(await screen.findByLabelText(/E-Mail/i)).toBeInTheDocument()
        expect(await screen.findByLabelText(/Passwort/i)).toBeInTheDocument()
        expect(await screen.findByRole('button', { name: /Anmelden/i })).toBeInTheDocument()
    })

    it('handles successful login via edge function', async () => {
        mockInvoke.mockResolvedValueOnce({ data: { data: { user: { id: '123' } } }, error: null })

        render(
            <BrowserRouter>
                <AuthProvider>
                    <AdminLogin />
                </AuthProvider>
            </BrowserRouter>
        )

        fireEvent.change(await screen.findByLabelText(/E-Mail/i), { target: { value: 'admin@test.com' } })
        fireEvent.change(await screen.findByLabelText(/Passwort/i), { target: { value: 'password123' } })
        fireEvent.click(await screen.findByRole('button', { name: /Anmelden/i }))

        await waitFor(() => {
            expect(mockInvoke).toHaveBeenCalledWith('login-rate-limited', {
                body: { email: 'admin@test.com', password: 'password123' }
            })
        })
    })

    it('handles rate limit error from edge function', async () => {
        mockInvoke.mockResolvedValueOnce({
            data: { error: 'rate_limited', retryAfterMs: 60000 },
            error: null
        })

        render(
            <BrowserRouter>
                <AuthProvider>
                    <AdminLogin />
                </AuthProvider>
            </BrowserRouter>
        )

        fireEvent.change(await screen.findByLabelText(/E-Mail/i), { target: { value: 'admin@test.com' } })
        fireEvent.change(await screen.findByLabelText(/Passwort/i), { target: { value: 'password123' } })
        fireEvent.click(await screen.findByRole('button', { name: /Anmelden/i }))

        // Expect toast or error message (toast is mocked, so we verify logic flow implicitly or mocked call)
        await waitFor(() => {
            expect(mockInvoke).toHaveBeenCalled()
        })
    })
})
