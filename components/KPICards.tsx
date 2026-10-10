"use client";

import * as React from "react";
import {
  DollarSign,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  ShoppingBag,
  Award,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExecutiveKPISummary, MonthlyAnalyticsData } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

interface KPICardsProps {
  summary: ExecutiveKPISummary;
  monthlyData?: MonthlyAnalyticsData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  prefix?: string;
  color?: string;
}

function MiniSparklineTooltip({
  active,
  payload,
  label,
  prefix = "ยอดเงิน",
  color = "#3b82f6",
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          เดือน {label}
        </div>
        <div className="font-bold font-mono text-xs" style={{ color }}>
          {prefix}: {formatCurrency(payload[0].value)}
        </div>
      </div>
    );
  }
  return null;
}

export function KPICards({ summary, monthlyData = [] }: KPICardsProps) {
  const isNetProfitable = summary.netProfit >= 0;

  // Prepare 12-month data for sparklines from real monthly data
  const sparklineData = React.useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return [];
    }
    return monthlyData.map((m) => ({
      month: m.MonthName,
      revenue: m.TotalRevenue || 0,
      cogs: m.COGS || 0,
      opex: m.OperatingExpenses || 0,
      netProfit: m.NetProfit || 0,
    }));
  }, [monthlyData]);

  const totalCostAndExpense = summary.cogs + summary.operatingExpenses;
  const costRatio = summary.totalRevenue > 0 ? (totalCostAndExpense / summary.totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 4 Large Executive KPI Hero Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
        {/* CARD 1: TOTAL REVENUE (รายได้รวม) */}
        <Card className="relative overflow-hidden border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-float-up delay-row-1">
          <CardContent className="flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="h-6 w-6 text-slate-700 dark:text-slate-300 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      รายได้รวม (Total Revenue)
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      ยอดรวมจากการขายส่งและขายปลีก
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 text-xs font-bold text-white">
                  Inflows 100%
                </Badge>
              </div>

              {/* Big Currency Number */}
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                  {formatCurrency(summary.totalRevenue)}
                </div>
              </div>
            </div>

            {/* Embedded 12-Month Sparkline Chart */}
            <div className="my-4 h-24 w-full">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>แนวโน้มรายได้ 12 เดือน (Trend)</span>
                <span className="font-medium text-blue-500">ม.ค. - ธ.ค.</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kpi-rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <Tooltip cursor={false} content={<MiniSparklineTooltip prefix="รายได้" color="#0ea5e9" />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#kpi-rev-grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Breakdown & Progress */}
            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <Store className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                  <span>ขายส่ง: {formatCurrency(summary.wholesaleRevenue)}</span>
                </div>
                <Badge className="bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs">
                  {formatPercent(summary.wholesalePercent)}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                  <span>ขายปลีก: {formatCurrency(summary.retailRevenue)}</span>
                </div>
                <Badge className="bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs">
                  {formatPercent(summary.retailPercent)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: COGS & GROSS PROFIT (ต้นทุนสินค้า) */}
        <Card className="relative overflow-hidden border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-float-up delay-row-1">
          <CardContent className="flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-6 w-6 text-slate-700 dark:text-slate-300 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      ต้นทุนสินค้า (COGS)
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      ต้นทุนการซื้อสินค้ามาจัดจำหน่าย
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="px-2.5 py-1 text-xs font-bold">
                  {formatPercent(summary.cogsRatioPercent)} ของรายได้
                </Badge>
              </div>

              {/* Big Currency Number */}
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                  {formatCurrency(summary.cogs)}
                </div>
              </div>
            </div>

            {/* Embedded 12-Month Sparkline Chart */}
            <div className="my-4 h-24 w-full">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>แนวโน้มต้นทุนสินค้า 12 เดือน</span>
                <span className="font-medium text-amber-500">ม.ค. - ธ.ค.</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparklineData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <XAxis dataKey="month" hide />
                  <Tooltip cursor={false} content={<MiniSparklineTooltip prefix="ต้นทุน COGS" color="#f59e0b" />} />
                  <Bar dataKey="cogs" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Breakdown & Metrics */}
            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">กำไรขั้นต้น (Gross Profit):</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {formatCurrency(summary.grossProfit)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">อัตรากำไรขั้นต้น (Gross Margin):</span>
                <Badge variant="success" className="font-bold text-xs">
                  {formatPercent(summary.grossMarginPercent)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 3: OPERATING EXPENSES (ค่าใช้จ่ายดำเนินงาน) */}
        <Card className="relative overflow-hidden border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-float-up delay-row-2">
          <CardContent className="flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PieChart className="h-6 w-6 text-slate-700 dark:text-slate-300 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      ค่าใช้จ่ายดำเนินงาน (OPEX)
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      เงินเดือน, ค่าขนส่ง, สาธารณูปโภค ฯลฯ
                    </p>
                  </div>
                </div>
                <Badge variant="purple" className="px-2.5 py-1 text-xs font-bold">
                  {formatPercent(summary.opexRatioPercent)} ของรายได้
                </Badge>
              </div>

              {/* Big Currency Number */}
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                  {formatCurrency(summary.operatingExpenses)}
                </div>
              </div>
            </div>

            {/* Embedded 12-Month Sparkline Chart */}
            <div className="my-4 h-24 w-full">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>แนวโน้มค่าใช้จ่ายดำเนินงาน 12 เดือน</span>
                <span className="font-medium text-purple-500">ม.ค. - ธ.ค.</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kpi-opex-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <Tooltip cursor={false} content={<MiniSparklineTooltip prefix="ค่าใช้จ่าย" color="#a855f7" />} />
                  <Area
                    type="monotone"
                    dataKey="opex"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    fill="url(#kpi-opex-grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Breakdown & Metrics */}
            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">ค่าใช้จ่ายเฉลี่ยต่อเดือน:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(summary.operatingExpenses / 12)} / เดือน
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">ต้นทุน + ค่าใช้จ่ายรวม:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalCostAndExpense)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 4: NET OPERATING PROFIT (กำไรสุทธิ) */}
        <Card className="relative overflow-hidden border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-float-up delay-row-2">
          <CardContent className="flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isNetProfitable ? (
                    <ArrowUpRight className="h-6 w-6 text-slate-700 dark:text-slate-300 shrink-0" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-slate-700 dark:text-slate-300 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      กำไรสุทธิ (Net Operating Profit)
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      กำไรคงเหลือหลังหักต้นทุนและค่าใช้จ่ายทั้งหมด
                    </p>
                  </div>
                </div>
                <Badge
                  variant={isNetProfitable ? "success" : "destructive"}
                  className="px-2.5 py-1 text-xs font-bold"
                >
                  Net Margin {formatPercent(summary.netMarginPercent)}
                </Badge>
              </div>

              {/* Big Currency Number */}
              <div className="mt-4 flex items-baseline gap-3">
                <div
                  className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
                    isNetProfitable
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(summary.netProfit)}
                </div>
              </div>
            </div>

            {/* Embedded 12-Month Sparkline Chart */}
            <div className="my-4 h-24 w-full">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>แนวโน้มกำไรสุทธิ 12 เดือน (EBIT)</span>
                <span className="font-medium text-emerald-500">ม.ค. - ธ.ค.</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kpi-net-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <Tooltip cursor={false} content={<MiniSparklineTooltip prefix="กำไรสุทธิ" color="#10b981" />} />
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#kpi-net-grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Breakdown & Metrics */}
            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">สถานะผลประกอบการ:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {isNetProfitable ? "มีกำไรสุทธิต่อเนื่อง" : "ขาดทุนจากการดำเนินงาน"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">อัตรากำไรต่อยอดขายรวม:</span>
                <Badge variant={isNetProfitable ? "success" : "destructive"} className="font-bold text-xs">
                  {formatPercent(summary.netMarginPercent)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Performance Highlights Deck */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-float-up delay-row-3">
        {/* Highlight 1: Best Month */}
        {summary.bestMonth && (
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
            <Award className="h-5 w-5 text-slate-700 dark:text-slate-300 shrink-0" />
            <div className="overflow-hidden">
              <div className="font-semibold text-slate-500 dark:text-slate-400">
                เดือนที่ทำยอดขายสูงสุด (Best Month)
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {summary.bestMonth.monthName} ({formatCurrency(summary.bestMonth.revenue)})
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                กำไรสุทธิในเดือน: {formatCurrency(summary.bestMonth.netProfit)}
              </div>
            </div>
          </div>
        )}

        {/* Highlight 2: Lowest Month */}
        {summary.lowestMonth && (
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
            <AlertTriangle className="h-5 w-5 text-slate-700 dark:text-slate-300 shrink-0" />
            <div className="overflow-hidden">
              <div className="font-semibold text-slate-500 dark:text-slate-400">
                เดือนที่มียอดขายต่ำสุด (Lowest Month)
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {summary.lowestMonth.monthName} ({formatCurrency(summary.lowestMonth.revenue)})
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                กำไรสุทธิในเดือน: {formatCurrency(summary.lowestMonth.netProfit)}
              </div>
            </div>
          </div>
        )}

        {/* Highlight 3: Cost Efficiency Ratio */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <Percent className="h-5 w-5 text-slate-700 dark:text-slate-300 shrink-0" />
          <div className="overflow-hidden">
            <div className="font-semibold text-slate-500 dark:text-slate-400">
              สัดส่วนต้นทุนและค่าใช้จ่ายรวม (Cost Ratio)
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatPercent(costRatio)} ของรายได้ทั้งหมด
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              ต้นทุนรวม: {formatCurrency(totalCostAndExpense)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
