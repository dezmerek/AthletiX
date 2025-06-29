"use client";

import { useTranslations } from "next-intl";

interface ProfessionalDashboardProps {
  userName: string;
}

export default function ProfessionalDashboard({
  userName,
}: ProfessionalDashboardProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("professional.welcome.title", { userName })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("professional.welcome.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
