import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import WorkoutTemplate from "@/models/WorkoutTemplate";

export async function GET() {
  await connectMongoose();
  const templates = await WorkoutTemplate.find().sort({ createdAt: 1 });
  return Response.json({ templates, count: templates.length });
}

export async function POST() {
  // Allow seeding in development without auth
  if (process.env.NODE_ENV === "production") {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await connectMongoose();

  // Check if templates already exist
  const existingCount = await WorkoutTemplate.countDocuments();
  if (existingCount > 0) {
    return Response.json({
      message: "Templates already seeded",
      count: existingCount,
    });
  }

  const templates = [
    {
      name: "Push Day - Klatka, ramiona, triceps",
      nameEn: "Push Day - Chest, shoulders, triceps",
      type: "strength" as const,
      estimatedDuration: 75,
      exercises: [
        {
          name: "Wyciskanie sztangi na ławce płaskiej",
          nameEn: "Barbell bench press",
          sets: 4,
          reps: 8,
          weight: 80,
          restTime: 120,
          notes: "Skup się na technice, opuszczaj sztangę do klatki",
        },
        {
          name: "Pompki na poręczach",
          nameEn: "Dips",
          sets: 3,
          reps: 12,
          restTime: 90,
          notes: "Głębokość do momentu gdy ramiona są równoległe do podłoża",
        },
        {
          name: "Wyciskanie hantli nad głową",
          nameEn: "Dumbbell shoulder press",
          sets: 3,
          reps: 10,
          weight: 25,
          restTime: 90,
          notes: "Stań stabilnie, unikaj bujania",
        },
        {
          name: "Rozpiętki na ławce skośnej",
          nameEn: "Incline dumbbell flyes",
          sets: 3,
          reps: 12,
          weight: 15,
          restTime: 60,
          notes: "Ławka ustawiona pod kątem 30-45 stopni",
        },
        {
          name: "Pompki klasyczne",
          nameEn: "Push-ups",
          sets: 3,
          reps: 15,
          restTime: 60,
          notes: "Do upadku mięśniowego",
        },
      ],
    },
    {
      name: "Pull Day - Plecy, biceps",
      nameEn: "Pull Day - Back, biceps",
      type: "strength" as const,
      estimatedDuration: 80,
      exercises: [
        {
          name: "Podciąganie na drążku",
          nameEn: "Pull-ups",
          sets: 4,
          reps: 8,
          restTime: 120,
          notes: "Pełny zakres ruchu, broda nad drążkiem",
        },
        {
          name: "Wiosłowanie sztangą",
          nameEn: "Barbell row",
          sets: 4,
          reps: 10,
          weight: 70,
          restTime: 90,
          notes: "Utrzymuj proste plecy, przyciągaj do brzucha",
        },
        {
          name: "Uginanie ramion ze sztangą",
          nameEn: "Barbell curls",
          sets: 3,
          reps: 12,
          weight: 30,
          restTime: 60,
          notes: "Kontrolowany ruch, bez bujania",
        },
        {
          name: "Martwy ciąg rumuński",
          nameEn: "Romanian deadlift",
          sets: 3,
          reps: 10,
          weight: 60,
          restTime: 90,
          notes: "Skup się na pracy mięśni pleców",
        },
        {
          name: "Uginanie ramion z hantlami",
          nameEn: "Dumbbell curls",
          sets: 3,
          reps: 12,
          weight: 12,
          restTime: 60,
          notes: "Naprzemiennie lewa i prawa ręka",
        },
      ],
    },
    {
      name: "Cardio - Bieganie interwałowe",
      nameEn: "Cardio - Interval running",
      type: "cardio" as const,
      estimatedDuration: 45,
      exercises: [
        {
          name: "Rozgrzewka - trucht",
          nameEn: "Warm-up - jog",
          sets: 1,
          reps: 1,
          duration: 10,
          notes: "Tempo konwersacyjne, przygotowanie organizmu",
        },
        {
          name: "Interwały - sprint",
          nameEn: "Intervals - sprint",
          sets: 8,
          reps: 1,
          duration: 2,
          restTime: 90,
          notes: "Maksymalne tempo przez 2 minuty, potem marsz",
        },
        {
          name: "Wyciszenie - trucht",
          nameEn: "Cool-down - jog",
          sets: 1,
          reps: 1,
          duration: 10,
          notes: "Stopniowe obniżanie tempa, rozciąganie",
        },
      ],
    },
  ];

  try {
    const createdTemplates = await WorkoutTemplate.insertMany(templates);
    return Response.json(
      {
        message: "Templates seeded successfully",
        count: createdTemplates.length,
        templates: createdTemplates,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding templates:", error);
    return Response.json(
      { error: "Failed to seed templates" },
      { status: 500 }
    );
  }
}
