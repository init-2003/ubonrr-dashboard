"use client";

import * as React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ExpenseDrilldown } from "@/components/ExpenseDrilldown";

export default function ExpensesPage() {
  const { selectedYear, expensesMonth, setExpensesMonth } = useDashboard();

  return (
    <div className="space-y-6 transition-opacity duration-200 animate-float-up delay-row-1">
      <ExpenseDrilldown
        selectedYear={selectedYear}
        selectedMonth={expensesMonth}
        onMonthChange={setExpensesMonth}
      />
    </div>
  );
}
