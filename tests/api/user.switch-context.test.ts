import { vi, describe, test, expect, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        findOne: vi.fn().mockResolvedValue({ _id: "u1", role: ["user"] }),
        updateOne: vi
          .fn()
          .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      }),
    }),
  }),
}));

describe("POST /api/user/switch-context", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("returns 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);

    const { POST } = await import("@/app/api/user/switch-context/route");
    const res = await POST(
      new Request("http://localhost/api/user/switch-context", {
        method: "POST",
        body: JSON.stringify({ activeContext: "user" }),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("returns 400 for invalid context", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });

    const { POST } = await import("@/app/api/user/switch-context/route");
    const res = await POST(
      new Request("http://localhost/api/user/switch-context", {
        method: "POST",
        body: JSON.stringify({ activeContext: "invalid" }),
      }) as any
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toContain("Invalid context");
  });

  test("returns 403 when lacking role for professional context", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });

    const { default: clientPromise } = await import("@/lib/mongodb");
    const client: any = await clientPromise;
    // mock user with only 'user' role
    vi.spyOn(client.db().collection("users"), "findOne").mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      role: ["user"],
    });

    const { POST } = await import("@/app/api/user/switch-context/route");
    const res = await POST(
      new Request("http://localhost/api/user/switch-context", {
        method: "POST",
        body: JSON.stringify({ activeContext: "professional" }),
      }) as any
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(String(json.error)).toContain("don't have permission");
  });
});
