import { vi, test, expect, beforeEach } from "vitest";

const connectMock = vi.fn().mockResolvedValue(undefined);
const connectionObj = {} as unknown as typeof import("mongoose");

vi.mock("mongoose", () => ({
  default: {
    connect: connectMock,
    connection: { readyState: 1 },
  },
}));

beforeEach(() => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/test";
  connectMock.mockClear();
});

test("connectMongoose connects and caches connection", async () => {
  const { default: connectMongoose } = await import("@/lib/mongoose");
  const first = await connectMongoose();
  const second = await connectMongoose();
  expect(connectMock).toHaveBeenCalledTimes(1);
  expect(first).toBeDefined();
  expect(second).toBeDefined();
});
