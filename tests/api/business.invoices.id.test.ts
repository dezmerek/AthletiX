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

describe("/api/business/invoices/[id]", () => {
  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/business/invoices/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011"
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(401);
  });

  test("GET 400 for invalid id", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    const { GET } = await import("@/app/api/business/invoices/[id]/route");
    const res = await GET(
      new Request("http://localhost/api/business/invoices/invalid"),
      { params: Promise.resolve({ id: "invalid" }) } as any
    );
    expect(res.status).toBe(400);
  });

  test("GET 404 when no business", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["businesses"] = { findOne: vi.fn().mockResolvedValue(null) };
    const { GET } = await import("@/app/api/business/invoices/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011"
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(404);
  });

  test("GET 200 returns invoice", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };
    collections["invoices"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "i1", businessId: "b1" }),
    };
    const { GET } = await import("@/app/api/business/invoices/[id]/route");
    const res = await GET(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011"
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.invoice).toBeDefined();
  });

  test("PUT 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { PUT } = await import("@/app/api/business/invoices/[id]/route");
    const res = await PUT(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011",
        { method: "PUT", body: JSON.stringify({ status: "paid" }) }
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(401);
  });

  test("PUT 404 when invoice not found", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };
    collections["invoices"] = {
      updateOne: vi.fn().mockResolvedValue({ matchedCount: 0 }),
    };
    const { PUT } = await import("@/app/api/business/invoices/[id]/route");
    const res = await PUT(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011",
        { method: "PUT", body: JSON.stringify({ status: "paid" }) }
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(404);
  });

  test("PUT 200 when updated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };
    collections["invoices"] = {
      updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    const { PUT } = await import("@/app/api/business/invoices/[id]/route");
    const res = await PUT(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011",
        { method: "PUT", body: JSON.stringify({ status: "paid" }) }
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("DELETE 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { DELETE } = await import("@/app/api/business/invoices/[id]/route");
    const res = await DELETE(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(401);
  });

  test("DELETE 400 for invalid id", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    const { DELETE } = await import("@/app/api/business/invoices/[id]/route");
    const res = await DELETE(
      new Request("http://localhost/api/business/invoices/invalid", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "invalid" }) } as any
    );
    expect(res.status).toBe(400);
  });

  test("DELETE 404 when not found", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };
    collections["invoices"] = {
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }),
    };
    const { DELETE } = await import("@/app/api/business/invoices/[id]/route");
    const res = await DELETE(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(404);
  });

  test("DELETE 200 when deleted", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439099" },
    });
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };
    collections["invoices"] = {
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };
    const { DELETE } = await import("@/app/api/business/invoices/[id]/route");
    const res = await DELETE(
      new Request(
        "http://localhost/api/business/invoices/507f1f77bcf86cd799439011",
        { method: "DELETE" }
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) } as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
