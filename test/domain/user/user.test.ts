import { describe, expect, it } from "vitest";
import { User } from "@/domain/user";

function makeProps(overrides: Partial<Parameters<typeof User.create>[0]> = {}) {
  return {
    id: "usr-1",
    email: "user@example.com",
    passwordHash: "$2a$10$hash",
    role: "user" as const,
    language: "es" as const,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("User", () => {
  it("creates a valid user", () => {
    const u = User.create(makeProps());
    expect(u.language).toBe("es");
  });

  it("rejects invalid email", () => {
    expect(() => User.create(makeProps({ email: "not-an-email" }))).toThrow(/email/);
  });

  it("rejects unsupported language", () => {
    expect(() => User.create(makeProps({ language: "fr" as never }))).toThrow(
      /language/,
    );
  });

  it("accepts en language", () => {
    const u = User.create(makeProps({ language: "en" }));
    expect(u.language).toBe("en");
  });
});
