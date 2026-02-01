import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminWeeklyOffers } from "@/components/admin/AdminWeeklyOffers";

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("AdminWeeklyOffers", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("lädt Angebote und rendert die Karten", async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          position: 1,
          name: "Angebot 1",
          description: null,
          price: 10,
          original_price: null,
          is_active: true,
          valid_from: null,
          valid_until: null,
        },
        {
          id: "2",
          position: 2,
          name: "Angebot 2",
          description: null,
          price: 12,
          original_price: null,
          is_active: false,
          valid_from: null,
          valid_until: null,
        },
        {
          id: "3",
          position: 3,
          name: "Angebot 3",
          description: null,
          price: 15,
          original_price: null,
          is_active: true,
          valid_from: null,
          valid_until: null,
        },
      ],
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: mockSelect,
      })),
      insert: vi.fn(() => ({ select: vi.fn() })),
    });

    render(<AdminWeeklyOffers />);

    await waitFor(() => expect(screen.getByText(/angebot 1/i)).toBeInTheDocument());
    expect(screen.getByText(/angebot 2/i)).toBeInTheDocument();
    expect(screen.getByText(/angebot 3/i)).toBeInTheDocument();
  });

  it("validiert Eingaben vor dem Speichern", async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          position: 1,
          name: "Angebot 1",
          description: null,
          price: 10,
          original_price: null,
          is_active: true,
          valid_from: null,
          valid_until: null,
        },
        {
          id: "2",
          position: 2,
          name: "Angebot 2",
          description: null,
          price: 12,
          original_price: null,
          is_active: false,
          valid_from: null,
          valid_until: null,
        },
        {
          id: "3",
          position: 3,
          name: "Angebot 3",
          description: null,
          price: 15,
          original_price: null,
          is_active: true,
          valid_from: null,
          valid_until: null,
        },
      ],
      error: null,
    });

    const updateMock = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: mockSelect,
      })),
      insert: vi.fn(() => ({ select: vi.fn() })),
      update: vi.fn(() => ({ eq: updateMock })),
    });

    render(<AdminWeeklyOffers />);

    await waitFor(() => expect(screen.getByText(/angebot 1/i)).toBeInTheDocument());

    const nameInputs = screen.getAllByLabelText(/gerichtname/i);
    fireEvent.change(nameInputs[0], { target: { value: "" } });

    fireEvent.click(screen.getAllByRole("button", { name: /speichern/i })[0]);

    await waitFor(() =>
      expect(screen.getByText(/name erforderlich/i)).toBeInTheDocument(),
    );
    expect(updateMock).not.toHaveBeenCalled();
  });
});
