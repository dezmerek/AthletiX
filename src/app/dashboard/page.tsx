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
  // Check if user has selected a role
  if (!user.role || (Array.isArray(user.role) && user.role.length === 0)) {
    redirect("/auth/role-selection");
  }

  const userName = user.name || "User";

  // Determine which dashboard to render based on active context
  const activeContext = user.activeContext;

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
