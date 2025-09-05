import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/dashboard/UserDashboard";
import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

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

  // Render appropriate dashboard based on active context
  if (activeContext === "admin") {
    return (
      <DashboardWrapper>
        <AdminDashboard userName={userName} />
      </DashboardWrapper>
    );
  } else if (activeContext === "professional") {
    return (
      <DashboardWrapper>
        <ProfessionalDashboard userName={userName} />
      </DashboardWrapper>
    );
  } else {
    // Default to user dashboard (includes users and fallback for other roles)
    return (
      <DashboardWrapper>
        <UserDashboard userName={userName} />
      </DashboardWrapper>
    );
  }
}
