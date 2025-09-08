import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        aggregate: () => ({ toArray: () => Promise.resolve([]) }),
      }),
    }),
  }),
}));

describe("/api/professional/plans GET", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/professional/plans/route");
    const res = await GET(
      new Request("http://localhost/api/professional/plans")
    );
    expect(res.status).toBe(401);
  });

  test("403 when not professional nor admin", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "u1", role: ["user"] },
    });
    const { GET } = await import("@/app/api/professional/plans/route");
    const res = await GET(
      new Request("http://localhost/api/professional/plans")
    );
    expect(res.status).toBe(403);
  });
});
