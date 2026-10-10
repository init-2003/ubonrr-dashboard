"use client";

import * as React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FinancialSankeyChart } from "@/components/FinancialSankeyChart";

export default function SankeyPage() {
  const { selectedYear, selectedMonth, setMonth } = useDashboard();

  return (
    <div className="w-full transition-opacity duration-200 animate-float-up delay-row-1">
      <FinancialSankeyChart
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setMonth}
      />
    </div>
  );
}
