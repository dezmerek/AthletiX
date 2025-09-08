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
            insertOne: vi.fn().mockResolvedValue({ insertedId: "p1" }),
          };
        }
        return collections[name];
      },
    }),
  }),
}));

describe("/api/community/posts", () => {
  test("GET 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { GET } = await import("@/app/api/community/posts/route");
    const res = await GET(
      new Request("http://localhost/api/community/posts") as any
    );
    expect(res.status).toBe(401);
  });

  test("GET 200 returns posts with pagination", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    collections["communityposts"] = {
      aggregate: vi
        .fn()
        .mockReturnValue({
          toArray: vi.fn().mockResolvedValue([{ _id: "p1" }]),
        }),
      countDocuments: vi.fn().mockResolvedValue(1),
    };
    const { GET } = await import("@/app/api/community/posts/route");
    const res = await GET(
      new Request("http://localhost/api/community/posts?page=1&limit=1") as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.posts.length).toBe(1);
    expect(json.pagination.total).toBe(1);
  });

  test("POST 401 when unauthenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/community/posts/route");
    const res = await POST(
      new Request("http://localhost/api/community/posts", {
        method: "POST",
        body: JSON.stringify({ content: "Hi" }),
      }) as any
    );
    expect(res.status).toBe(401);
  });

  test("POST 400 when content missing", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    const { POST } = await import("@/app/api/community/posts/route");
    const res = await POST(
      new Request("http://localhost/api/community/posts", {
        method: "POST",
        body: JSON.stringify({ content: "  " }),
      }) as any
    );
    expect(res.status).toBe(400);
  });

  test("POST 200 when valid", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as vi.Mock).mockResolvedValue({
      user: { id: "507f1f77bcf86cd799439011" },
    });
    // after insert, aggregate returns the created document
    collections["communityposts"] = {
      insertOne: vi.fn().mockResolvedValue({ insertedId: "p1" }),
      aggregate: vi
        .fn()
        .mockReturnValue({
          toArray: vi.fn().mockResolvedValue([{ _id: "p1", content: "Hi" }]),
        }),
    };
    const { POST } = await import("@/app/api/community/posts/route");
    const res = await POST(
      new Request("http://localhost/api/community/posts", {
        method: "POST",
        body: JSON.stringify({ content: "Hi" }),
      }) as any
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.post).toBeDefined();
  });
});
