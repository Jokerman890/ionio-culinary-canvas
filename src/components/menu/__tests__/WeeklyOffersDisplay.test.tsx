import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WeeklyOffersDisplay } from "@/components/menu/WeeklyOffersDisplay";

describe("WeeklyOffersDisplay", () => {
  it("renders nothing when no offers are provided", () => {
    const { container } = render(<WeeklyOffersDisplay offers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders offer cards with pricing and discount badge", () => {
    render(
      <WeeklyOffersDisplay
        offers={[
          {
            id: "1",
            position: 1,
            name: "Gyros Spezial",
            description: "Mit Tzatziki",
            price: 12.9,
            original_price: 15.9,
            is_active: true,
            valid_from: null,
            valid_until: null,
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /wochenangebote/i })).toBeInTheDocument();
    expect(screen.getByText(/angebot 1/i)).toBeInTheDocument();
    expect(screen.getByText(/gyros spezial/i)).toBeInTheDocument();
    expect(screen.getByText(/12,90/i)).toBeInTheDocument();
    expect(screen.getByText(/15,90/i)).toBeInTheDocument();
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });
});
