"use client";

import { useState, useEffect } from "react";

import HeaderControls from "./HeaderControls";
import KeyMetrics from "./KeyMetrics";
import Charts from "./Charts";
import ClientProgressTable from "./ClientProgressTable";
import QuickActions from "./QuickActions";
import ReportModal from "./ReportModal";
import InsightsModal from "./InsightsModal";
import ScheduleReviewModal from "./ScheduleReviewModal";
import { AnalyticsData, ClientProgress, MonthlyStats } from "./types";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [selectedMetric, setSelectedMetric] = useState<
    "clients" | "progress" | "revenue"
  >("clients");

  // Real data states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [clientProgress, setClientProgress] = useState<ClientProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "/api/professional/analytics?timeRange=month"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();

      // Transform real data to match our interface
      const transformedAnalyticsData: AnalyticsData = {
        totalClients: data.analytics.clients.total || 0,
        activeClients: data.analytics.clients.active || 0,
        avgProgress: data.analytics.progress.avgProgress || 0,
        totalPlans: data.analytics.plans.total || 0,
        completedPlans: data.analytics.plans.completed || 0,
        revenue: data.analytics.revenue.projectedRevenue || 0,
        monthlyGrowth: data.analytics.revenue.monthlyGrowth || 0,
      };

      setAnalyticsData(transformedAnalyticsData);

      // Transform real client progress data from topPerformers
      const transformedClientProgress: ClientProgress[] =
        data.analytics.progress.topPerformers?.map(
          (
            client: {
              _id?: string;
              name?: string;
              progress?: number;
              startWeight?: number;
              currentWeight?: number;
              targetWeight?: number;
              trainerTargetWeight?: string;
              planType?: string;
              createdAt?: string;
              workoutsCompleted?: number;
              nutritionLogged?: number;
              lastActivity?: string;
            },
            index: number
          ) => ({
            id: client._id || `client-${index}`,
            name: client.name || "Nieznany klient",
            type: client.planType || "both",
            startWeight: client.startWeight || 70,
            currentWeight: client.currentWeight || 70,
            targetWeight: client.trainerTargetWeight
              ? parseFloat(client.trainerTargetWeight)
              : client.targetWeight || 65,
            progress: client.progress || 0,
            workoutsCompleted: client.workoutsCompleted || 0,
            completedWorkouts: client.completedWorkouts || 0,
            totalWorkoutTime: client.totalWorkoutTime || 0,
            avgWorkoutTime: client.avgWorkoutTime || 0,
            nutritionLogged: client.nutritionLogged || 0,
            lastActivity: client.lastActivity
              ? new Date(client.lastActivity).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            lastWorkouts: client.lastWorkouts || [],
          })
        ) || [];

      // If no real clients, use mock data as fallback
      if (transformedClientProgress.length === 0) {
        const mockClientProgress: ClientProgress[] = [
          {
            id: "mock-1",
            name: "Anna Kowalska",
            type: "both",
            startWeight: 72,
            currentWeight: 68,
            targetWeight: 65,
            progress: 85,
            workoutsCompleted: 15,
            completedWorkouts: 12,
            totalWorkoutTime: 1800,
            avgWorkoutTime: 45,
            nutritionLogged: 12,
            lastActivity: "2024-01-15",
            lastWorkouts: [
              {
                id: "w1",
                name: "Trening A - Plecy i biceps",
                type: "strength",
                date: "2024-01-15T10:00:00Z",
                duration: 45,
                calories: 0,
                exercisesCount: 6,
                status: "completed",
              },
              {
                id: "w2",
                name: "Trening B - Klatka i triceps",
                type: "strength",
                date: "2024-01-13T10:00:00Z",
                duration: 50,
                calories: 0,
                exercisesCount: 5,
                status: "completed",
              },
            ],
          },
          {
            id: "mock-2",
            name: "Piotr Nowak",
            type: "training",
            startWeight: 85,
            currentWeight: 82,
            targetWeight: 80,
            progress: 60,
            workoutsCompleted: 12,
            completedWorkouts: 10,
            totalWorkoutTime: 1200,
            avgWorkoutTime: 40,
            nutritionLogged: 0,
            lastActivity: "2024-01-14",
            lastWorkouts: [
              {
                id: "w3",
                name: "Trening siłowy - Nogi",
                type: "strength",
                date: "2024-01-14T09:00:00Z",
                duration: 60,
                calories: 0,
                exercisesCount: 8,
                status: "completed",
              },
              {
                id: "w4",
                name: "Trening cardio",
                type: "cardio",
                date: "2024-01-12T08:00:00Z",
                duration: 30,
                calories: 0,
                exercisesCount: 3,
                status: "completed",
              },
            ],
          },
          {
            id: "mock-3",
            name: "Maria Wiśniewska",
            type: "nutrition",
            startWeight: 68,
            currentWeight: 66,
            targetWeight: 64,
            progress: 50,
            workoutsCompleted: 0,
            completedWorkouts: 0,
            totalWorkoutTime: 0,
            avgWorkoutTime: 0,
            nutritionLogged: 8,
            lastActivity: "2024-01-12",
            lastWorkouts: [],
          },
        ];
        setClientProgress(mockClientProgress);
      } else {
        setClientProgress(transformedClientProgress);
      }

      // Transform real monthly data from API
      const transformedMonthlyStats: MonthlyStats[] =
        data.analytics.monthlyData?.map(
          (monthData: {
            month: string;
            clients: number;
            plans: number;
            progress: number;
            revenue: number;
          }) => ({
            month: monthData.month,
            newClients: monthData.clients,
            completedPlans: monthData.plans,
            avgProgress: monthData.progress,
            revenue: monthData.revenue,
          })
        ) || [];

      // If no real monthly data, use mock data as fallback
      if (transformedMonthlyStats.length === 0) {
        const mockMonthlyStats: MonthlyStats[] = [
          {
            month: "Sty",
            newClients: 3,
            completedPlans: 2,
            avgProgress: 65,
            revenue: 1200,
          },
          {
            month: "Lut",
            newClients: 5,
            completedPlans: 3,
            avgProgress: 68,
            revenue: 1800,
          },
          {
            month: "Mar",
            newClients: 4,
            completedPlans: 4,
            avgProgress: 71,
            revenue: 1600,
          },
          {
            month: "Kwi",
            newClients: 6,
            completedPlans: 5,
            avgProgress: 73,
            revenue: 2200,
          },
          {
            month: "Maj",
            newClients: 3,
            completedPlans: 3,
            avgProgress: 75,
            revenue: 1400,
          },
          {
            month: "Cze",
            newClients: 7,
            completedPlans: 6,
            avgProgress: 78,
            revenue: 2400,
          },
        ];
        setMonthlyStats(mockMonthlyStats);
      } else {
        setMonthlyStats(transformedMonthlyStats);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Real monthly stats from API
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);

  const [showReportModal, setShowReportModal] = useState(false);

  const generateReport = async () => {
    try {
      setShowReportModal(true);
    } catch (error) {
      console.error("Błąd podczas generowania raportu:", error);
      alert("Wystąpił błąd podczas generowania raportu.");
    }
  };

  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">
                Ładowanie danych analitycznych...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Błąd podczas ładowania danych
                </h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                <button
                  onClick={fetchAnalytics}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Spróbuj ponownie
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no data
  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              Brak danych do wyświetlenia
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <HeaderControls
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />

        <KeyMetrics data={analyticsData} />

        <Charts stats={monthlyStats} />

        {/* Client Progress Table */}
        <ClientProgressTable rows={clientProgress} />

        {/* Quick Actions */}
        <QuickActions
          onGenerateReport={generateReport}
          onViewInsights={() => setShowInsightsModal(true)}
          onScheduleReview={() => setShowScheduleModal(true)}
        />

        <ReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportData={{
            period: selectedPeriod,
            metric: selectedMetric,
            analyticsData: analyticsData,
            clientProgress: clientProgress,
            monthlyStats: monthlyStats,
          }}
        />
        <InsightsModal
          open={showInsightsModal}
          onClose={() => setShowInsightsModal(false)}
          rows={clientProgress}
        />
        <ScheduleReviewModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          clients={clientProgress}
        />
      </div>
    </div>
  );
}
