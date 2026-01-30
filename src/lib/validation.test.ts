import { describe, it, expect } from "vitest";

describe("Password Policy", () => {
  it("should require minimum 8 characters", () => {
    const minLength = 8;
    
    // Valid passwords
    expect("12345678".length >= minLength).toBe(true);
    expect("password".length >= minLength).toBe(true);
    expect("SecurePass123".length >= minLength).toBe(true);
    
    // Invalid passwords (too short)
    expect("1234567".length >= minLength).toBe(false);
    expect("short".length >= minLength).toBe(false);
    expect("".length >= minLength).toBe(false);
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
