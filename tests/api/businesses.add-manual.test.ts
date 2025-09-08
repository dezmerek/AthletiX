import { vi, describe, test, expect } from "vitest";

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
              .mockResolvedValue({ insertedId: "65f1f77bcf86cd7994390114" }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/businesses/add-manual POST", () => {
  test("400 when missing required fields", async () => {
    const { POST } = await import("@/app/api/businesses/add-manual/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/add-manual", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("404 when owner not found", async () => {
    const { POST } = await import("@/app/api/businesses/add-manual/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/add-manual", {
        method: "POST",
        body: JSON.stringify({
          name: "Gym",
          email: "e@e.pl",
          ownerId: "507f1f77bcf86cd799439099",
        }),
      }) as any
    );
    expect(res.status).toBe(404);
  });

  test("400 when business already exists", async () => {
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client: any = await clientPromise;
    collections["users"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439099" }),
    };
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };

    const { POST } = await import("@/app/api/businesses/add-manual/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/add-manual", {
        method: "POST",
        body: JSON.stringify({
          name: "Gym",
          email: "e@e.pl",
          ownerId: "507f1f77bcf86cd799439099",
        }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("200 when created", async () => {
    collections["users"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439099" }),
    };
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ insertedId: "b2" }),
    };
    const { POST } = await import("@/app/api/businesses/add-manual/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/add-manual", {
        method: "POST",
        body: JSON.stringify({
          name: "Gym",
          email: "e@e.pl",
          ownerId: "507f1f77bcf86cd799439099",
        }),
      }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
