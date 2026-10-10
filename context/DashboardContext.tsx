"use client";

import * as React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardApiResponse } from "@/lib/types";

interface DashboardContextType {
  selectedYear: number;
  setYear: (year: number) => void;
  sankeyMonth: number | null;
  setSankeyMonth: (month: number | null) => void;
  expensesMonth: number | null;
  setExpensesMonth: (month: number | null) => void;
  selectedMonth: number | null;
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
  const initialMonthVal = initialMonthParam ? parseInt(initialMonthParam, 10) : null;

  const [selectedYear, setSelectedYear] = React.useState<number>(initialYear);
  // Separate, independent month states for Sankey and Expenses
  const [sankeyMonth, setSankeyMonthState] = React.useState<number | null>(() => {
    return pathname === "/sankey" ? initialMonthVal : null;
  });
  const [expensesMonth, setExpensesMonthState] = React.useState<number | null>(() => {
    return pathname === "/expenses" ? initialMonthVal : null;
  });

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

  const setSankeyMonth = React.useCallback(
    (month: number | null) => {
      setSankeyMonthState(month);
      if (pathname === "/sankey") {
        const params = new URLSearchParams();
        if (selectedYear !== 2026) params.set("year", selectedYear.toString());
        if (month !== null) params.set("month", month.toString());
        const qs = params.toString();
        const newUrl = qs ? `/sankey?${qs}` : `/sankey`;
        window.history.pushState(null, "", newUrl);
      }
    },
    [pathname, selectedYear]
  );

  const setExpensesMonth = React.useCallback(
    (month: number | null) => {
      setExpensesMonthState(month);
      if (pathname === "/expenses") {
        const params = new URLSearchParams();
        if (selectedYear !== 2026) params.set("year", selectedYear.toString());
        if (month !== null) params.set("month", month.toString());
        const qs = params.toString();
        const newUrl = qs ? `/expenses?${qs}` : `/expenses`;
        window.history.pushState(null, "", newUrl);
      }
    },
    [pathname, selectedYear]
  );

  const selectedMonth = pathname === "/sankey" ? sankeyMonth : pathname === "/expenses" ? expensesMonth : null;

  const setMonth = React.useCallback(
    (month: number | null) => {
      if (pathname === "/sankey") {
        setSankeyMonth(month);
      } else if (pathname === "/expenses") {
        setExpensesMonth(month);
      }
    },
    [pathname, setSankeyMonth, setExpensesMonth]
  );

  const setYear = (year: number) => {
    setSelectedYear(year);
    const params = new URLSearchParams();
    if (year !== 2026) params.set("year", year.toString());
    const isSankey = pathname === "/sankey";
    const isExpenses = pathname === "/expenses";
    if (isSankey && sankeyMonth !== null) params.set("month", sankeyMonth.toString());
    if (isExpenses && expensesMonth !== null) params.set("month", expensesMonth.toString());
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    window.history.pushState(null, "", newUrl);
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
      const monthParam = params.get("month");
      const urlMonth = monthParam ? parseInt(monthParam, 10) : null;

      setSelectedYear(urlYear);
      if (window.location.pathname === "/sankey") {
        setSankeyMonthState(urlMonth);
      } else if (window.location.pathname === "/expenses") {
        setExpensesMonthState(urlMonth);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync state when URL search params change (e.g., direct navigation or router.push)
  React.useEffect(() => {
    const monthParam = searchParams.get("month");
    const parsed = monthParam ? parseInt(monthParam, 10) : null;
    if (pathname === "/sankey") {
      setSankeyMonthState(parsed);
    } else if (pathname === "/expenses") {
      setExpensesMonthState(parsed);
    }
  }, [pathname, searchParams]);

  // Automatically clean up ?month= from URL for pages that show yearly data (overview, revenue, table)
  React.useEffect(() => {
    const isMonthSupported = pathname === "/sankey" || pathname === "/expenses";
    if (!isMonthSupported) {
      if (searchParams.has("month")) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("month");
        const qs = params.toString();
        const cleanUrl = qs ? `${pathname}?${qs}` : pathname;
        router.replace(cleanUrl, { scroll: false });
      }
    }
  }, [pathname, searchParams, router]);

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
      setExpensesMonthState(month);
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
    setYear,
    sankeyMonth,
    setSankeyMonth,
    expensesMonth,
    setExpensesMonth,
    selectedMonth,
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
