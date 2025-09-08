import { test, expect } from "vitest";

test("stripe webhook returns 400 when signature missing", async () => {
  process.env.STRIPE_SECRET_KEY =
    process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
  process.env.STRIPE_WEBHOOK_SECRET =
    process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy";
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/test";
  const { POST } = await import("@/app/api/stripe/webhook/route");
  const req = new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    body: "{}",
    headers: {
      // deliberately no 'stripe-signature'
      "content-type": "application/json",
    },
  });
  const res = await POST(req as any);
  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json).toEqual({ error: "No signature" });
});
