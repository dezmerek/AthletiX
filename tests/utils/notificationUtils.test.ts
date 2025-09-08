import { vi } from "vitest";

// Mock NotificationContext trigger BEFORE importing the module under test
vi.mock("@/contexts/NotificationContext", () => ({
  triggerNotificationRefresh: vi.fn(),
}));

// Import after mocks are set up to ensure resolution succeeds
import {
  triggerNotificationCheck,
  addRealtimeNotification,
} from "@/utils/notificationUtils";

describe("notificationUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("triggerNotificationCheck calls refresh after delay", async () => {
    const { triggerNotificationRefresh } = await import(
      "@/contexts/NotificationContext"
    );

    triggerNotificationCheck();
    expect(triggerNotificationRefresh).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(triggerNotificationRefresh).toHaveBeenCalledTimes(1);
  });

  test("addRealtimeNotification dispatches CustomEvent with mapped data", () => {
    const listener = vi.fn();
    window.addEventListener("new-notification", listener as EventListener);

    addRealtimeNotification({ type: "like", senderName: "Ala" });

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toMatchObject({
      type: "like",
      title: "Nowe polubienie",
      message: "Ala polubił Twój post",
      senderName: "Ala",
      isRead: false,
    });
    expect(String(event.detail._id)).toContain("temp-");
  });
});
