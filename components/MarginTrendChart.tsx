"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MonthlyAnalyticsData } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface MarginTrendChartProps {
  data: MonthlyAnalyticsData[];
}

export function MarginTrendChart({ data }: MarginTrendChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          <CardTitle className="text-base font-bold sm:text-lg">
            แนวโน้มอัตรากำไรขั้นต้น (Gross Margin %) เทียบกับอัตรากำไรสุทธิ (Net Margin %)
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          วิเคราะห์ประสิทธิภาพความสามารถในการทำกำไรของธุรกิจตลอด 12 เดือน
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
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
                unit="%"
              />
              <Tooltip
                cursor={false}
                formatter={(value: unknown, name: unknown) => [
                  `${Number(value || 0).toFixed(1)}%`,
                  String(name || ""),
                ]}
              />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="GrossMarginPercent"
                name="อัตรากำไรขั้นต้น (Gross Margin %)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981" }}
              />
              <Line
                type="monotone"
                dataKey="NetMarginPercent"
                name="อัตรากำไรสุทธิ (Net Margin %)"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6366f1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
