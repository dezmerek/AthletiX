import { vi, describe, test, expect, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: (name: string) => ({
        find: vi
          .fn()
          .mockReturnValue({
            sort: () => ({ toArray: () => Promise.resolve([]) }),
          }),
        findOne: vi.fn().mockResolvedValue(null),
        insertOne: vi
          .fn()
          .mockResolvedValue({ insertedId: "64f1f77bcf86cd7994390111" }),
        updateOne: vi
          .fn()
          .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      }),
    }),
  }),
}));

describe("/api/business", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("GET returns 400 for invalid ownerId format", async () => {
    const { GET } = await import("@/app/api/business/route");
    const res = await GET(
      new Request("http://localhost/api/business?ownerId=invalid")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid ownerId format" });
  });

  test("POST validates required fields", async () => {
    const { POST } = await import("@/app/api/business/route");
    const res = await POST(
      new Request("http://localhost/api/business", {
        method: "POST",
        body: JSON.stringify({ name: "", email: "", ownerId: "" }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("POST creates business and updates user", async () => {
    const { POST } = await import("@/app/api/business/route");
    const res = await POST(
      new Request("http://localhost/api/business", {
        method: "POST",
        body: JSON.stringify({
          name: "Gym",
          email: "g@g.com",
          ownerId: "507f1f77bcf86cd799439011",
        }),
      }) as any
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.business).toBeDefined();
    expect(data.message).toBe("Business created successfully");
  });
});
