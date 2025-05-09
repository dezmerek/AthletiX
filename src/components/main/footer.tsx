"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function Footer() {
  const t = useTranslations("Footer");
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (sectionId: string) => {
    if (pathname === "/") {
      // On the homepage - smooth scrolling
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 68;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: "smooth",
        });
      }
    } else {
      // On subpages - redirect to homepage with section parameter
      router.push(`/?section=${sectionId}`);
    }
  };

  const handleLegalNavigation = (page: string) => {
    router.push(`/${page}`);
  };

  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              AthletiX
            </span>
            <p className="mt-4 text-slate-400 text-sm">{t("description")}</p>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">
              {t("sections.platform.title")}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => handleNavigation("for-clients")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.forClients")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("for-professionals")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.forProfessionals")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("for-business")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.forBusiness")}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">
              {t("sections.resources.title")}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => handleLegalNavigation("documentation")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.resources.documentation")}
                </button>
              </li>
              <li>
                <button
                  disabled
                  className="text-slate-400 cursor-not-allowed"
                >
                  {t("sections.resources.helpCenter")}
                </button>
              </li>
              <li>
                <button
                  disabled
                  className="text-slate-400 cursor-not-allowed"
                >
                  {t("sections.resources.support")}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">
              {t("sections.contact.title")}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => handleLegalNavigation("contact")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.contact.writeToUs")}
                </button>
              </li>
              <li>
                <button
                  disabled
                  className="text-slate-400 cursor-not-allowed"
                >
                  {t("sections.platform.demo")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("pricing")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.pricing")}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleLegalNavigation("privacy-policy")}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t("legal.privacyPolicy")}
              </button>
              <span className="text-slate-600">•</span>
              <button 
                onClick={() => handleLegalNavigation("terms")}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t("legal.terms")}
              </button>
            </div>
            <p className="text-xs text-slate-400">{t("legal.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
