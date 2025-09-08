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
            find: vi.fn().mockReturnValue({
              sort: () => ({ toArray: () => Promise.resolve([]) }),
            }),
            insertOne: vi.fn().mockResolvedValue({ insertedId: "e1" }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/calendar/events", () => {
  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/calendar/events/route");
    const res = await GET(
      new Request("http://localhost/api/calendar/events") as any
    );
    expect(res.status).toBe(401);
  });

  test("GET 200 returns transformed events", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["calendarEvents"] = {
      find: vi.fn().mockReturnValue({
        sort: () => ({
          toArray: () =>
            Promise.resolve([
              {
                _id: "e1",
                title: "Event",
                type: "workout",
                date: new Date("2024-01-02T10:00:00Z"),
                time: "10:00",
                duration: 60,
                description: "desc",
                color: "#10B981",
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
        }),
      }),
    };
    const { GET } = await import("@/app/api/calendar/events/route");
    const res = await GET(
      new Request("http://localhost/api/calendar/events") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(1);
    expect(json.events[0].date).toMatch(/^2024-01-02$/);
  });

  test("POST 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/calendar/events/route");
    const res = await POST(
      new Request("http://localhost/api/calendar/events", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("POST 400 when required fields missing", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { POST } = await import("@/app/api/calendar/events/route");
    const res = await POST(
      new Request("http://localhost/api/calendar/events", {
        method: "POST",
        body: JSON.stringify({ title: "x" }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("POST 201 when valid payload", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { POST } = await import("@/app/api/calendar/events/route");
    collections["calendarEvents"] = {
      insertOne: vi.fn().mockResolvedValue({ insertedId: "e1" }),
    };
    const payload = {
      title: "Event",
      type: "workout",
      date: "2024-01-02",
      time: "10:00",
      duration: 60,
    };
    const res = await POST(
      new Request("http://localhost/api/calendar/events", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.event).toBeDefined();
  });
});
