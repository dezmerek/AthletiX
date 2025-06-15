"use client";

import { useState, useRef, useEffect } from "react";

interface Context {
  id: string;
  type: "personal" | "professional" | "organization";
  name: string;
  role: string;
  icon: string;
  organizationId?: string;
}

export default function ContextSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<string>("personal");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data - dane demonstracyjne
  const availableContexts: Context[] = [
    {
      id: "personal",
      type: "personal",
      name: "Konto osobiste",
      role: "Klient PRO",
      icon: "🏠",
    },
    {
      id: "professional",
      type: "professional",
      name: "Jako trener personalny",
      role: "Profesjonalista",
      icon: "💪",
    },
    {
      id: "org-fitcorp",
      type: "organization",
      name: "FitCorp",
      role: "Księgowość",
      icon: "🏢",
      organizationId: "fitcorp-123",
    },
    {
      id: "org-gymplus",
      type: "organization",
      name: "GymPlus",
      role: "Trener",
      icon: "🏋️",
      organizationId: "gymplus-456",
    },
  ];

  const currentContext =
    availableContexts.find((ctx) => ctx.id === activeContext) ||
    availableContexts[0];

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

  const handleContextSwitch = (contextId: string) => {
    setActiveContext(contextId);
    setIsOpen(false);
    console.log("Przełączono na tryb:", contextId);
  };

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
          <span className="text-base flex-shrink-0">{currentContext.icon}</span>
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
                <span className="text-base flex-shrink-0">{context.icon}</span>
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
      </div>
    </div>
  );
}
