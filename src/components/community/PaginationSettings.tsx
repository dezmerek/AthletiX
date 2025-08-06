"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface PaginationSettingsProps {
  currentType: "loadMore" | "pages";
  onTypeChange: (type: "loadMore" | "pages") => void;
  className?: string;
}

export function PaginationSettings({
  currentType,
  onTypeChange,
  className = "",
}: PaginationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("community.pagination");

  const options = [
    {
      value: "loadMore",
      label: t("loadMore"),
      description: t("loadMoreDescription"),
    },
    {
      value: "pages",
      label: t("pages"),
      description: t("pagesDescription"),
    },
  ] as const;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
        <span>{t("navigation")}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t("chooseMode")}
              </h3>

              <div className="space-y-3">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paginationType"
                      value={option.value}
                      checked={currentType === option.value}
                      onChange={() => {
                        onTypeChange(option.value);
                        setIsOpen(false);
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
