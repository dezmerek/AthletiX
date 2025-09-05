"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { IUser as User } from "@/models/User";
import ContextSwitcherModal from "./ContextSwitcherModal";
import { getRoleDisplayName, hasRole } from "@/utils/roleUtils";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface SidebarItem {
  href: string;
  icon: React.ReactElement;
  label: string;
  badge?: string;
  context: "user" | "professional" | "admin" | "business" | "all"; // Określa dla jakiego kontekstu dostępny
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const t = useTranslations("sidebar");
  const tRole = useTranslations("roleUtils");
  const { data: session, update } = useSession();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Create user object
  const user = session?.user?.id
    ? ({
        _id: session.user.id,
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role, // Keep null if role is null
        isPremiumPersonal: session.user.isPremiumPersonal || false,
        isPremiumProfessional: session.user.isPremiumProfessional || false,
        activeContext: session.user.activeContext, // Keep null if activeContext is null
      } as User)
    : undefined;

  // Get role display name using translations
  const roleDisplayName = getRoleDisplayName(user || {}, tRole);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleContextChange = async (
    contextId: "user" | "professional" | "admin" | "business"
  ) => {
    try {
      const response = await fetch("/api/user/switch-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeContext: contextId }),
      });

      if (response.ok) {
        // Trigger session update to refresh activeContext from database
        await update();
        // Refresh the router to update the UI
        router.refresh();
      } else {
        const error = await response.json();
        console.error("Failed to switch context:", error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Error switching context:", error);
      // You could show a toast notification here
    }
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut({ redirect: false });
    router.push("/");
  };

  const menuItems: SidebarItem[] = [
    {
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: t("dashboard"),
      context: "all", // Dashboard dostępny dla wszystkich kontekstów
    },
    {
      href: "/dashboard/workouts",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21l3-3 3 3 3-3 3 3M4 12h16m-8-8v8"
          />
        </svg>
      ),
      label: t("workouts"),
      context: "user",
    },
    {
      href: "/dashboard/nutrition",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      ),
      label: t("nutrition"),
      context: "user",
    },
    {
      href: "/dashboard/progress",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      label: t("progress"),
      context: "user",
    },
    {
      href: "/dashboard/calendar",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: t("calendar"),
      context: "all", // Kalendarz dostępny dla wszystkich kontekstów (różne funkcjonalności)
    },
    {
      href: "/dashboard/community",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      label: t("community"),
      context: "all", // Społeczność dostępna dla wszystkich kontekstów
    },
    {
      href: "/dashboard/messaging",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      label: t("messaging"),
      context: "all", // Wiadomości dostępne dla wszystkich kontekstów
    },
    {
      href: "/dashboard/profile",
      icon: (
        <svg
          className="w-5 h-5"
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
      label: t("profile"),
      context: "user", // Profil tylko dla użytkowników
    },
    // ===== SEKCJE DLA PROFESJONALISTÓW =====
    {
      href: "/dashboard/clients",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      label: t("clients"),
      context: "professional", // Klienci tylko dla profesjonalistów
    },
    {
      href: "/dashboard/plans",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: t("plans"),
      context: "professional", // Plany treningowe/dietetyczne dla profesjonalistów
    },
    {
      href: "/dashboard/analytics",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: t("analytics"),
      context: "professional", // Analytics tylko dla profesjonalistów
    },
    {
      href: "/dashboard/invoices",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      label: "Faktury",
      context: "professional", // Faktury dla profesjonalistów
    },

    // ===== KONIEC SEKCJI DLA PROFESJONALISTÓW =====

    // ===== SEKCJE DLA BUSINESS OWNER =====
    {
      href: "/dashboard/business",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      label: "Business",
      context: "business", // Business tylko dla business owner
    },
    {
      href: "/dashboard/business/members",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      label: "Członkowie",
      context: "business",
    },
    {
      href: "/dashboard/business/staff",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      label: "Personel",
      context: "business",
    },
    {
      href: "/dashboard/business/finances",
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      label: "Finanse",
      context: "business",
    },
    {
      href: "/dashboard/business/schedule",
      icon: <CalendarIcon className="w-5 h-5" />,
      label: "Harmonogramy",
      context: "business",
    },
    {
      href: "/dashboard/business/tasks",
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      label: "Zadania",
      context: "business",
    },
    {
      href: "/dashboard/business/portal",
      icon: <UserGroupIcon className="w-5 h-5" />,
      label: "Portal pracowniczy",
      context: "business",
    },
    {
      href: "/dashboard/business/analytics",
      icon: <ChartBarIcon className="w-5 h-5" />,
      label: "Analityka Biznesowa",
      context: "business",
    },
    {
      href: "/dashboard/business/invoices",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      label: "Faktury",
      context: "business",
    },
    // ===== KONIEC SEKCJI DLA BUSINESS OWNER =====
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    // Use exact matching for business routes to avoid double highlighting
    if (href.startsWith("/dashboard/business")) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Filter menu items based on active context
  const getFilteredMenuItems = () => {
    if (!user) return [];

    return menuItems.filter((item) => {
      // Always show items for "all" contexts
      if (item.context === "all") return true;

      // Business items are only visible for business_owner
      if (item.context === "business") {
        return (
          hasRole(user, "business_owner") && user.activeContext === "business"
        );
      }

      // Check if item is available for current context
      if (item.context === user.activeContext) return true;

      // Admin can see everything regardless of context
      if (hasRole(user, "admin") && item.context === "admin") return true;

      return false;
    });
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen flex flex-col`}
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 border-b border-slate-200 dark:border-slate-700 h-[68px] ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              AthletiX
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? t("expand") : t("collapse")}
        >
          <svg
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {getFilteredMenuItems().map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center rounded-lg transition-all duration-200 group ${
                  isCollapsed
                    ? "justify-center px-3 py-2.5"
                    : "space-x-3 px-3 py-2.5"
                } ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span
                  className={`${
                    isActive(item.href)
                      ? "text-white"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-emerald-500"
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div
          className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700"
          ref={dropdownRef}
        >
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all duration-200 ${
                isCollapsed ? "justify-center" : "space-x-3"
              }`}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 text-base font-semibold">
                      {(user.name || "").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {!isCollapsed && (
                <>
                  {" "}
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {user.name}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {roleDisplayName}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
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
                </>
              )}
            </button>
            {/* Dropdown Menu */}
            <div
              className={`absolute ${
                isCollapsed
                  ? "left-full bottom-0 ml-2 w-64"
                  : "bottom-full left-0 mb-2 w-full"
              } rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 ${
                isDropdownOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              }`}
            >
              {" "}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/70">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsContextModalOpen(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center space-x-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4"
                  />
                </svg>
                <span>{t("switchMode")}</span>
              </button>
              <button
                onClick={() => {
                  router.push("/dashboard/settings");
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center space-x-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{t("settings")}</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700/70"></div>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors cursor-pointer flex items-center space-x-3 rounded-b-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>{t("logout")}</span>
              </button>
            </div>{" "}
          </div>
        </div>
      )}

      {/* Context Switcher Modal */}
      <ContextSwitcherModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        onContextChange={handleContextChange}
        userRole={user?.role}
        isPremiumPersonal={user?.isPremiumPersonal}
        isPremiumProfessional={user?.isPremiumProfessional}
        activeContext={user?.activeContext}
      />
    </div>
  );
}
