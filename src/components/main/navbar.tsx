"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/theme/ThemeToggle";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import LanguageSelector from "./navbar/LanguageSelector";
import AuthButtons from "./navbar/AuthButtons";
import type { IUser as User } from "@/models/User";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<"pl" | "en" | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  // Only create user object if user is logged in and has an id
  const user = session?.user?.id
    ? ({
        _id: session.user.id,
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || ["user"],
        isPremiumPersonal: session.user.isPremiumPersonal || false,
        isPremiumProfessional: session.user.isPremiumProfessional || false,
        activeContext: session.user.activeContext || "user",
      } as User)
    : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (sectionId: string) => {
    if (pathname === "/") {
      // On main page - smooth scroll
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 68; // Height of the fixed navigation
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: "smooth",
        });
      }
    } else {
      // On subpage - redirect to main page with hash
      router.push(`/?section=${sectionId}`);
    }
  };

  // Handle scroll after redirecting from subpage
  useEffect(() => {
    if (pathname === "/") {
      const urlParams = new URLSearchParams(window.location.search);
      const sectionId = urlParams.get("section");
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          const navHeight = 68;
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navHeight,
            behavior: "smooth",
          });
          // Remove parameter from URL after scrolling
          window.history.replaceState({}, "", "/");
        }
      }
    }
  }, [pathname]);

  const handleAuth = (type: "login" | "register") => {
    const route = type === "login" ? "/auth/login" : "/auth/register";
    router.push(route);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const changeLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    setIsChangingLanguage(true);
    setTargetLanguage(newLocale as "pl" | "en");
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setTimeout(() => {
      router.refresh();
      setTimeout(() => {
        setIsChangingLanguage(false);
        setTargetLanguage(null);
      }, 500);
    }, 300);
  };

  return (
    <>
      {/* Language change overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-[60] transition-opacity duration-500 flex items-center justify-center ${
          isChangingLanguage ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {targetLanguage && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
              <svg
                className="w-5 h-5 mr-2 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="font-medium">
                {t("changingTo")}{" "}
                {targetLanguage === "pl" ? t("polish") : t("english")}
              </span>
            </div>
          </div>
        )}
      </div>{" "}
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 h-[68px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left side - Logo and Navigation */}{" "}
            <div className="flex items-center space-x-8">
              <div
                onClick={() => router.push("/")}
                className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent whitespace-nowrap cursor-pointer hover:cursor-pointer"
              >
                AthletiX
              </div>

              {/* Desktop Navigation */}
              <DesktopNav handleNavigation={handleNavigation} />
            </div>
            {/* Right side - Theme, Language, Auth */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector
                locale={locale}
                changeLanguage={changeLanguage}
                setIsMenuOpen={setIsMenuOpen}
              />{" "}
              <AuthButtons
                handleAuth={handleAuth}
                user={user}
                onLogout={handleLogout}
              />
              {/* Mobile Menu Button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                ref={buttonRef}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>{" "}
        </div>{" "}
        {/* Mobile Menu */}{" "}
        <div
          ref={menuRef}
          className={`fixed left-0 right-0 top-[68px] md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-all duration-500 ease-in-out transform origin-top ${
            isMenuOpen
              ? "translate-y-0 opacity-100 scale-y-100"
              : "-translate-y-1 opacity-0 scale-y-95 pointer-events-none"
          }`}
        >
          <MobileNav
            handleNavigation={handleNavigation}
            handleAuth={handleAuth}
            setIsMenuOpen={setIsMenuOpen}
            locale={locale}
            changeLanguage={changeLanguage}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </nav>
    </>
  );
}
