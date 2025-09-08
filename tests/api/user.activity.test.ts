import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const collections: Record<string, any> = {};

vi.mock("@/lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: (name: string) => {
        if (!collections[name]) {
          collections[name] = {
            updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
            find: vi
              .fn()
              .mockReturnValue({
                limit: () => ({
                  sort: () => ({ toArray: () => Promise.resolve([]) }),
                }),
              }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/user/activity", () => {
  test("POST 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/user/activity/route");
    const res = await POST(
      new Request("http://localhost/api/user/activity", {
        method: "POST",
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("POST 200 updates activity with or without body", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { POST } = await import("@/app/api/user/activity/route");
    const res = await POST(
      new Request("http://localhost/api/user/activity", {
        method: "POST",
        body: "",
      }) as any
    );
    expect(res.status).toBe(200);
  });

  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/user/activity/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  test("GET 200 returns online and recent users", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    // mock users returned by find -> toArray
    collections["users"] = {
      find: vi.fn().mockReturnValue({
        limit: () => ({
          sort: () => ({
            toArray: () =>
              Promise.resolve([
                {
                  _id: "u1",
                  email: "a@b.com",
                  lastActivity: new Date(),
                  isOnline: true,
                },
                {
                  _id: "u2",
                  email: "c@d.com",
                  lastActivity: new Date(Date.now() - 10 * 60 * 1000),
                  isOnline: false,
                },
              ]),
          }),
        }),
      }),
    };
    const { GET } = await import("@/app/api/user/activity/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.totalOnline).toBeGreaterThanOrEqual(1);
  });
});
