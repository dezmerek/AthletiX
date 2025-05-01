"use client";
import { useState } from "react";

type PlanFeatures = {
  title: string;
  description: string;
  price: string;
  features: string[];
};

type PlanType = {
  free: PlanFeatures;
  pro: PlanFeatures;
};

type PlanTypes = {
  client: PlanType;
  professional: PlanType;
  business: PlanType;
};

const planTypes: PlanTypes = {
  client: {
    free: {
      title: "Darmowy",
      description: "Podstawowe funkcje dla początkujących",
      price: "0",
      features: [
        "Podstawowy dziennik treningowy",
        "Podstawowe statystyki",
        "Dostęp do społeczności",
      ],
    },
    pro: {
      title: "Pro",
      description: "Zaawansowane funkcje i wsparcie",
      price: "49",
      features: [
        "Wszystko z planu Darmowego",
        "Zaawansowane analizy postępów",
        "Spersonalizowane plany treningowe",
        "Priorytetowe wsparcie",
      ],
    },
  },
  professional: {
    free: {
      title: "Darmowy",
      description: "Rozpocznij swoją praktykę",
      price: "0",
      features: [
        "Podstawowe narzędzia zarządzania klientami",
        "Ograniczona liczba klientów (do 5)",
        "Podstawowe szablony planów",
        "Podstawowa komunikacja",
      ],
    },
    pro: {
      title: "Pro",
      description: "Rozwijaj swoją praktykę",
      price: "99",
      features: [
        "Nieograniczona liczba klientów",
        "Zaawansowane narzędzia analityczne",
        "Własny branding",
        "Priorytetowe wsparcie",
      ],
    },
  },
  business: {
    free: {
      title: "Darmowy",
      description: "Poznaj możliwości",
      price: "0",
      features: [
        "Podstawowe zarządzanie klubem",
        "Do 50 członków",
        "Podstawowe raporty",
        "Standardowe wsparcie",
      ],
    },
    pro: {
      title: "Pro",
      description: "Pełna kontrola i automatyzacja",
      price: "299",
      features: [
        "Nieograniczona liczba członków",
        "Pełna automatyzacja",
        "Zaawansowana analityka biznesowa",
        "Dedykowane wsparcie 24/7",
      ],
    },
  },
};

export default function PricingSection() {
  const [activePlanType, setActivePlanType] =
    useState<keyof PlanTypes>("client");
  const activePlans = planTypes[activePlanType];

  return (
    <section
      id="cennik"
      className="relative py-24 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 opacity-70"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-full">
            Cennik
          </span>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Wybierz plan dla siebie
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Dopasowane rozwiązania dla każdego uczestnika ekosystemu fitness
          </p>

          <div className="inline-flex rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-2 mb-12 shadow-sm">
            <button
              type="button"
              onClick={() => setActivePlanType("client")}
              className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                activePlanType === "client"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Dla klientów
            </button>
            <button
              type="button"
              onClick={() => setActivePlanType("professional")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-colors ${
                activePlanType === "professional"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Dla profesjonalistów
            </button>
            <button
              type="button"
              onClick={() => setActivePlanType("business")}
              className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                activePlanType === "business"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Dla firm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 border border-slate-200 flex flex-col min-h-[600px]">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {activePlans.free.title}
              </h3>
              <p className="text-slate-600">{activePlans.free.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-800">
                {activePlans.free.price} zł
              </span>
              <span className="text-slate-500">/miesiąc</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {activePlans.free.features.map(
                (feature: string, index: number) => (
                  <li key={index} className="flex items-start text-slate-600">
                    <svg
                      className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                )
              )}
            </ul>
            <button
              type="button"
              className="w-full py-3 cursor-pointer px-4 rounded-xl border-2 border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-500 font-medium transition-colors mt-auto"
            >
              Rozpocznij za darmo
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-slate-700 flex flex-col min-h-[600px] relative overflow-hidden">
            <div className="absolute top-5 -right-10 w-36 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-1 text-center rotate-45 text-xs font-medium">
              Popularne
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {activePlans.pro.title}
              </h3>
              <p className="text-slate-300">{activePlans.pro.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {activePlans.pro.price} zł
              </span>
              <span className="text-slate-300">/miesiąc</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {activePlans.pro.features.map(
                (feature: string, index: number) => (
                  <li key={index} className="flex items-start text-slate-300">
                    <svg
                      className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                )
              )}
            </ul>
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all mt-auto cursor-pointer"
            >
              Wybierz plan Pro
            </button>
          </div>

          <div className="hidden">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Darmowy
              </h3>
              <ul className="space-y-4">
                <li>Podstawowe narzędzia zarządzania klientami</li>
                <li>Ograniczona liczba klientów</li>
                <li>Podstawowe szablony planów</li>
              </ul>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">
                Pro dla profesjonalistów
              </h3>
              <ul className="space-y-4">
                <li>Nieograniczona liczba klientów</li>
                <li>Zaawansowane narzędzia analityczne</li>
                <li>Własny branding</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Darmowy dla firm
              </h3>
              <ul className="space-y-4">
                <li>Podstawowe zarządzanie klubem</li>
                <li>Do 50 członków</li>
                <li>Podstawowe raporty</li>
              </ul>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Pro dla firm</h3>
              <ul className="space-y-4">
                <li>Nieograniczona liczba członków</li>
                <li>Pełna automatyzacja</li>
                <li>Zaawansowana analityka biznesowa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
