"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  RefreshCw,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PeriodPicker } from "@/components/PeriodPicker";
import { cn } from "@/lib/utils";
import { NavTabValue } from "@/components/Sidebar";

interface HeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
  onRefresh: () => void;
  onExportCSV?: () => void;
  isLoading: boolean;
  dataSource?: "database";
  databaseError?: string | null;
  activeTab?: NavTabValue;
  onOpenMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const TAB_NAMES: Record<NavTabValue, string> = {
  overview: "ภาพรวมบริหาร (Overview)",
  sankey: "ผังกระแสการเงิน (Financial Flow)",
  revenue: "ช่องทางรายได้ (Revenue Mix)",
  expenses: "เจาะลึกค่าใช้จ่าย (Expense Drilldown)",
  table: "ตารางการเงิน (Data Grid)",
};

export function Header({
  selectedYear,
  onYearChange,
  availableYears,
  selectedMonth,
  onMonthChange,
  onRefresh,
  isLoading,
  databaseError,
  activeTab = "overview",
  onOpenMobileSidebar,
}: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  return (
    <header className="sticky top-0 z-30 w-full pt-3 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-5 sm:px-6 rounded-full border border-slate-200/90 bg-white/90 shadow-xs backdrop-blur-md transition-all dark:border-slate-800/90 dark:bg-slate-900/90">
        {/* Left: Sidebar Toggle + Active Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileSidebar}
            className="h-8 w-8 rounded-full shrink-0 md:hidden"
            title="เปิดเมนู"
          >
            <Menu className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </Button>

          {/* Active View Title */}
          <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="truncate text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {TAB_NAMES[activeTab] || "ภาพรวมบริหาร"}
            </h2>
            {databaseError && (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300"
                title={databaseError}
              >
                ฐานข้อมูลแจ้งเตือน
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Period Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unified Month-Year Period Picker */}
          <PeriodPicker
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            availableYears={availableYears}
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />

          {/* Refresh Button (Icon-only) */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="group h-8 w-8 rounded-full border-slate-200/90 bg-white/90 shadow-xs transition-all duration-200 hover:bg-slate-100 active:scale-80 hover:scale-105 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-800 cursor-pointer"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 text-slate-700 dark:text-slate-300 transition-transform duration-500 ease-out group-hover:rotate-180 group-active:rotate-360",
                isLoading && "animate-spin"
              )}
            />
          </Button>

          {/* Dark / Light Mode Toggle */}
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              className="group h-8 w-8 rounded-full border-slate-200/90 bg-white/90 shadow-xs transition-all duration-200 hover:bg-slate-100 active:scale-80 hover:scale-105 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-800 cursor-pointer"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "สลับเป็นธีมสว่าง (Light Mode)" : "สลับเป็นธีมมืด (Dark Mode)"}
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5 text-slate-700 dark:text-white transition-transform duration-300 ease-out group-hover:rotate-45 group-active:rotate-90 group-active:scale-75" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-700 dark:text-white transition-transform duration-300 ease-out group-hover:-rotate-12 group-active:-rotate-45 group-active:scale-75" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
