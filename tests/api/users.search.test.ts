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
            find: vi
              .fn()
              .mockReturnValue({
                limit: () => ({ toArray: () => Promise.resolve([]) }),
              }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/users/search GET", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/users/search/route");
    const res = await GET(
      new Request("http://localhost/api/users/search?q=ab") as any
    );
    expect(res.status).toBe(401);
  });

  test("403 when not professional nor admin", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["user"] },
    });
    const { GET } = await import("@/app/api/users/search/route");
    const res = await GET(
      new Request("http://localhost/api/users/search?q=ab") as any
    );
    expect(res.status).toBe(403);
  });

  test("400 when query too short", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["professional"] },
    });
    const { GET } = await import("@/app/api/users/search/route");
    const res = await GET(
      new Request("http://localhost/api/users/search?q=a") as any
    );
    expect(res.status).toBe(400);
  });

  test("200 returns users when valid", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["professional"] },
    });
    collections["users"] = {
      find: vi
        .fn()
        .mockReturnValue({
          limit: () => ({
            toArray: () =>
              Promise.resolve([{ _id: "u2", name: "User", email: "u@e.com" }]),
          }),
        }),
    };
    const { GET } = await import("@/app/api/users/search/route");
    const res = await GET(
      new Request("http://localhost/api/users/search?q=us&limit=1") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.users.length).toBe(1);
  });
});
