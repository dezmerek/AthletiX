"use client";

interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  settings: {
    maxStaff: number;
    maxMembers: number;
    features: string[];
  };
  staff: string[];
  members: string[];
  createdAt: string;
}

interface BusinessOverviewProps {
  business: Business;
}

export default function BusinessOverview({ business }: BusinessOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const getDaysUntilExpiry = () => {
    const endDate = new Date(business.subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Business Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Informacje o firmie
        </h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Nazwa:
            </span>
            <p className="font-medium text-slate-900 dark:text-white">
              {business.name}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Email:
            </span>
            <p className="font-medium text-slate-900 dark:text-white">
              {business.email}
            </p>
          </div>
          {business.phone && (
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Telefon:
              </span>
              <p className="font-medium text-slate-900 dark:text-white">
                {business.phone}
              </p>
            </div>
          )}
          {business.address && (
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Adres:
              </span>
              <p className="font-medium text-slate-900 dark:text-white">
                {business.address}
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Utworzono:
            </span>
            <p className="font-medium text-slate-900 dark:text-white">
              {formatDate(business.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Subskrypcja
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Plan:
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                business.subscription.plan === "pro"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
              }`}
            >
              {business.subscription.plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Status:
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                business.subscription.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {business.subscription.status === "active"
                ? "Aktywna"
                : "Nieaktywna"}
            </span>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Ważna do:
            </span>
            <p className="font-medium text-slate-900 dark:text-white">
              {formatDate(business.subscription.endDate)}
            </p>
          </div>
          {daysUntilExpiry > 0 && (
            <div
              className={`text-sm ${
                daysUntilExpiry <= 7
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {daysUntilExpiry === 1
                ? "1 dzień do wygaśnięcia"
                : `${daysUntilExpiry} dni do wygaśnięcia`}
            </div>
          )}
        </div>
      </div>

      {/* Limits Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Limity i funkcje
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Personel:
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {business.staff.length} / {business.settings.maxStaff}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Członkowie:
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {business.members.length} / {business.settings.maxMembers}
            </span>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Funkcje:
            </span>
            <div className="mt-2 space-y-1">
              {business.settings.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs mr-2 mb-1"
                >
                  {feature === "basic_management"
                    ? "Zarządzanie podstawowe"
                    : feature === "basic_analytics"
                    ? "Analityka podstawowa"
                    : feature === "advanced_management"
                    ? "Zarządzanie zaawansowane"
                    : feature === "advanced_analytics"
                    ? "Analityka zaawansowana"
                    : feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
