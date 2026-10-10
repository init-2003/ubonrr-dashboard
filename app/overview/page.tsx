"use client";

import * as React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { KPICards } from "@/components/KPICards";
import { OverviewSkeleton } from "@/components/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  const { dashboardData, isLoading, refreshData, error } = useDashboard();

  if (isLoading && !dashboardData) {
    return <OverviewSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
          ไม่สามารถแสดงผลข้อมูลภาพรวมได้
        </h3>
        <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
          {error || "ไม่สามารถดึงข้อมูลจากระบบได้ หรือการเชื่อมต่อฐานข้อมูลล่าช้า กรุณาลองใหม่อีกครั้ง"}
        </p>
        <Button
          onClick={refreshData}
          disabled={isLoading}
          className="mt-5 gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>โหลดข้อมูลใหม่</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-opacity duration-200">
      <KPICards
        summary={dashboardData.summary}
        monthlyData={dashboardData.monthlyData}
      />
    </div>
  );
}
