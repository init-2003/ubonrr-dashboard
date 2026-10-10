"use client";

import * as React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardApiResponse } from "@/lib/types";

interface DashboardContextType {
  selectedYear: number;
  selectedMonth: number | null;
  setYear: (year: number) => void;
  setMonth: (month: number | null) => void;
  dashboardData: DashboardApiResponse | null;
  isLoading: boolean;
  error: string | null;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  refreshData: () => void;
  handleExportCSV: () => void;
  navigateToExpensesWithMonth: (month: number) => void;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Read initial query params from URL
  const initialYear = parseInt(searchParams.get("year") || "2026", 10) || 2026;
  const initialMonthParam = searchParams.get("month");
  const initialMonth = initialMonthParam ? parseInt(initialMonthParam, 10) : null;

  const [selectedYear, setSelectedYear] = React.useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(initialMonth);
  const [dashboardData, setDashboardData] = React.useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ubr_sidebar_collapsed");
        if (saved !== null) {
          return saved === "true";
        }
        const match = document.cookie.match(/(?:^|;\s*)ubr_sidebar_collapsed=(true|false)(?:;|$)/);
        if (match) {
          return match[1] === "true";
        }
      } catch {
        // ignore
      }
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState<boolean>(false);

  // Restore or sync sidebar collapsed state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("ubr_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
        return;
      }
      const match = document.cookie.match(/(?:^|;\s*)ubr_sidebar_collapsed=(true|false)(?:;|$)/);
      if (match) {
        setIsSidebarCollapsed(match[1] === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync state with URL without full page reloads
  const updateUrl = React.useCallback(
    (year: number, month: number | null) => {
      const params = new URLSearchParams();
      if (year !== 2026) params.set("year", year.toString());
      if (month !== null) params.set("month", month.toString());

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      window.history.pushState(null, "", newUrl);
    },
    [pathname]
  );

  const setYear = (year: number) => {
    setSelectedYear(year);
    updateUrl(year, selectedMonth);
  };

  const setMonth = (month: number | null) => {
    setSelectedMonth(month);
    updateUrl(selectedYear, month);
  };

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ubr_sidebar_collapsed", String(next));
        document.cookie = `ubr_sidebar_collapsed=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Listen for browser Back/Forward (popstate)
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlYear = parseInt(params.get("year") || "2026", 10) || 2026;
      const urlMonth = params.get("month") ? parseInt(params.get("month")!, 10) : null;

      setSelectedYear(urlYear);
      setSelectedMonth(urlMonth);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch Dashboard Data manually
  const loadDashboard = React.useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?year=${selectedYear}&refresh=true`);
      if (res.ok) {
        const data: DashboardApiResponse = await res.json();
        setDashboardData(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `เกิดข้อผิดพลาดในการโหลดข้อมูล (${res.status})`);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, isAuthenticated]);

  // Reactive data fetch for Overview & Table pages based on year and authentication state
  React.useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    // Only fetch /api/dashboard for Overview (/ or /overview) and Data Table (/table)
    const isOverviewOrTable = pathname === "/" || pathname === "/overview" || pathname === "/table";
    if (!isOverviewOrTable) {
      return;
    }

    // If data is already loaded for the selectedYear, skip re-fetching on simple tab switches
    if (dashboardData && dashboardData.year === selectedYear) {
      return;
    }

    let ignore = false;
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard?year=${selectedYear}`);
        if (res.ok) {
          const data: DashboardApiResponse = await res.json();
          if (!ignore) {
            setDashboardData(data);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (!ignore) {
            setError(errData.error || `เกิดข้อผิดพลาดในการโหลดข้อมูล (${res.status})`);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, [selectedYear, isAuthenticated, isAuthLoading, pathname]);

  // Export CSV
  const handleExportCSV = React.useCallback(() => {
    if (!dashboardData) return;

    const headers = [
      "ปี (YearSale)",
      "เดือน (MonthSale)",
      "ชื่อเดือน",
      "ยอดขายส่ง (Wholesale)",
      "ยอดขายปลีก (Retail)",
      "รายได้รวม (Total Revenue)",
      "ต้นทุนสินค้า (COGS)",
      "กำไรขั้นต้น (Gross Profit)",
      "อัตรากำไรขั้นต้น (%)",
      "ค่าใช้จ่ายดำเนินงาน (OPEX)",
      "กำไรสุทธิ (Net Profit)",
      "อัตรากำไรสุทธิ (%)",
    ];

    const rows = dashboardData.monthlyData.map((m) => [
      m.YearSale,
      m.MonthSale,
      m.MonthFullName,
      m.WholesaleRevenue,
      m.RetailRevenue,
      m.TotalRevenue,
      m.COGS,
      m.GrossProfit,
      m.GrossMarginPercent,
      m.OperatingExpenses,
      m.NetProfit,
      m.NetMarginPercent,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DBUbonRR_Financial_Summary_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [dashboardData, selectedYear]);

  // Drilldown to Expenses with month
  const navigateToExpensesWithMonth = React.useCallback(
    (month: number) => {
      setSelectedMonth(month);
      const params = new URLSearchParams();
      if (selectedYear !== 2026) params.set("year", selectedYear.toString());
      params.set("month", month.toString());
      const qs = params.toString();
      router.push(`/expenses${qs ? `?${qs}` : ""}`);
    },
    [router, selectedYear]
  );

  const value: DashboardContextType = {
    selectedYear,
    selectedMonth,
    setYear,
    setMonth,
    dashboardData,
    isLoading,
    error,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
    refreshData: loadDashboard,
    handleExportCSV,
    navigateToExpensesWithMonth,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextType {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
