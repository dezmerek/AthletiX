import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/Message", () => ({
  __esModule: true,
  default: { aggregate: vi.fn().mockResolvedValue([]) },
}));

vi.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findById: vi
      .fn()
      .mockReturnValue({
        select: vi
          .fn()
          .mockResolvedValue({
            _id: "u2",
            name: "John",
            email: "john@example.com",
          }),
      }),
  },
}));

describe("/api/messaging/conversations GET", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/messaging/conversations/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/conversations") as any
    );
    expect(res.status).toBe(401);
  });

  test("200 returns conversations array", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
    });

    const { default: Message } = await import("@/models/Message");
    (Message.aggregate as unknown as vi.Mock).mockResolvedValueOnce([
      {
        _id: "507f1f77bcf86cd799439099",
        lastMessage: { text: "Hi" },
        unreadCount: 1,
      },
    ]);

    const { GET } = await import("@/app/api/messaging/conversations/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/conversations") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.conversations)).toBe(true);
  });
});
