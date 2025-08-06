"use client";

import { useUserActivity } from "@/hooks/useUserActivity";
import { NotificationProvider } from "@/contexts/NotificationContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  // Track user activity across the dashboard
  useUserActivity({
    enabled: true,
    updateInterval: 15000, // 15 seconds
    onlineThreshold: 120000, // 2 minutes
    offlineAfter: 300000, // 5 minutes
  });

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <DashboardTopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  );
}
