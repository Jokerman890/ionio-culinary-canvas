import { describe, it, expect } from "vitest";
import { PASSWORD_MIN_LENGTH, isPasswordLongEnough } from "./passwordPolicy";

describe("Password Policy", () => {
  it("should require minimum 8 characters", () => {
    // Valid passwords
    expect(isPasswordLongEnough("12345678")).toBe(true);
    expect(isPasswordLongEnough("password")).toBe(true);
    expect(isPasswordLongEnough("SecurePass123")).toBe(true);
    
    // Invalid passwords (too short)
    expect(isPasswordLongEnough("1234567")).toBe(false);
    expect(isPasswordLongEnough("short")).toBe(false);
    expect(isPasswordLongEnough("")).toBe(false);
  });

  it("documents the shared minimum length", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });
});

describe("Email Validation", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  it("should validate correct email formats", () => {
    expect(emailRegex.test("user@example.com")).toBe(true);
    expect(emailRegex.test("admin@ionio-ganderkesee.de")).toBe(true);
    expect(emailRegex.test("test.user@domain.org")).toBe(true);
  });
  
  it("should reject invalid email formats", () => {
    expect(emailRegex.test("invalid")).toBe(false);
    expect(emailRegex.test("@nodomain.com")).toBe(false);
    expect(emailRegex.test("noat.domain.com")).toBe(false);
    expect(emailRegex.test("")).toBe(false);
  });
});
