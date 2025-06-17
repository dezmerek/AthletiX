import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/dashboard/UserDashboard";
import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { user } = session;
  const userName = user.name || "User";

  // Determine which dashboard to render based on active context
  const activeContext = user.activeContext || "user";

  // If user has professional role but no active context set, default to user
  // This provides a fallback for users who haven't explicitly set a context
  const shouldShowProfessionalDashboard = activeContext === "professional";

  return (
    <>
      {shouldShowProfessionalDashboard ? (
        <ProfessionalDashboard userName={userName} />
      ) : (
        <UserDashboard userName={userName} />
      )}
    </>
  );
}
