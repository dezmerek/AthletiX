"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  canActAsProfessional,
  canActAsUser,
  canActAsAdmin,
  getRoleDisplayName,
} from "@/utils/roleUtils";

interface Context {
  id: "user" | "professional" | "admin" | "business";
  name: string;
  role: string;
  icon?: string;
}

interface ContextSwitcherProps {
  userRole?: string | string[] | null;
  isPremiumPersonal?: boolean;
  isPremiumProfessional?: boolean;
  activeContext?: "user" | "professional" | "admin" | "business" | null;
  onContextChange?: (
    context: "user" | "professional" | "admin" | "business"
  ) => void;
}

export default function ContextSwitcher({
  userRole = null,
  isPremiumPersonal = false,
  isPremiumProfessional = false,
  activeContext: propActiveContext = null,
  onContextChange,
}: ContextSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<
    "user" | "professional" | "admin" | "business" | null
  >(propActiveContext);
  const [availableContexts, setAvailableContexts] = useState<Context[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("contextSwitcher");
  const tRole = useTranslations("roleUtils");

  // Normalize roles to array, filter out null values
  const roles = Array.isArray(userRole)
    ? userRole.filter(Boolean)
    : userRole
    ? [userRole]
    : [];

  // Update available contexts when userRole changes
  useEffect(() => {
    const contexts: Context[] = [];

    // Add user context only if user has the role
    if (canActAsUser({ role: userRole })) {
      const userRoleDisplayName = getRoleDisplayName(
        {
          role: userRole,
          activeContext: "user",
          isPremiumPersonal,
          isPremiumProfessional,
        },
        tRole
      );

      contexts.push({
        id: "user",
        name: t("userMode"),
        role: userRoleDisplayName,
      });
    }

    // Add professional context only if user can act as professional
    if (canActAsProfessional({ role: userRole })) {
      const professionalRoleDisplayName = getRoleDisplayName(
        {
          role: userRole,
          activeContext: "professional",
          isPremiumPersonal,
          isPremiumProfessional,
        },
        tRole
      );

      contexts.push({
        id: "professional",
        name: t("professionalMode"),
        role: professionalRoleDisplayName,
      });
    }

    // Add admin context only if user is admin
    if (canActAsAdmin({ role: userRole })) {
      const adminRoleDisplayName = getRoleDisplayName(
        {
          role: userRole,
          activeContext: null, // Admin without context shows as Administrator
          isPremiumPersonal,
          isPremiumProfessional,
        },
        tRole
      );

      contexts.push({
        id: "admin",
        name: t("adminMode"),
        role: adminRoleDisplayName,
      });
    }

    // Add business context only if user is business owner
    if (Array.isArray(userRole) && userRole.includes("business_owner")) {
      contexts.push({
        id: "business",
        name: "Tryb Business",
        role: "Właściciel firmy",
      });
    }

    setAvailableContexts(contexts);
  }, [userRole, isPremiumPersonal, isPremiumProfessional, t, tRole]);

  const currentContext = availableContexts.find(
    (ctx) => ctx.id === activeContext
  );

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleContextSwitch = (
    contextId: "user" | "professional" | "admin" | "business"
  ) => {
    setActiveContext(contextId);
    onContextChange?.(contextId);
    setIsOpen(false);
    console.log("Switched to mode:", contextId);
  };

  // Don't render if no roles or no current context
  if (roles.length === 0 || !currentContext) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Przycisk przełącznika */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="text-left min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
              {currentContext.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentContext.role}
            </div>
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
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

      {/* Dropdown Menu */}
      <div
        className={`absolute left-0 mt-2 w-full max-w-xs rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 z-50 ${
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2 pointer-events-none"
        }`}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="py-1">
          {availableContexts.map((context) => (
            <button
              key={context.id}
              onClick={() => handleContextSwitch(context.id)}
              className={`w-full flex items-center px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50 ${
                context.id === activeContext
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : "text-slate-700 dark:text-slate-300"
              }`}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {context.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {context.role}
                  </div>
                </div>

                {/* Wskaźnik aktywnego trybu */}
                {context.id === activeContext && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer - Zarządzaj trybami */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-1 py-1">
          <button
            onClick={() => {
              setIsOpen(false);
              router.push("/auth/role-selection");
            }}
            className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors"
          >
            <svg
              className="w-3 h-3 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>{t("manageRoles")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
