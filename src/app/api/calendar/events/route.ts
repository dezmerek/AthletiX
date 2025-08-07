import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Retrieve calendar events
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const date = searchParams.get("date");

    let query: any = { userId: session.user.id };

    if (date) {
      // Get events for a specific date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (startDate && endDate) {
      // Get events in a date range
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Get all events for the current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.date = {
        $gte: start,
        $lte: end,
      };
    }

    const events = await db
      .collection("calendarEvents")
      .find(query)
      .sort({ date: 1, time: 1 })
      .toArray();

    // Transform events for frontend
    const transformedEvents = events.map((event) => ({
      id: event._id.toString(),
      title: event.title,
      type: event.type,
      date: event.date.toISOString().split("T")[0],
      time: event.time,
      duration: event.duration,
      description: event.description,
      color: event.color,
      completed: event.completed || false,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return NextResponse.json({
      events: transformedEvents,
      count: transformedEvents.length,
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, date, time, duration, description, color } = body;

    // Validate required fields
    if (!title || !type || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return NextResponse.json(
        { error: "Invalid time format" },
        { status: 400 }
      );
    }

    // Validate color format
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: "Invalid color format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const event = {
      userId: session.user.id,
      title: title.trim(),
      type,
      date: new Date(date),
      time,
      duration: duration || 60,
      description: description?.trim() || "",
      color: color || "#10B981",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("calendarEvents").insertOne(event);

    // Transform for response
    const responseEvent = {
      id: result.insertedId.toString(),
      title: event.title,
      type: event.type,
      date: event.date.toISOString().split("T")[0],
      time: event.time,
      duration: event.duration,
      description: event.description,
      color: event.color,
      completed: event.completed,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    return NextResponse.json(
      {
        event: responseEvent,
        message: "Event created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
