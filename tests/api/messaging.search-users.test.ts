import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

const selectMock = vi
  .fn()
  .mockReturnValue({ limit: vi.fn().mockResolvedValue([]) });

vi.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    find: vi
      .fn()
      .mockReturnValue({
        select: () => ({ limit: () => Promise.resolve([]) }),
      }),
  },
}));

describe("/api/messaging/search-users GET", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/messaging/search-users/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/search-users?q=ab") as any
    );
    expect(res.status).toBe(401);
  });

  test("200 returns empty array for short query", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
    });
    const { GET } = await import("@/app/api/messaging/search-users/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/search-users?q=a") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.users)).toBe(true);
    expect(json.users.length).toBe(0);
  });

  test("200 returns users when query valid", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
    });
    const { default: User } = await import("@/models/User");
    (User.find as unknown as vi.Mock).mockReturnValueOnce({
      select: vi
        .fn()
        .mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ _id: "u2", name: "Jane", email: "j@e.com" }]),
        }),
    });
    const { GET } = await import("@/app/api/messaging/search-users/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/search-users?q=ja") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.users.length).toBe(1);
  });
});
