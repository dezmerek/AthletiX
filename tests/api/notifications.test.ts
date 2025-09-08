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
            aggregate: vi
              .fn()
              .mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
            countDocuments: vi.fn().mockResolvedValue(0),
            updateMany: vi.fn().mockResolvedValue({ modifiedCount: 3 }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/notifications", () => {
  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET(
      new Request("http://localhost/api/notifications") as any
    );
    expect(res.status).toBe(401);
  });

  test("GET 200 returns pagination and unreadCount", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["notifications"] = {
      aggregate: vi
        .fn()
        .mockReturnValue({
          toArray: vi.fn().mockResolvedValue([{ _id: "n1" }]),
        }),
      countDocuments: vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(1),
    };
    const { GET } = await import("@/app/api/notifications/route");
    const res = await GET(
      new Request("http://localhost/api/notifications?page=1&limit=1") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notifications.length).toBe(1);
    expect(json.pagination.total).toBe(1);
    expect(json.unreadCount).toBe(1);
  });

  test("PATCH 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/notifications/route");
    const res = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("PATCH 400 on invalid body", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { PATCH } = await import("@/app/api/notifications/route");
    const res = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("PATCH markAll true updates notifications", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["notifications"] = {
      updateMany: vi.fn().mockResolvedValue({ modifiedCount: 5 }),
    };
    const { PATCH } = await import("@/app/api/notifications/route");
    const res = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.modifiedCount).toBe(5);
  });

  test("PATCH with ids updates specific notifications", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["notifications"] = {
      updateMany: vi.fn().mockResolvedValue({ modifiedCount: 2 }),
    };
    const { PATCH } = await import("@/app/api/notifications/route");
    const res = await PATCH(
      new Request("http://localhost/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationIds: ["507f1f77bcf86cd799439012"] }),
      }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.modifiedCount).toBe(2);
  });
});
