"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BusinessOverview from "@/components/dashboard/business/BusinessOverview";
import BusinessStats from "@/components/dashboard/business/BusinessStats";
import QuickActions from "@/components/dashboard/business/QuickActions";
import CreateBusinessModal from "@/components/dashboard/business/CreateBusinessModal";

interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  settings: {
    maxStaff: number;
    maxMembers: number;
    features: string[];
  };
  staff: string[];
  members: string[];
  createdAt: string;
}

export default function BusinessPage() {
  const { data: session } = useSession();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBusiness();
    }
  }, [session]);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(
        `/api/business?ownerId=${session?.user?.id}`
      );
      const data = await response.json();

      if (data.businesses && data.businesses.length > 0) {
        setBusiness(data.businesses[0]);
      }
    } catch (error) {
      console.error("Error fetching business:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      {business ? (
        <>
          {/* Header Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dashboard {business.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Zarządzaj swoją firmą i śledź postępy
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    business.subscription?.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {business.subscription?.plan === "pro"
                    ? "Plan Pro"
                    : "Plan Free"}
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="space-y-6">
            <BusinessOverview business={business} />
            <BusinessStats business={business} />
            <QuickActions business={business} />
          </div>
        </>
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Witaj w Dashboard Business!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Nie masz jeszcze utworzonej firmy. Utwórz swoją pierwszą firmę,
              aby rozpocząć zarządzanie i rozwój biznesu.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                  Zarządzaj zespołem
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dodawaj pracowników i członków
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                  Śledź postępy
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Analizuj dane i raporty
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm">
                  Kontroluj finanse
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Zarządzaj płatnościami
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Utwórz firmę</span>
            </button>
          </div>
        </div>
      )}

      <CreateBusinessModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchBusiness(); // Refresh business data
        }}
      />
    </div>
  );
}
