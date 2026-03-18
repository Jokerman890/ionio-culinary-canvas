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
const createDataResponse = (data: unknown[]) => ({ data, error: null });

describe("AdminDashboard", () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({ isAdmin: true });
    mockFrom.mockReset();
  });

  it("lädt Statistiken und zeigt die Werte an", async () => {
    const responseQueue = [
      Promise.resolve(createCountResponse(12)),   // menu_items count
      Promise.resolve(createCountResponse(4)),     // menu_categories count
      Promise.resolve(createCountResponse(7)),     // gallery_images count
      Promise.resolve(createCountResponse(3)),     // user_roles count
      Promise.resolve(createDataResponse([])),     // weekly_offers data
      Promise.resolve(createCountResponse(0)),     // unavailable items
      Promise.resolve(createCountResponse(0)),     // hidden images
    ];

    mockFrom.mockReturnValue({
      select: vi.fn(() => {
        const p = responseQueue.shift() ?? Promise.resolve(createCountResponse(0));
        return Object.assign(p, {
          order: vi.fn(() => p),
          eq: vi.fn(() => p),
        });
      }),
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
      Promise.resolve(createDataResponse([])),
      Promise.resolve(createCountResponse(0)),
      Promise.resolve(createCountResponse(0)),
    ];

    mockFrom.mockReturnValue({
      select: vi.fn(() => {
        const p = responseQueue.shift() ?? Promise.resolve(createCountResponse(0));
        return Object.assign(p, {
          order: vi.fn(() => p),
          eq: vi.fn(() => p),
        });
      }),
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
