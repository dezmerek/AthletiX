"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 68;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
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
                  onClick={() => scrollToSection("for-clients")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.forClients")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("for-professionals")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.forProfessionals")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("for-business")}
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
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.resources.documentation")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.resources.helpCenter")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.resources.support")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-3">
              {t("sections.contact.title")}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.contact.writeToUs")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.demo")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t("sections.platform.pricing")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                {t("legal.privacyPolicy")}
              </button>
              <span className="text-slate-600">•</span>
              <button className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
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
