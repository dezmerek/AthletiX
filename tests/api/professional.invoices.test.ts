import { vi, describe, test, expect } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/mongodb", () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: () => ({
        find: () => ({ sort: () => ({ toArray: () => Promise.resolve([]) }) }),
        countDocuments: () => Promise.resolve(0),
        insertOne: () => Promise.resolve({ insertedId: "inv1" }),
      }),
    }),
  }),
}));

describe("/api/professional/invoices", () => {
  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/professional/invoices/route");
    const res = await GET(
      new Request("http://localhost/api/professional/invoices") as any
    );
    expect(res.status).toBe(401);
  });

  test("GET 403 when not professional", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439011",
        role: ["user"],
        activeContext: "user",
      },
    });
    const { GET } = await import("@/app/api/professional/invoices/route");
    const res = await GET(
      new Request("http://localhost/api/professional/invoices") as any
    );
    expect(res.status).toBe(403);
  });

  test("GET 200 when professional", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["professional"] },
    });
    const { GET } = await import("@/app/api/professional/invoices/route");
    const res = await GET(
      new Request("http://localhost/api/professional/invoices") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.invoices).toBeDefined();
  });

  test("POST 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/professional/invoices/route");
    const res = await POST(
      new Request("http://localhost/api/professional/invoices", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("POST 403 when not professional", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439011",
        role: ["user"],
        activeContext: "user",
      },
    });
    const { POST } = await import("@/app/api/professional/invoices/route");
    const res = await POST(
      new Request("http://localhost/api/professional/invoices", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any
    );
    expect(res.status).toBe(403);
  });

  test("POST 200 when professional", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011", role: ["professional"] },
    });
    const { POST } = await import("@/app/api/professional/invoices/route");
    const payload = {
      customerName: "K",
      customerEmail: "k@k.pl",
      amount: "100",
      dueDate: new Date().toISOString(),
      items: [],
    };
    const res = await POST(
      new Request("http://localhost/api/professional/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.invoice).toBeDefined();
  });
});
