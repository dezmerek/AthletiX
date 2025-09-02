import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Najpierw znajdź firmę użytkownika
    let business;
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (businessId) {
      // Jeśli podano businessId, sprawdź czy użytkownik ma dostęp
      business = await db.collection("businesses").findOne({
        _id: businessId,
        $or: [
          { ownerId: new ObjectId(session.user.id) },
          { "staff.userId": session.user.id },
        ],
      });
    } else {
      // Jeśli nie podano businessId, znajdź firmę użytkownika
      business = await db.collection("businesses").findOne({
        $or: [
          { ownerId: new ObjectId(session.user.id) },
          { "staff.userId": session.user.id },
        ],
      });
    }

    if (!business) {
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );
    }

    // Pobierz pracowników firmy (tylko staff i admin)
    const staffMembers = await db
      .collection("memberships")
      .find({
        businessId: business._id,
        role: { $in: ["staff", "admin"] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Dodaj właściciela jeśli ma rolę admin
    const allStaffIds = [...staffMembers.map((m) => m.memberId)];

    // Pobierz szczegóły użytkowników
    const users = await db
      .collection("users")
      .find({ _id: { $in: allStaffIds.map((id) => new ObjectId(id)) } })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        lastActivity: 1,
        createdAt: 1,
      })
      .toArray();

    // Połącz dane pracowników
    const staffWithDetails = staffMembers.map((membership) => {
      const user = users.find(
        (u) => u._id.toString() === membership.memberId.toString()
      );

      return {
        id: membership._id,
        memberId: membership.memberId,
        name: user?.name || "Nieznany użytkownik",
        email: user?.email || "",
        role: membership.role || "staff",
        status: membership.status || "active",
        joinDate: membership.startDate || membership.createdAt,
        lastActive: user?.lastActivity || membership.createdAt,
        permissions: membership.permissions || ["basic_access"],
        department: membership.department || "Ogólny",
        position: membership.position || "Pracownik",
      };
    });

    return NextResponse.json({
      staff: staffWithDetails,
      total: staffWithDetails.length,
    });
  } catch (error) {
    console.error("Error fetching business staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch business staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const { email, role, plan, permissions, department, position } =
      await request.json();

    // Walidacja wymaganych pól
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik ma dostęp do firmy
    const business = await db.collection("businesses").findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { "staff.userId": session.user.id },
      ],
    });

    if (!business) {
      return NextResponse.json(
        { error: "No business found for user" },
        { status: 404 }
      );
    }

    // Sprawdź czy użytkownik ma uprawnienia do dodawania pracowników
    const userMembership = await db.collection("memberships").findOne({
      businessId: business._id,
      memberId: session.user.id,
    });

    if (
      !userMembership ||
      (userMembership.role !== "admin" && userMembership.role !== "owner")
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Znajdź użytkownika po email
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik już jest członkiem tej firmy
    const existingMembership = await db.collection("memberships").findOne({
      businessId: business._id,
      memberId: user._id,
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this business" },
        { status: 400 }
      );
    }

    // Utwórz nowe członkostwo
    const newMembership = {
      businessId: business._id,
      memberId: user._id,
      role: role,
      status: "active",
      plan: plan || "free",
      permissions: permissions || ["basic_access"],
      department: department || "Ogólny",
      position: position || "Pracownik",
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("memberships").insertOne(newMembership);

    // Dodaj memberId do tablicy members w business
    await db
      .collection("businesses")
      .updateOne({ _id: business._id }, { $addToSet: { members: user._id } });

    return NextResponse.json({
      membership: { ...newMembership, _id: result.insertedId },
      message: "Staff member added successfully",
    });
  } catch (error) {
    console.error("Error adding staff member:", error);
    return NextResponse.json(
      { error: "Failed to add staff member" },
      { status: 500 }
    );
  }
}
