"use client";

import { useSession } from "next-auth/react";
import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard";

export default function ProfessionalDashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "";

  return <ProfessionalDashboard userName={userName} />;
}
