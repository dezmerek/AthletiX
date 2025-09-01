import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await params;
    const professionalId = session.user.id;

    // Sprawdź czy profesjonalista ma dostęp do tego klienta
    const client = await clientPromise;
    const db = client.db();

    const clientRelation = await db.collection("professionalClients").findOne({
      professionalId: new ObjectId(professionalId),
      clientId: new ObjectId(clientId),
    });

    if (!clientRelation) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // Pobierz dane postępów klienta
    const [workouts, weightHistory, measurements, currentProfile] =
      await Promise.all([
        // Treningi
        db
          .collection("workouts")
          .find({ userId: new ObjectId(clientId) })
          .sort({ date: -1 })
          .limit(10)
          .toArray(),

        // Historia wag z userprogresses
        db
          .collection("userprogresses")
          .find({ userId: new ObjectId(clientId) })
          .project({ weightEntries: 1 })
          .toArray(),

        // Pomiary z userprogresses
        db
          .collection("userprogresses")
          .find({ userId: new ObjectId(clientId) })
          .project({ measurements: 1 })
          .toArray(),

        // Aktualny profil (waga, cel wagi)
        db
          .collection("userprofiles")
          .findOne({ userId: new ObjectId(clientId) }),
      ]);

    // Przetwórz dane treningów
    const processedWorkouts = workouts.map((workout) => ({
      id: workout._id.toString(),
      date: workout.date,
      type: workout.type || "Trening",
      duration: workout.duration || 0,
      caloriesBurned: workout.caloriesBurned || 0,
      exercises: workout.exercises || [],
    }));

    // Przetwórz historię wag
    let processedWeightHistory: Array<{
      date: string;
      weight: number;
      notes?: string;
    }> = [];

    if (weightHistory.length > 0 && weightHistory[0].weightEntries) {
      processedWeightHistory = weightHistory[0].weightEntries
        .slice(-10)
        .map((entry: any) => ({
          date: entry.date,
          weight: entry.weight,
          notes: entry.notes,
        }));
    }

    // Dodaj aktualną wagę z profilu jeśli nie ma w historii
    if (currentProfile?.weight && processedWeightHistory.length === 0) {
      processedWeightHistory.push({
        date: new Date().toISOString().split("T")[0],
        weight: currentProfile.weight,
        notes: "Aktualna waga",
      });
    }

    // Przetwórz pomiary
    let processedMeasurements: Array<{
      date: string;
      chest: number;
      waist: number;
      hips: number;
      arms: number;
      thighs: number;
    }> = [];

    if (measurements.length > 0 && measurements[0].measurements) {
      processedMeasurements = measurements[0].measurements
        .slice(-5)
        .map((entry: any) => ({
          date: entry.date,
          chest: entry.chest || 0,
          waist: entry.waist || 0,
          hips: entry.hips || 0,
          arms: entry.arms || 0,
          thighs: entry.thighs || 0,
        }));
    }

    return NextResponse.json({
      workouts: processedWorkouts,
      weightHistory: processedWeightHistory,
      measurements: processedMeasurements,
      currentWeight: currentProfile?.weight || null,
      targetWeight: currentProfile?.targetWeight || null,
    });
  } catch (error) {
    console.error("Error fetching client progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
