"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BusinessOverview from "@/components/dashboard/business/BusinessOverview";
import BusinessStats from "@/components/dashboard/business/BusinessStats";
import QuickActions from "@/components/dashboard/business/QuickActions";

export default function BusinessDashboard() {
  const { data: session } = useSession();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (!business) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Witaj w Dashboard Business!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Nie masz jeszcze utworzonej firmy. Utwórz swoją pierwszą firmę, aby
          rozpocząć.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
          Utwórz firmę
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard {business.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Zarządzaj swoją firmą i śledź postępy
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              business.subscription?.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {business.subscription?.plan === "pro" ? "Plan Pro" : "Plan Free"}
          </span>
        </div>
      </div>

      <BusinessOverview business={business} />
      <BusinessStats business={business} />
      <QuickActions business={business} />
    </div>
  );
}
