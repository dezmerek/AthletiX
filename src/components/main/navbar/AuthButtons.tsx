"use client";

import { useTranslations } from "next-intl";
import UserMenu from "./UserMenu";
import type { IUser as User } from "@/models/User";

interface Props {
  handleAuth: (type: "login" | "register") => void;
  user?: User;
  onLogout?: () => void;
}

export default function AuthButtons({ handleAuth, user, onLogout }: Props) {
  const t = useTranslations("Navbar");
  if (user && onLogout) {
    return <UserMenu user={user} onLogout={onLogout} />;
  }

  return (
    <div className="space-x-7 hidden md:flex items-center">
      <button
        onClick={() => handleAuth("login")}
        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
      >
        {t("signIn")}
      </button>
      <button
        onClick={() => handleAuth("register")}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all whitespace-nowrap cursor-pointer"
      >
        {t("getStarted")}
        <svg
          className="w-4 h-4 ml-2 -mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </button>
    </div>
  );
}
