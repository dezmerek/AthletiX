import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import WorkoutTemplate from "@/models/WorkoutTemplate";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();

  const url = new URL(request.url);
  const lang = (url.searchParams.get("lang") || "").toLowerCase();

  const templates = await WorkoutTemplate.find({
    $or: [{ ownerId: null }, { ownerId: session.user.id }],
  }).sort({ ownerId: 1, name: 1 });

  // Map names to preferred language if available
  const mapped = templates.map((t: any) => ({
    ...t.toObject(),
    name: lang === "en" && t.nameEn ? t.nameEn : t.name,
    exercises: (t.exercises || []).map((e: any) => ({
      ...e,
      name: lang === "en" && e.nameEn ? e.nameEn : e.name,
    })),
  }));

  return Response.json({ templates: mapped });
}
