import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

const findMock = vi.fn();
const updateManyMock = vi.fn();

vi.mock("@/models/Message", () => ({
  __esModule: true,
  default: {
    find: (...args: any[]) => ({
      sort: () => ({ limit: () => findMock(...args) }),
    }),
    updateMany: updateManyMock,
  },
}));

describe("/api/messaging/messages GET", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/messaging/messages/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/messages") as any
    );
    expect(res.status).toBe(401);
  });

  test("400 when otherUserId missing", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
    });
    const { GET } = await import("@/app/api/messaging/messages/route");
    const res = await GET(
      new Request("http://localhost/api/messaging/messages") as any
    );
    expect(res.status).toBe(400);
  });

  test("200 returns messages and marks read", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
    });

    findMock.mockResolvedValueOnce([{ _id: "m1", content: "hi" }]);

    const { GET } = await import("@/app/api/messaging/messages/route");
    const res = await GET(
      new Request(
        "http://localhost/api/messaging/messages?otherUserId=507f1f77bcf86cd799439099"
      ) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.messages)).toBe(true);
  });
});

describe("/api/messaging/messages POST", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/messaging/messages/route");
    const res = await POST(
      new Request("http://localhost/api/messaging/messages", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("400 when receiverId/content missing", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
    });
    const { POST } = await import("@/app/api/messaging/messages/route");
    const res = await POST(
      new Request("http://localhost/api/messaging/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: "507f1f77bcf86cd799439099",
          content: "   ",
        }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("201 when valid payload", async () => {
    vi.resetModules();
    // Re-mock auth and connectMongoose
    vi.doMock("@/auth", () => ({
      auth: vi
        .fn()
        .mockResolvedValue({
          user: { id: "507f1f77bcf86cd799439011", email: "me@example.com" },
        }),
    }));
    vi.doMock("@/lib/mongoose", () => ({
      __esModule: true,
      default: vi.fn().mockResolvedValue(undefined),
    }));
    // Mock Message as a constructible class with save()
    const saveMock = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/models/Message", () => ({
      __esModule: true,
      default: function Message(this: any, data: any) {
        Object.assign(this, data);
        this.save = saveMock;
        return this;
      },
    }));

    const { POST } = await import("@/app/api/messaging/messages/route");
    const res = await POST(
      new Request("http://localhost/api/messaging/messages", {
        method: "POST",
        body: JSON.stringify({
          receiverId: "507f1f77bcf86cd799439099",
          content: "Hello",
        }),
      }) as any
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBeDefined();
  });
});
