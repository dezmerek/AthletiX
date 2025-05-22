"use client";

import { useTranslations } from "next-intl";
import DesktopMenuDropdown from "./DesktopMenuDropdown";

interface Props {
  handleNavigation: (sectionId: string) => void;
}

export default function DesktopNav({ handleNavigation }: Props) {
  const t = useTranslations("Navbar");

  return (
    <div className="hidden md:flex items-center space-x-6">
      <button
        onClick={() => handleNavigation("start")}
        className="text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
      >
        Start
      </button>
      <DesktopMenuDropdown handleNavigation={handleNavigation} />
      <button
        onClick={() => handleNavigation("pricing")}
        className="text-base text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
      >
        {t("pricing")}
      </button>
    </div>
  );
}
