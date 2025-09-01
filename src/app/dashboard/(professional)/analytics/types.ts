"use client";

export interface AnalyticsData {
  totalClients: number;
  activeClients: number;
  avgProgress: number;
  totalPlans: number;
  completedPlans: number;
  revenue: number;
  monthlyGrowth: number;
}

export interface ClientProgress {
  id: string;
  name: string;
  type: "nutrition" | "training" | "both";
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  progress: number;
  workoutsCompleted: number;
  nutritionLogged: number;
  lastActivity: string;
}

export interface MonthlyStats {
  month: string;
  newClients: number;
  completedPlans: number;
  avgProgress: number;
  revenue: number;
}
