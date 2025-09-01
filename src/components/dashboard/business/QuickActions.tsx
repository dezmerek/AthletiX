"use client";

import Link from "next/link";
import {
  PlusIcon,
  UserPlusIcon,
  CreditCardIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Business {
  _id: string;
  name: string;
  subscription: {
    plan: string;
  };
}

interface QuickActionsProps {
  business: Business;
}

export default function QuickActions({ business }: QuickActionsProps) {
  const actions = [
    {
      name: "Dodaj członka",
      description: "Zarejestruj nowego członka w firmie",
      href: "/dashboard/business/members/new",
      icon: UserPlusIcon,
      color: "bg-blue-500 hover:bg-blue-600",
      available: true,
    },
    {
      name: "Dodaj pracownika",
      description: "Zatrudnij nowego członka personelu",
      href: "/dashboard/business/staff/new",
      icon: PlusIcon,
      color: "bg-green-500 hover:bg-green-600",
      available: business.subscription.plan === "pro",
    },
    {
      name: "Zarządzaj płatnościami",
      description: "Sprawdź i zarządzaj płatnościami członków",
      href: "/dashboard/business/finances",
      icon: CreditCardIcon,
      color: "bg-purple-500 hover:bg-purple-600",
      available: true,
    },
    {
      name: "Generuj raport",
      description: "Utwórz raport biznesowy",
      href: "/dashboard/business/reports/new",
      icon: DocumentTextIcon,
      color: "bg-orange-500 hover:bg-orange-600",
      available: business.subscription.plan === "pro",
    },
    {
      name: "Planuj wydarzenia",
      description: "Zorganizuj wydarzenia i zajęcia",
      href: "/dashboard/business/calendar",
      icon: CalendarIcon,
      color: "bg-indigo-500 hover:bg-indigo-600",
      available: true,
    },
    {
      name: "Analiza biznesowa",
      description: "Szczegółowe analizy i insights",
      href: "/dashboard/business/analytics",
      icon: ChartBarIcon,
      color: "bg-teal-500 hover:bg-teal-600",
      available: business.subscription.plan === "pro",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Szybkie akcje
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <div key={action.name} className="relative">
            {action.available ? (
              <Link
                href={action.href}
                className="block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {action.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 opacity-60 cursor-not-allowed">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-slate-400 text-white">
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {action.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {action.description}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Wymaga planu Pro
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade Plan Banner */}
      {business.subscription.plan === "free" && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">
                Odblokuj pełny potencjał swojej firmy
              </h4>
              <p className="text-blue-100">
                Przejdź na plan Pro i uzyskaj dostęp do zaawansowanych funkcji,
                większej liczby pracowników i szczegółowych analiz.
              </p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Ulepsz plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
