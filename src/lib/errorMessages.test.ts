import { describe, it, expect } from "vitest";
import { getUserFriendlyError } from "@/lib/errorMessages";

describe("errorMessages", () => {
  describe("getUserFriendlyError", () => {
    it("should return friendly message for duplicate key error", () => {
      const error = new Error("duplicate key value violates unique constraint");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Dieser Eintrag existiert bereits");
    });

    it("should return friendly message for foreign key violation", () => {
      const error = new Error("foreign key violation on table menu_items");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Dieser Eintrag kann nicht gelöscht werden, da er noch verwendet wird");
    });

    it("should return friendly message for permission denied", () => {
      const error = new Error("permission denied for table user_roles");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Keine Berechtigung für diese Aktion");
    });

    it("should return friendly message for RLS violation", () => {
      const error = new Error("new row violates row-level security policy");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Keine Berechtigung für diese Aktion");
    });

    it("should return friendly message for invalid login", () => {
      const error = new Error("Invalid login credentials");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Ungültige Anmeldedaten");
    });

    it("should return friendly message for user already registered", () => {
      const error = new Error("User already registered");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Diese E-Mail ist bereits registriert");
    });

    it("should return friendly message for network error", () => {
      const error = new Error("Failed to fetch");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung");
    });

    it("should return generic message for unknown errors", () => {
      const error = new Error("Some unknown error happened");
      const result = getUserFriendlyError(error);
      expect(result).toBe("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    });

    it("should handle string errors", () => {
      const result = getUserFriendlyError("duplicate key error");
      expect(result).toBe("Dieser Eintrag existiert bereits");
    });

    it("should handle null/undefined errors", () => {
      const result = getUserFriendlyError(null);
      expect(result).toBe("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    });
  });
});
