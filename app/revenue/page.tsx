"use client";

import * as React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { RevenueSplitChart } from "@/components/RevenueSplitChart";
import { RevenueSkeleton } from "@/components/skeleton";
import { AlertCircle, RefreshCw, Store, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  WholesaleRevenueApiResponse,
  RetailRevenueApiResponse,
  MonthlyAnalyticsData,
  ExecutiveKPISummary,
} from "@/lib/types";
import {
  MONTH_NAMES_TH,
  MONTH_FULL_NAMES_TH,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";

export default function RevenuePage() {
  const { selectedYear } = useDashboard();
  const [wholesaleData, setWholesaleData] = React.useState<WholesaleRevenueApiResponse | null>(null);
  const [retailData, setRetailData] = React.useState<RetailRevenueApiResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dedicated data fetching for Revenue channels via modular APIs
  const fetchRevenue = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [wsRes, rtRes] = await Promise.all([
        fetch(`/api/revenue/wholesale?year=${selectedYear}`),
        fetch(`/api/revenue/retail?year=${selectedYear}`),
      ]);

      if (!wsRes.ok || !rtRes.ok) {
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลช่องทางรายได้จาก API");
      }

      const wsJson: WholesaleRevenueApiResponse = await wsRes.json();
      const rtJson: RetailRevenueApiResponse = await rtRes.json();

      setWholesaleData(wsJson);
      setRetailData(rtJson);
    } catch (err) {
      console.error("Revenue page fetch error:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  React.useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  // Combine modular wholesale and retail data into 12-month analytics and summary
  const { monthlyData, summary } = React.useMemo(() => {
    const wsItems = wholesaleData?.data || [];
    const rtItems = retailData?.data || [];

    const totalWholesale =
      wholesaleData?.totalWholesaleRevenue ??
      wsItems.reduce((acc, item) => acc + (Number(item.WholesaleRevenue) || 0), 0);
    const totalRetail =
      retailData?.totalRetailRevenue ??
      rtItems.reduce((acc, item) => acc + (Number(item.RetailRevenue) || 0), 0);
    const totalRevenue = totalWholesale + totalRetail;

    const monthly: MonthlyAnalyticsData[] = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const wsFound = wsItems.find((d) => d.MonthSale === monthNum);
      const rtFound = rtItems.find((d) => d.MonthSale === monthNum);

      const ws = wsFound ? Number(wsFound.WholesaleRevenue) || 0 : 0;
      const rt = rtFound ? Number(rtFound.RetailRevenue) || 0 : 0;
      const total = ws + rt;

      const wsShare = total > 0 ? (ws / total) * 100 : 0;
      const rtShare = total > 0 ? (rt / total) * 100 : 0;

      return {
        YearSale: selectedYear,
        MonthSale: monthNum,
        MonthName: MONTH_NAMES_TH[i],
        MonthFullName: MONTH_FULL_NAMES_TH[i],
        WholesaleRevenue: ws,
        RetailRevenue: rt,
        TotalRevenue: total,
        COGS: 0,
        OperatingExpenses: 0,
        TotalCostAndExpense: 0,
        GrossProfit: total,
        NetProfit: total,
        GrossMarginPercent: 100,
        NetMarginPercent: 100,
        WholesaleSharePercent: Number(wsShare.toFixed(2)),
        RetailSharePercent: Number(rtShare.toFixed(2)),
      };
    });

    const activeWholesale = totalWholesale;
    const activeRetail = totalRetail;
    const activeTotal = totalRevenue;

    const summaryObj: ExecutiveKPISummary = {
      totalRevenue: activeTotal,
      wholesaleRevenue: activeWholesale,
      retailRevenue: activeRetail,
      cogs: 0,
      operatingExpenses: 0,
      grossProfit: activeTotal,
      netProfit: activeTotal,
      grossMarginPercent: 100,
      netMarginPercent: 100,
      cogsRatioPercent: 0,
      opexRatioPercent: 0,
      wholesalePercent: activeTotal > 0 ? Number(((activeWholesale / activeTotal) * 100).toFixed(1)) : 0,
      retailPercent: activeTotal > 0 ? Number(((activeRetail / activeTotal) * 100).toFixed(1)) : 0,
      bestMonth: null,
      lowestMonth: null,
    };

    return { monthlyData: monthly, summary: summaryObj };
  }, [wholesaleData, retailData, selectedYear]);

  if (isLoading && !wholesaleData && !retailData) {
    return <RevenueSkeleton selectedYear={selectedYear} />;
  }

  if (error && !wholesaleData && !retailData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
          ไม่สามารถแสดงผลช่องทางรายได้ได้
        </h3>
        <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
          {error}
        </p>
        <Button
          onClick={fetchRevenue}
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
      {/* 1. Channel Revenue KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-float-up delay-row-1">
        {/* Total Revenue */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              รายได้รวมทุกช่องทาง (Total Revenue)
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-slate-900 dark:text-slate-100" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ปี {selectedYear} (รวมขายส่ง + ขายปลีกตลอดทั้งปี)
            </p>
          </CardContent>
        </Card>

        {/* Wholesale Revenue */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ยอดขายส่ง (Wholesale Revenue)
            </CardTitle>
            <Store className="h-5 w-5 text-slate-900 dark:text-slate-100" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-[#3b82f6]">
              {formatCurrency(summary.wholesaleRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              สัดส่วน <span className="font-bold text-slate-800 dark:text-slate-200">{formatPercent(summary.wholesalePercent)}</span>{" "}
              ของรายได้รวมทั้งปี
            </p>
          </CardContent>
        </Card>

        {/* Retail Revenue */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ยอดขายปลีก (Retail Revenue)
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-slate-900 dark:text-slate-100" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.retailRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              สัดส่วน <span className="font-bold text-slate-800 dark:text-slate-200">{formatPercent(summary.retailPercent)}</span>{" "}
              ของรายได้รวมทั้งปี
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Primary Revenue Split Chart */}
      <div className="animate-float-up delay-row-2">
        <RevenueSplitChart
          data={monthlyData}
          summary={summary}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
}
