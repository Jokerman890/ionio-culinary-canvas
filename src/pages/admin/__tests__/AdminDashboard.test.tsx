import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const mockUseAuthContext = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const createCountResponse = (count: number) => ({ count, error: null });

describe("AdminDashboard", () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });
    mockFrom.mockReset();
  });

  it("lädt Statistiken und zeigt die Werte an", async () => {
    const responseQueue = [
      Promise.resolve(createCountResponse(12)),
      Promise.resolve(createCountResponse(4)),
      Promise.resolve(createCountResponse(7)),
      Promise.resolve(createCountResponse(3)),
    ];

    mockFrom.mockReturnValue({
      select: vi.fn(() => responseQueue.shift()),
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("12")).toBeInTheDocument());
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("blendet Mitarbeiter-Karte aus, wenn kein Admin", async () => {
    mockUseAuthContext.mockReturnValue({ isAdmin: false });
    const responseQueue = [
      Promise.resolve(createCountResponse(1)),
      Promise.resolve(createCountResponse(1)),
      Promise.resolve(createCountResponse(1)),
    ];

    mockFrom.mockReturnValue({
      select: vi.fn(() => responseQueue.shift()),
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getAllByText("1").length).toBeGreaterThan(0));
    expect(screen.queryByText(/mitarbeiter/i)).not.toBeInTheDocument();
  });
});
