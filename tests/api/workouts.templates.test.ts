import { vi, describe, test, expect, beforeEach } from "vitest";

// Mock auth to control session
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock mongoose connector to avoid real DB
vi.mock("@/lib/mongoose", () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock WorkoutTemplate model
const findMock = vi.fn();
const sortMock = vi.fn(() => ({ toArray: undefined }));

vi.mock("@/models/WorkoutTemplate", () => ({
  __esModule: true,
  default: { find: findMock },
}));

describe("GET /api/workouts/templates", () => {
  beforeEach(() => {
    vi.resetModules();
    findMock.mockReset();
  });

  test("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as unknown as vi.Mock).mockResolvedValue(null);

    const { GET } = await import("@/app/api/workouts/templates/route");
    const res = await GET(
      new Request("http://localhost/api/workouts/templates")
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  test("maps names by lang and filters exercises names", async () => {
    const { auth } = await import("@/auth");
    (auth as unknown as unknown as vi.Mock).mockResolvedValue({
      user: { id: "u1" },
    });

    const toObject = (obj: any) => obj;
    const docs = [
      {
        toObject: () => ({
          _id: "1",
          name: "PL A",
          nameEn: "EN A",
          exercises: [
            { name: "Przysiad", nameEn: "Squat" },
            { name: "Wyciskanie" },
          ],
        }),
        name: "PL A",
        nameEn: "EN A",
        exercises: [
          { name: "Przysiad", nameEn: "Squat" },
          { name: "Wyciskanie" },
        ],
      },
    ];

    // mock chained call: find().sort() returns a Promise resolving to docs
    findMock.mockReturnValue({
      sort: () => Promise.resolve(docs),
    });

    const { GET } = await import("@/app/api/workouts/templates/route");
    const res = await GET(
      new Request("http://localhost/api/workouts/templates?lang=en")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.templates).toEqual([
      {
        _id: "1",
        name: "EN A",
        nameEn: "EN A",
        exercises: [{ name: "Squat", nameEn: "Squat" }, { name: "Wyciskanie" }],
      },
    ]);
  });
});
