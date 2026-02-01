import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "@/hooks/useAuth";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
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
});
