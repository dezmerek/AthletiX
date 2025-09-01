"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Przegląd", href: "/dashboard/business", icon: HomeIcon },
  { name: "Członkowie", href: "/dashboard/business/members", icon: UsersIcon },
  { name: "Personel", href: "/dashboard/business/staff", icon: UserGroupIcon },
  {
    name: "Finanse",
    href: "/dashboard/business/finances",
    icon: CreditCardIcon,
  },
  {
    name: "Analityka",
    href: "/dashboard/business/analytics",
    icon: ChartBarIcon,
  },
  {
    name: "Kalendarz",
    href: "/dashboard/business/calendar",
    icon: CalendarIcon,
  },
  {
    name: "Raporty",
    href: "/dashboard/business/reports",
    icon: DocumentTextIcon,
  },
  { name: "Ustawienia", href: "/dashboard/business/settings", icon: CogIcon },
];

export default function BusinessSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Business
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg
              className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
