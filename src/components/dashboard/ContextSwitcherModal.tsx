"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { canActAsProfessional, canActAsUser } from "@/utils/roleUtils";

interface Context {
  id: "user" | "professional";
  name: string;
  role: string;
  icon?: string;
}

interface ContextSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContextChange?: (contextId: "user" | "professional") => void;
  userRole?: string | string[] | null;
  isPremiumPersonal?: boolean;
  isPremiumProfessional?: boolean;
  activeContext?: "user" | "professional" | null;
}

export default function ContextSwitcherModal({
  isOpen,
  onClose,
  onContextChange,
  userRole = null,
  isPremiumPersonal = false,
  isPremiumProfessional = false,
  activeContext: propActiveContext = null,
}: ContextSwitcherModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("contextSwitcher");

  // Normalize roles to array, filter out null values
  const roles = Array.isArray(userRole)
    ? userRole.filter(Boolean)
    : userRole
    ? [userRole]
    : [];

  // Use prop directly instead of local state
  const activeContext = propActiveContext;

  // Simple context data based on user role
  const availableContexts: Context[] = [];

  // Add user context only if user has the role
  if (canActAsUser({ role: userRole })) {
    availableContexts.push({
      id: "user",
      name: t("userMode"),
      role: isPremiumPersonal ? t("userPro") : t("user"),
    });
  }

  // Add professional context only if user can act as professional
  if (canActAsProfessional({ role: userRole })) {
    const professionalRole = roles.includes("professional")
      ? t("professional")
      : t("administrator");

    availableContexts.push({
      id: "professional",
      name: t("professionalMode"),
      role:
        isPremiumProfessional
          ? roles.includes("professional")
            ? t("professionalPro")
            : t("administratorPro")
          : professionalRole,
    });
  }

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  const handleContextSwitch = (contextId: "user" | "professional") => {
    onContextChange?.(contextId);
    onClose();
    console.log("Przełączono na tryb:", contextId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("switchMode")}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("selectMode")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Context List */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {availableContexts.map((context) => (
            <button
              key={context.id}
              onClick={() => handleContextSwitch(context.id)}
              className={`w-full flex items-center p-4 rounded-xl text-left cursor-pointer ${
                context.id === activeContext
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-base font-semibold truncate ${
                      context.id === activeContext
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {context.name}
                  </div>
                  <div
                    className={`text-sm truncate ${
                      context.id === activeContext
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {context.role}
                  </div>
                </div>

                {/* Active Indicator */}
                {context.id === activeContext && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
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
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <button
            onClick={() => {
              onClose(); // Zamknij modal
              router.push("/auth/role-selection"); // Przekieruj do zarządzania rolami
            }}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
          >
            <svg
              className="w-4 h-4 mr-2"
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
