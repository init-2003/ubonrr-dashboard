"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyAnalyticsData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface MainPerformanceChartProps {
  data: MonthlyAnalyticsData[];
  onSelectMonth?: (month: number) => void;
  selectedMonth?: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const totalRev =
      (payload.find((p) => p.dataKey === "WholesaleRevenue")?.value || 0) +
      (payload.find((p) => p.dataKey === "RetailRevenue")?.value || 0);

    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <p className="mb-2 text-xs font-bold text-slate-900 dark:text-slate-100">
          เดือน: {label}
        </p>
        <div className="space-y-1 text-xs">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-xs"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          <div className="mt-2 border-t border-slate-200 pt-1.5 text-xs font-bold text-blue-600 dark:border-slate-800 dark:text-blue-400 flex justify-between">
            <span>รายได้รวมทั้งหมด:</span>
            <span>{formatCurrency(totalRev)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function MainPerformanceChart({
  data,
  onSelectMonth,
  selectedMonth,
}: MainPerformanceChartProps) {
  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <CardTitle className="text-base font-bold sm:text-lg">
              แนวโน้มรายได้ ต้นทุน ค่าใช้จ่าย และกำไรสุทธิรายเดือน
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            เปรียบเทียบ Wholesale, Retail, COGS, OPEX และเส้นกำไรสุทธิ (คลิกแท่งเพื่อเจาะลึกค่าใช้จ่าย)
          </CardDescription>
        </div>
        {selectedMonth && (
          <Badge variant="purple" className="text-xs">
            เลือกเดือน: {data.find((d) => d.MonthSale === selectedMonth)?.MonthName || selectedMonth}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(state: Record<string, unknown> | null) => {
                if (state && Array.isArray(state.activePayload) && state.activePayload.length > 0) {
                  const clickedMonth = (state.activePayload[0] as { payload?: { MonthSale?: number } }).payload?.MonthSale;
                  if (clickedMonth) {
                    onSelectMonth?.(clickedMonth);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="MonthName"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip cursor={false} content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}
              />
              <Bar
                dataKey="WholesaleRevenue"
                name="ขายส่ง (Wholesale)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                cursor="pointer"
              />
              <Bar
                dataKey="RetailRevenue"
                name="ขายปลีก (Retail)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                cursor="pointer"
              />
              <Bar
                dataKey="COGS"
                name="ต้นทุนสินค้า (COGS)"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                cursor="pointer"
              />
              <Bar
                dataKey="OperatingExpenses"
                name="ค่าใช้จ่ายดำเนินงาน (OPEX)"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                cursor="pointer"
              />
              <Line
                type="monotone"
                dataKey="NetProfit"
                name="กำไรสุทธิ (Net Profit)"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 1, stroke: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
