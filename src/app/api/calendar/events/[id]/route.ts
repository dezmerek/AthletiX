import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const event = await db.collection("calendarEvents").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const responseEvent = {
      id: event._id.toString(),
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

    return NextResponse.json({ event: responseEvent });
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a specific event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, type, date, time, duration, description, color, completed } =
      body;

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

    const updateData = {
      title: title.trim(),
      type,
      date: new Date(date),
      time,
      duration: duration || 60,
      description: description?.trim() || "",
      color: color || "#10B981",
      completed: completed || false,
      updatedAt: new Date(),
    };

    const result = await db.collection("calendarEvents").updateOne(
      {
        _id: new ObjectId(id),
        userId: session.user.id,
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get updated event
    const updatedEvent = await db.collection("calendarEvents").findOne({
      _id: new ObjectId(id),
    });

    const responseEvent = {
      id: updatedEvent!._id.toString(),
      title: updatedEvent!.title,
      type: updatedEvent!.type,
      date: updatedEvent!.date.toISOString().split("T")[0],
      time: updatedEvent!.time,
      duration: updatedEvent!.duration,
      description: updatedEvent!.description,
      color: updatedEvent!.color,
      completed: updatedEvent!.completed,
      createdAt: updatedEvent!.createdAt,
      updatedAt: updatedEvent!.updatedAt,
    };

    return NextResponse.json({
      event: responseEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("calendarEvents").deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle event completion status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get current event
    const currentEvent = await db.collection("calendarEvents").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!currentEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Toggle completion status
    const result = await db.collection("calendarEvents").updateOne(
      {
        _id: new ObjectId(id),
        userId: session.user.id,
      },
      {
        $set: {
          completed: !currentEvent.completed,
          updatedAt: new Date(),
        },
      }
    );

    const responseEvent = {
      id: currentEvent._id.toString(),
      completed: !currentEvent.completed,
    };

    return NextResponse.json({
      event: responseEvent,
      message: "Event status updated successfully",
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
