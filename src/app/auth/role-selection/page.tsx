"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function RoleSelectionPage() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();
  const t = useTranslations("auth.roleSelection");

  // Preselect current user roles when component mounts
  useEffect(() => {
    if (session?.user?.role) {
      const currentRoles = Array.isArray(session.user.role)
        ? session.user.role
        : [session.user.role];
      setSelectedRoles(currentRoles.filter(Boolean)); // Filter out null values
    }
  }, [session?.user?.role]);

  const handleRoleSelect = async () => {
    if (selectedRoles.length === 0 || !session?.user?.email) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          roles: selectedRoles, // Send array of roles
          activeContext: selectedRoles[0], // Default to first selected role
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Update the session
      await update();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating role:", error);
      // You could add error handling here
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle role selection
  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const roles = [
    {
      id: "user",
      title: t("user.title"),
      description: t("user.description"),
      features: [
        t("user.features.workoutPlans"),
        t("user.features.progressTracking"),
        t("user.features.dietCalories"),
        t("user.features.community"),
      ],
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 to-cyan-900/20",
    },
    {
      id: "professional",
      title: t("professional.title"),
      description: t("professional.description"),
      features: [
        t("professional.features.clientManagement"),
        t("professional.features.planCreation"),
        t("professional.features.analyticsReports"),
        t("professional.features.appointmentCalendar"),
      ],
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z"
          />
        </svg>
      ),
      gradient: "from-emerald-500 to-teal-500",
      bgGradient:
        "from-emerald-50 to-teal-50 dark:from-emerald-900/20 to-teal-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {session?.user?.role &&
            Array.isArray(session.user.role) &&
            session.user.role.length > 0
              ? t("manageRoles")
              : t("selectAccountType")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            {session?.user?.role &&
            Array.isArray(session.user.role) &&
            session.user.role.length > 0
              ? t("manageDescription")
              : t("selectDescription")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t("canSelectMultiple")}
            {selectedRoles.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                {selectedRoles.length} {t("selectedCount")}
              </span>
            )}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedRoles.includes(role.id)
                  ? `border-transparent bg-gradient-to-br ${role.bgGradient} shadow-2xl`
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {/* Selection indicator */}
              {selectedRoles.includes(role.id) && (
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${role.gradient} flex items-center justify-center`}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-r ${role.gradient} text-white flex items-center justify-center mb-6`}
              >
                {role.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {role.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {role.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {role.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-600 dark:text-gray-400"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center space-y-4">
          <button
            onClick={handleRoleSelect}
            disabled={selectedRoles.length === 0 || isLoading}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedRoles.length > 0 && !isLoading
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:scale-105"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("buttons.saving")}
              </div>
            ) : selectedRoles.length === 1 ? (
              t("buttons.continueWith1Role")
            ) : selectedRoles.length === 2 ? (
              t("buttons.continueWith2Roles")
            ) : (
              t("buttons.selectAtLeastOne")
            )}
          </button>

          {/* Cancel/Back button - show only if user already has roles */}
          {session?.user?.role &&
            Array.isArray(session.user.role) &&
            session.user.role.length > 0 && (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                {t("buttons.cancelAndReturn")}
              </button>
            )}
        </div>

        {/* Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("note")}
          </p>
        </div>
      </div>
    </div>
  );
}
