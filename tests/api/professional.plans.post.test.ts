import { vi, describe, test, expect, beforeEach } from "vitest";

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
            insertOne: vi
              .fn()
              .mockResolvedValue({ insertedId: "65f1f77bcf86cd7994390112" }),
            aggregate: vi
              .fn()
              .mockReturnValue({
                toArray: vi
                  .fn()
                  .mockResolvedValue([
                    {
                      _id: "65f1f77bcf86cd7994390112",
                      name: "Plan",
                      type: "strength",
                    },
                  ]),
              }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/professional/plans POST", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const key of Object.keys(collections)) delete collections[key];
  });

  test("400 when required fields missing", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["professional"] },
    });
    const { POST } = await import("@/app/api/professional/plans/route");
    const res = await POST(
      new Request("http://localhost/api/professional/plans", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toContain("Missing required fields");
  });

  test("201 when valid payload and role", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["professional"] },
    });
    const { POST } = await import("@/app/api/professional/plans/route");

    const payload = {
      clientId: "507f1f77bcf86cd799439012",
      name: "Plan A",
      description: "desc",
      type: "strength",
      startDate: new Date().toISOString(),
      goals: {},
    };

    // mock users.findOne to pretend client exists
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client: any = await clientPromise;
    collections["users"] = {
      ...(collections["users"] || {}),
      findOne: vi.fn().mockResolvedValue({ _id: payload.clientId }),
    };

    const res = await POST(
      new Request("http://localhost/api/professional/plans", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBe("Plan created successfully");
    expect(json.plan).toBeDefined();
  });
});
