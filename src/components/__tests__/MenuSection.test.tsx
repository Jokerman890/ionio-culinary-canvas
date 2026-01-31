import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MenuSection } from "@/components/MenuSection";

vi.mock("@/hooks/useScrollReveal", () => ({
  useScrollReveal: () => ({ ref: vi.fn(), isRevealed: true }),
}));

const mockRefetch = vi.fn();
const useMenuDataMock = vi.fn(() => ({
  itemsByCategory: [],
  weeklyOffers: [],
  loading: false,
  error: null,
  refetch: mockRefetch,
}));

vi.mock("@/hooks/useMenuData", () => ({
  useMenuData: useMenuDataMock,
}));

describe("MenuSection", () => {
  beforeEach(() => {
    mockRefetch.mockClear();
  });

  it("renders fallback menu data when no database data is available", () => {
    render(<MenuSection />);

    expect(screen.getByRole("heading", { name: /unsere speisekarte/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /vorspeisen/i })).toBeInTheDocument();
    expect(screen.getByText(/tzatziki/i)).toBeInTheDocument();
  });

  it("shows an error alert and retries when requested", async () => {
    useMenuDataMock.mockReturnValueOnce({
      itemsByCategory: [],
      weeklyOffers: [],
      loading: false,
      error: "Load failed",
      refetch: mockRefetch,
    });

    render(<MenuSection />);

    expect(
      screen.getByText(/speisekarte konnte nicht geladen werden/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /erneut versuchen/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
