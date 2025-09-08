import { vi } from "vitest";

vi.mock("@/contexts/NotificationContext", () => ({
  triggerNotificationRefresh: vi.fn(),
}));

import { simulateNotification } from "@/utils/testNotifications";

describe("testNotifications", () => {
  test("simulateNotification triggers refresh", async () => {
    const { triggerNotificationRefresh } = await import(
      "@/contexts/NotificationContext"
    );

    simulateNotification();
    expect(triggerNotificationRefresh).toHaveBeenCalledTimes(1);
  });
});
