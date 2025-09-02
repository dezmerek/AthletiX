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

    // Pobierz członków firmy
    const memberships = await db
      .collection("memberships")
      .find({ businessId })
      .sort({ createdAt: -1 })
      .toArray();

    // Dodaj właściciela firmy do listy
    const allMemberIds = [
      business.ownerId,
      ...memberships.map((m) => m.memberId),
    ];

    // Pobierz szczegóły użytkowników (właściciel + członkowie)
    const users = await db
      .collection("users")
      .find({ _id: { $in: allMemberIds.map((id) => new ObjectId(id)) } })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        lastActivity: 1,
        createdAt: 1,
      })
      .toArray();

    // Pobierz dane o treningach i żywieniu
    const workoutStats = await db
      .collection("workouts")
      .aggregate([
        {
          $match: {
            userId: { $in: allMemberIds.map((id) => new ObjectId(id)) },
          },
        },
        {
          $group: {
            _id: "$userId",
            workoutCount: { $sum: 1 },
            totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
          },
        },
      ])
      .toArray();

    const nutritionStats = await db
      .collection("nutritionLogs")
      .aggregate([
        {
          $match: {
            userId: { $in: allMemberIds.map((id) => new ObjectId(id)) },
          },
        },
        {
          $group: {
            _id: "$userId",
            logCount: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Najpierw dodaj właściciela
    const ownerUser = users.find(
      (u) => u._id.toString() === business.ownerId.toString()
    );
    const ownerWorkoutStat = workoutStats.find(
      (w) => w._id.toString() === business.ownerId.toString()
    );
    const ownerNutritionStat = nutritionStats.find(
      (n) => n._id.toString() === business.ownerId.toString()
    );

    const ownerDetails = {
      id: `owner-${business.ownerId}`,
      memberId: business.ownerId,
      name: ownerUser?.name || "Właściciel",
      email: ownerUser?.email || "",
      role: "owner",
      status: "active",
      joinDate: business.createdAt || new Date(),
      lastActive: ownerUser?.lastActivity || business.createdAt || new Date(),
      subscription: "owner",
      workouts: ownerWorkoutStat?.workoutCount || 0,
      nutritionLogs: ownerNutritionStat?.logCount || 0,
      totalWorkoutTime: ownerWorkoutStat?.totalDuration || 0,
    };

    // Połącz dane członków
    const membersWithDetails = memberships.map((membership) => {
      const user = users.find(
        (u) => u._id.toString() === membership.memberId.toString()
      );
      const workoutStat = workoutStats.find(
        (w) => w._id.toString() === membership.memberId.toString()
      );
      const nutritionStat = nutritionStats.find(
        (n) => n._id.toString() === membership.memberId.toString()
      );

      return {
        id: membership._id,
        memberId: membership.memberId,
        name: user?.name || "Nieznany użytkownik",
        email: user?.email || "",
        role: membership.role || "member",
        status: membership.status || "active",
        joinDate: membership.startDate || membership.createdAt,
        lastActive: user?.lastActivity || membership.createdAt,
        subscription: membership.plan || "free",
        workouts: workoutStat?.workoutCount || 0,
        nutritionLogs: nutritionStat?.logCount || 0,
        totalWorkoutTime: workoutStat?.totalDuration || 0,
      };
    });

    // Połącz właściciela z członkami (właściciel na początku)
    const allMembers = [ownerDetails, ...membersWithDetails];

    return NextResponse.json({
      members: allMembers,
      total: allMembers.length,
    });
  } catch (error) {
    console.error("Error fetching business members:", error);
    return NextResponse.json(
      { error: "Failed to fetch business members" },
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

    const memberData = await request.json();
    const { businessId, email, role, plan } = memberData;

    if (!businessId || !email || !role || !plan) {
      return NextResponse.json(
        { error: "Missing required fields: businessId, email, role, plan" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik ma uprawnienia do dodawania członków
    const business = await db.collection("businesses").findOne({
      _id: businessId,
      $or: [
        { ownerId: session.user.id },
        {
          "staff.userId": session.user.id,
          "staff.permissions": { $in: ["admin", "manage_members"] },
        },
      ],
    });

    if (!business) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Znajdź użytkownika po emailu
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sprawdź czy członek już istnieje w tej firmie
    const existingMembership = await db.collection("memberships").findOne({
      businessId,
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
      businessId,
      memberId: user._id,
      role,
      plan,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("memberships").insertOne(newMembership);

    // Dodaj członka do listy członków firmy
    await db
      .collection("businesses")
      .updateOne({ _id: businessId }, { $addToSet: { members: user._id } });

    return NextResponse.json({
      membership: { ...newMembership, _id: result.insertedId },
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Error adding business member:", error);
    return NextResponse.json(
      { error: "Failed to add business member" },
      { status: 500 }
    );
  }
}
