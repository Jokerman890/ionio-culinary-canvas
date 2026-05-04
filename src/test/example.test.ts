import { describe, it, expect } from "vitest";
import { getPasswordMinLengthMessage, getPasswordMinLengthPlaceholder, isPasswordLongEnough } from "@/lib/passwordPolicy";

describe("password policy copy", () => {
  it("keeps reset/auth copy aligned with the shared 8 character policy", () => {
    expect(isPasswordLongEnough("1234567")).toBe(false);
    expect(isPasswordLongEnough("12345678")).toBe(true);
    expect(getPasswordMinLengthMessage()).toContain("8 Zeichen");
    expect(getPasswordMinLengthPlaceholder()).toBe("Mindestens 8 Zeichen");
  });
});
