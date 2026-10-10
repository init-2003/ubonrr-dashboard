"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MonthlyAnalyticsData, ExecutiveKPISummary } from "@/lib/types";
import { formatCurrency, formatPercent, MONTH_NAMES_TH, MONTH_FULL_NAMES_TH } from "@/lib/utils";
import { PieChart as PieChartIcon } from "lucide-react";

interface RevenueSplitChartProps {
  data: MonthlyAnalyticsData[];
  summary: ExecutiveKPISummary;
  selectedMonth?: number | null;
  selectedYear?: number;
}

const COLORS = ["#3b82f6", "#10b981"];

export function RevenueSplitChart({
  data,
  summary,
  selectedMonth = null,
  selectedYear = 2026,
}: RevenueSplitChartProps) {
  const pieData = [
    { name: "ขายส่ง (Wholesale)", value: summary.wholesaleRevenue },
    { name: "ขายปลีก (Retail)", value: summary.retailRevenue },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* 1. Monthly Revenue Stacked Area Chart (2 cols) */}
      <Card className="col-span-1 lg:col-span-2 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <CardTitle className="text-base font-bold sm:text-lg">
              โครงสร้างสัดส่วนรายได้ ขายส่ง vs ขายปลีก รายเดือน
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            วิเคราะห์ปริมาณยอดขายสะสมแยกตามช่องทางจำหน่ายตลอดทั้งปี
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wholesaleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="MonthName"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const isSelected =
                      selectedMonth &&
                      selectedMonth >= 1 &&
                      selectedMonth <= 12 &&
                      payload?.value === MONTH_NAMES_TH[selectedMonth - 1];
                    return (
                      <text
                        x={x}
                        y={Number(y || 0) + 12}
                        textAnchor="middle"
                        fill={isSelected ? "#881224" : "#888888"}
                        className={isSelected ? "font-bold fill-[#881224] dark:fill-[#f87171]" : "fill-slate-500"}
                        fontSize={isSelected ? "12px" : "11px"}
                        fontWeight={isSelected ? 700 : 400}
                      >
                        {payload?.value}
                      </text>
                    );
                  }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  cursor={false}
                  formatter={(value: unknown, name: unknown) => [
                    formatCurrency(Number(value || 0)),
                    String(name || ""),
                  ]}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="WholesaleRevenue"
                  name="ขายส่ง (Wholesale)"
                  stackId="1"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#wholesaleGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="RetailRevenue"
                  name="ขายปลีก (Retail)"
                  stackId="1"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#retailGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Year / Month Revenue Split Donut Chart (1 col) */}
      <Card className="col-span-1 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold sm:text-lg">
            {selectedMonth && selectedMonth >= 1 && selectedMonth <= 12
              ? `สัดส่วนรายได้ประจำเดือน ${MONTH_NAMES_TH[selectedMonth - 1]}`
              : "สัดส่วนรายได้รวมทั้งปี"}
          </CardTitle>
          <CardDescription className="text-xs">
            {selectedMonth && selectedMonth >= 1 && selectedMonth <= 12
              ? `Wholesale vs Retail (${MONTH_FULL_NAMES_TH[selectedMonth - 1]} ${selectedYear})`
              : "Wholesale vs Retail Contribution"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-0">
          <div className="h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart className="outline-none focus:outline-none" style={{ outline: "none" }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  className="cursor-pointer select-none outline-none focus:outline-none"
                  style={{ outline: "none" }}
                  tabIndex={-1}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => {
                    const num = Number(value || 0);
                    return [
                      `${formatCurrency(num)} (${formatPercent(
                        summary.totalRevenue > 0 ? (num / summary.totalRevenue) * 100 : 0
                      )})`,
                      "",
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="w-full space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between rounded-md bg-blue-50/50 p-2 dark:bg-blue-950/30">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium text-slate-700 dark:text-slate-200">ขายส่ง:</span>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatPercent(summary.wholesalePercent)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-emerald-50/50 p-2 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700 dark:text-slate-200">ขายปลีก:</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatPercent(summary.retailPercent)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
