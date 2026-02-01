import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMenuData } from "@/hooks/useMenuData";

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe("useMenuData", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("lädt Kategorien, Items und Angebote", async () => {
    const mockSelect = vi.fn();
    mockSelect
      .mockResolvedValueOnce({ data: [{ id: "c1", name: "Cat", description: null, sort_order: 0 }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "i1", category_id: "c1", name: "Item", description: null, price: 10, allergens: null, is_vegetarian: null, is_available: true, is_popular: null, sort_order: 0 }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "o1", position: 1, name: "Offer", description: null, price: 9, original_price: null, is_active: true, valid_from: null, valid_until: null }], error: null });

    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        order: mockSelect,
        eq: vi.fn(() => ({ order: mockSelect })),
      })),
    }));

    const { result } = renderHook(() => useMenuData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.menuItems).toHaveLength(1);
    expect(result.current.weeklyOffers).toHaveLength(1);
    expect(result.current.itemsByCategory[0]?.items).toHaveLength(1);
  });

  it("setzt Fehler, wenn Supabase fehlschlägt", async () => {
    const mockSelect = vi.fn().mockResolvedValueOnce({ data: null, error: new Error("boom") });

    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        order: mockSelect,
        eq: vi.fn(() => ({ order: mockSelect })),
      })),
    }));

    const { result } = renderHook(() => useMenuData());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
  });
});
