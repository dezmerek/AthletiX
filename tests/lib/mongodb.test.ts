import { vi, test, expect, beforeEach } from "vitest";

vi.mock("mongodb", () => ({
  MongoClient: vi
    .fn()
    .mockImplementation(() => ({ connect: vi.fn().mockResolvedValue({}) })),
  ServerApiVersion: { v1: "v1" },
}));

beforeEach(() => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/test";
});

test("lib/mongodb exports clientPromise that resolves", async () => {
  const mod = await import("@/lib/mongodb");
  const clientPromise = mod.default as Promise<unknown>;
  await expect(clientPromise).resolves.toBeDefined();
});
