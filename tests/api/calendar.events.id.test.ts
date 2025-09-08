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
            findOne: vi.fn().mockResolvedValue(null),
            updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
            deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/calendar/events/[id]", () => {
  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/calendar/events/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011"
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(401);
  });

  test("GET 400 invalid id", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    const { GET } = await import("@/app/api/calendar/events/[id]/route");
    const res = await GET(
      new Request("http://localhost/api/calendar/events/invalid") as any,
      { params: { id: "invalid" } } as any
    );
    expect(res.status).toBe(400);
  });

  test("GET 404 when not found", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["calendarEvents"] = {
      findOne: vi.fn().mockResolvedValue(null),
    };
    const { GET } = await import("@/app/api/calendar/events/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011"
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(404);
  });

  test("GET 200 returns event", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["calendarEvents"] = {
      findOne: vi
        .fn()
        .mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          title: "t",
          type: "workout",
          date: new Date("2024-01-02T00:00:00Z"),
          time: "10:00",
          duration: 60,
          description: "",
          color: "#10B981",
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    };
    const { GET } = await import("@/app/api/calendar/events/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011"
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.event).toBeDefined();
  });

  test("PUT 400 invalid id", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    const { PUT } = await import("@/app/api/calendar/events/[id]/route");
    const res = await PUT(
      new Request("http://localhost/api/calendar/events/invalid", {
        method: "PUT",
        body: JSON.stringify({
          title: "t",
          type: "workout",
          date: "2024-01-02",
          time: "10:00",
        }),
      }) as any,
      { params: { id: "invalid" } } as any
    );
    expect(res.status).toBe(400);
  });

  test("PUT 404 when not found", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["calendarEvents"] = {
      updateOne: vi.fn().mockResolvedValue({ matchedCount: 0 }),
    };
    const { PUT } = await import("@/app/api/calendar/events/[id]/route");
    const res = await PUT(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011",
        {
          method: "PUT",
          body: JSON.stringify({
            title: "t",
            type: "workout",
            date: "2024-01-02",
            time: "10:00",
          }),
        }
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(404);
  });

  test("PUT 200 when updated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["calendarEvents"] = {
      updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
      findOne: vi
        .fn()
        .mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          title: "t",
          type: "workout",
          date: new Date("2024-01-02T00:00:00Z"),
          time: "10:00",
          duration: 60,
          description: "",
          color: "#10B981",
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    };
    const { PUT } = await import("@/app/api/calendar/events/[id]/route");
    const res = await PUT(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011",
        {
          method: "PUT",
          body: JSON.stringify({
            title: "t",
            type: "workout",
            date: "2024-01-02",
            time: "10:00",
          }),
        }
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(200);
  });

  test("DELETE 200 when deleted", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["calendarEvents"] = {
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const { DELETE } = await import("@/app/api/calendar/events/[id]/route");
    const res = await DELETE(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011",
        { method: "DELETE" }
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(200);
  });

  test("PATCH 200 toggles completion", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["calendarEvents"] = {
      findOne: vi
        .fn()
        .mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          completed: false,
        }),
      updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    const { PATCH } = await import("@/app/api/calendar/events/[id]/route");
    const res = await PATCH(
      new Request(
        "http://localhost/api/calendar/events/507f1f77bcf86cd799439011",
        { method: "PATCH" }
      ) as any,
      { params: { id: "507f1f77bcf86cd799439011" } } as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.event.completed).toBe(true);
  });
});
