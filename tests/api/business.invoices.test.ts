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
            find: vi
              .fn()
              .mockReturnValue({
                sort: () => ({ toArray: () => Promise.resolve([]) }),
              }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/business/invoices GET", () => {
  test("401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/business/invoices/route");
    const res = await GET(
      new Request("http://localhost/api/business/invoices") as any
    );
    expect(res.status).toBe(401);
  });

  test("404 when no business found for user", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["businesses"] = { findOne: vi.fn().mockResolvedValue(null) };
    const { GET } = await import("@/app/api/business/invoices/route");
    const res = await GET(
      new Request("http://localhost/api/business/invoices") as any
    );
    expect(res.status).toBe(404);
  });

  test("200 with invoices when business found", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["businesses"] = {
      findOne: vi.fn().mockResolvedValue({ _id: "b1" }),
    };
    collections["invoices"] = {
      find: vi
        .fn()
        .mockReturnValue({
          sort: () => ({ toArray: () => Promise.resolve([{ _id: "i1" }]) }),
        }),
    };
    const { GET } = await import("@/app/api/business/invoices/route");
    const res = await GET(
      new Request("http://localhost/api/business/invoices") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.invoices)).toBe(true);
  });
});
