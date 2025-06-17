"use client";

interface ProfessionalDashboardProps {
  userName: string;
}

export default function ProfessionalDashboard({
  userName,
}: ProfessionalDashboardProps) {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Witaj, {userName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Panel profesjonalisty - zarządzaj klientami i programami
            treningowymi
          </p>
        </div>
      </div>
    </div>
  );
}
