import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "@/hooks/useAuth";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockInvoke = vi.hoisted(() => vi.fn());
const mockSetSession = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      setSession: (...args: unknown[]) => mockSetSession(...args),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockGetSession.mockReset();
    mockFrom.mockReset();
    mockInvoke.mockReset();
    mockSetSession.mockReset();
  });

  it("setzt Rolle und Auth-Status aus vorhandener Session", async () => {
    const mockSession = { user: { id: "user-1" } };
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });

    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null });
    const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    mockFrom.mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe("admin");
    expect(result.current.isAdmin).toBe(true);
  });

  it("setzt Status korrekt wenn keine Session vorhanden ist", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockFrom.mockReturnValue({ select: vi.fn() });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBe(null);
  });

  it("übernimmt die Session nach erfolgreichem Passwort-Login", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockFrom.mockReturnValue({ select: vi.fn() });
    mockInvoke.mockResolvedValue({
      data: {
        data: {
          session: {
            access_token: "access-token",
            refresh_token: "refresh-token",
          },
        },
      },
      error: null,
    });
    mockSetSession.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const response = await result.current.signIn("admin@test.de", "secret123");
      expect(response.error).toBe(null);
    });

    expect(mockInvoke).toHaveBeenCalledWith("login-rate-limited", {
      body: { email: "admin@test.de", password: "secret123" },
    });
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: "access-token",
      refresh_token: "refresh-token",
    });
  });

  it("liest Fehlermeldungen aus non-2xx Edge-Function-Antworten", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockFrom.mockReturnValue({ select: vi.fn() });

    const response = new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
    mockInvoke.mockResolvedValue({
      data: null,
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: response,
      },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const signInResponse = await result.current.signIn("admin@test.de", "wrong-password");
      expect(signInResponse.error?.message).toBe("Invalid credentials");
    });
  });
});
