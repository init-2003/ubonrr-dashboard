"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, NavTabValue } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useDashboard } from "@/context/DashboardContext";
import { cn } from "@/lib/utils";

const PATH_TO_TAB: Record<string, NavTabValue> = {
  "/": "overview",
  "/overview": "overview",
  "/sankey": "sankey",
  "/revenue": "revenue",
  "/expenses": "expenses",
  "/table": "table",
};

const TAB_TO_PATH: Record<NavTabValue, string> = {
  overview: "/overview",
  sankey: "/sankey",
  revenue: "/revenue",
  expenses: "/expenses",
  table: "/table",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    selectedYear,
    setYear,
    sankeyMonth,
    expensesMonth,
    selectedMonth,
    setMonth,
    dashboardData,
    isLoading,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
    refreshData,
    handleExportCSV,
  } = useDashboard();

  const activeTab: NavTabValue = PATH_TO_TAB[pathname] || "overview";

  // Prefetch all dashboard pages for instant 0ms transitions
  React.useEffect(() => {
    router.prefetch("/overview");
    router.prefetch("/sankey");
    router.prefetch("/revenue");
    router.prefetch("/expenses");
    router.prefetch("/table");
  }, [router]);

  const handleTabChange = (newTab: NavTabValue) => {
    const targetPath = TAB_TO_PATH[newTab] || "/overview";
    const params = new URLSearchParams();
    if (selectedYear !== 2026) params.set("year", selectedYear.toString());
    
    // Each page keeps its own independent month state (do NOT sync between sankey and expenses!)
    if (newTab === "sankey" && sankeyMonth !== null) {
      params.set("month", sankeyMonth.toString());
    } else if (newTab === "expenses" && expensesMonth !== null) {
      params.set("month", expensesMonth.toString());
    }

    const qs = params.toString();
    const newUrl = qs ? `${targetPath}?${qs}` : targetPath;
    router.push(newUrl);
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black font-sans">
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* 2. Main Content Shell */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin-left] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] min-w-0",
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Top Header Bar */}
        <Header
          selectedYear={selectedYear}
          onYearChange={setYear}
          selectedMonth={selectedMonth}
          onMonthChange={setMonth}
          onRefresh={refreshData}
          onExportCSV={handleExportCSV}
          isLoading={isLoading}
          dataSource={dashboardData?.dataSource || "database"}
          databaseError={dashboardData?.databaseError}
          activeTab={activeTab}
          onOpenMobileSidebar={openMobileSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dashboard Main Content Area */}
        <main className="flex-1 w-full px-4 pt-3 pb-6 sm:px-6 lg:px-8">
          <div key={pathname} className="w-full space-y-6 animate-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
