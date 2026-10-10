"use client";

import * as React from "react";
import SankeyDiagram from "./SankeyDiagram";
import {
  FinancialData,
  WholesaleRevenueApiResponse,
  RetailRevenueApiResponse,
  COGSApiResponse,
  OperatingExpensesApiResponse,
  ExpenseDetailApiResponse,
} from "@/lib/types";
import { SankeySkeleton } from "@/components/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancialSankeyChartProps {
  selectedYear: number;
  selectedMonth: number | null;
  onMonthChange?: (month: number | null) => void;
}

export function FinancialSankeyChart({
  selectedYear,
  selectedMonth,
  onMonthChange,
}: FinancialSankeyChartProps) {
  const [financialData, setFinancialData] = React.useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dedicated data fetching for Financial Sankey Flow via modular APIs
  const loadSankeyData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const monthQuery = selectedMonth ? `&month=${selectedMonth}` : "";

      // Concurrently query all 5 modular APIs: wholesale, retail, cogs, opex, and expense categories
      const [wholesaleRes, retailRes, cogsRes, opexRes, expenseRes] = await Promise.all([
        fetch(`/api/revenue/wholesale?year=${selectedYear}${monthQuery}`),
        fetch(`/api/revenue/retail?year=${selectedYear}${monthQuery}`),
        fetch(`/api/cogs?year=${selectedYear}${monthQuery}`),
        fetch(`/api/operating-expenses?year=${selectedYear}${monthQuery}`),
        fetch(`/api/expenses/detail?year=${selectedYear}${monthQuery}`),
      ]);

      if (!wholesaleRes.ok || !retailRes.ok || !cogsRes.ok || !opexRes.ok) {
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลกระแสการเงินจาก API");
      }

      const wholesaleJson: WholesaleRevenueApiResponse = await wholesaleRes.json();
      const retailJson: RetailRevenueApiResponse = await retailRes.json();
      const cogsJson: COGSApiResponse = await cogsRes.json();
      const opexJson: OperatingExpensesApiResponse = await opexRes.json();
      const expenseJson: ExpenseDetailApiResponse = expenseRes.ok
        ? await expenseRes.json()
        : { categories: [] };

      // Compute figures from dedicated modular endpoints
      const wholesaleRevenue = wholesaleJson.totalWholesaleRevenue || 0;
      const retailRevenue = retailJson.totalRetailRevenue || 0;
      const cogs = cogsJson.totalCOGS || 0;
      const operatingExpenses = opexJson.totalOperatingExpenses || 0;
      const expenseCategories = expenseJson.categories || [];

      setFinancialData({
        wholesaleRevenue,
        retailRevenue,
        cogs,
        operatingExpenses,
        expenseCategories,
        tax: 0,
      });
    } catch (err) {
      console.error("Failed to load Sankey flow data", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  React.useEffect(() => {
    loadSankeyData();
  }, [loadSankeyData]);

  if (isLoading && !financialData) {
    return <SankeySkeleton />;
  }

  if (error && !financialData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
          ไม่สามารถแสดงผลผังกระแสการเงินได้
        </h3>
        <p className="mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
          {error}
        </p>
        <Button
          onClick={loadSankeyData}
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
    <div className="w-full">
      {financialData && (
        <SankeyDiagram
          data={financialData}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
      )}
    </div>
  );
}

export { SankeyDiagram };
