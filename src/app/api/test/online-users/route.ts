import { NextResponse } from "next/server";

// Simple test endpoint to verify online users functionality
export async function GET() {
  try {
    // Test data for online users
    const testData = {
      onlineUsers: [
        {
          id: "test1",
          name: "Anna Kowalska",
          role: "trainer",
          lastSeen: new Date(),
          lastActivity: new Date(),
          isOnline: true,
        },
        {
          id: "test2",
          name: "Michał Nowak",
          role: "user",
          lastSeen: new Date(),
          lastActivity: new Date(),
          isOnline: true,
        },
      ],
      recentlyActiveUsers: [
        {
          id: "test3",
          name: "Dr. Maria Zielińska",
          role: "nutritionist",
          lastSeen: new Date(Date.now() - 5 * 60 * 1000),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          isOnline: false,
        },
      ],
      totalOnline: 2,
    };

    return NextResponse.json(testData);
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({ error: "Test API error" }, { status: 500 });
  }
}
