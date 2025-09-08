import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const dbMock = {
  collection: (name: string) => ({
    findOne: vi.fn().mockResolvedValue(null),
    insertOne: vi
      .fn()
      .mockResolvedValue({ insertedId: "65f1f77bcf86cd7994390113" }),
  }),
};

vi.mock("@/lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({ db: () => dbMock }),
}));

describe("/api/businesses/create POST", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/businesses/create/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/create", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("400 when missing required fields", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { POST } = await import("@/app/api/businesses/create/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/create", {
        method: "POST",
        body: JSON.stringify({ email: "e@e.pl" }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("400 when business exists", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { default: clientPromise } = await import("@/lib/mongodb");
    const client: any = await clientPromise;
    vi.spyOn(client.db(), "collection").mockReturnValueOnce({
      findOne: vi.fn().mockResolvedValue({ _id: "x" }),
    } as any);

    const { POST } = await import("@/app/api/businesses/create/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/create", {
        method: "POST",
        body: JSON.stringify({ name: "Gym", email: "e@e.pl" }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("200 when created successfully", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { POST } = await import("@/app/api/businesses/create/route");
    const res = await POST(
      new Request("http://localhost/api/businesses/create", {
        method: "POST",
        body: JSON.stringify({ name: "Gym", email: "e@e.pl" }),
      }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
