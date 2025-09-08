import { vi, test, expect, beforeEach, afterEach } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

test("throws when STRIPE_SECRET_KEY is missing", async () => {
  process.env.STRIPE_SECRET_KEY = "" as any;
  await expect(import("@/lib/stripe")).rejects.toThrow(
    /STRIPE_SECRET_KEY is not set/
  );
});

test("exports stripe instance and constants when key is set", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_123";
  const mod = await import("@/lib/stripe");
  expect(mod.stripe).toBeDefined();
  expect(mod.STRIPE_PRODUCTS).toBeDefined();
  expect(mod.STRIPE_PRICES).toBeDefined();
});
