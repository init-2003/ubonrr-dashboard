"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/context/DashboardContext";
import { MONTH_NAMES_TH, MONTH_FULL_NAMES_TH, cn } from "@/lib/utils";

interface RevenueSkeletonProps {
  selectedMonth?: number | null;
  selectedYear?: number;
}

export function RevenueSkeleton({
  selectedMonth: propMonth,
  selectedYear: propYear,
}: RevenueSkeletonProps = {}) {
  const { selectedMonth: contextMonth, selectedYear: contextYear } = useDashboard();
  const selectedMonth = propMonth !== undefined ? propMonth : contextMonth;
  const selectedYear = propYear !== undefined ? propYear : contextYear;

  const monthName =
    selectedMonth && selectedMonth >= 1 && selectedMonth <= 12
      ? MONTH_FULL_NAMES_TH[selectedMonth - 1]
      : null;

  return (
    <div className="space-y-6">
      {/* 1. Channel Revenue KPI Summary Cards (3 cards matching layout) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-float-up delay-row-1">
        {/* Card 1: Total Revenue Skeleton */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44 rounded-md" />
            </div>
            <Skeleton className="h-5 w-5 rounded-md shrink-0" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-40 rounded-lg" />
            <div className="mt-2 flex items-center gap-1.5">
              {monthName ? (
                <Skeleton className="h-3 w-48 rounded-md" />
              ) : (
                <Skeleton className="h-3 w-36 rounded-md" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Wholesale Revenue Skeleton */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <Skeleton className="h-5 w-5 rounded-md shrink-0" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-36 rounded-lg" />
            <div className="mt-2 flex items-center gap-1.5">
              <Skeleton className="h-3 w-44 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Retail Revenue Skeleton */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <Skeleton className="h-5 w-5 rounded-md shrink-0" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-36 rounded-lg" />
            <div className="mt-2 flex items-center gap-1.5">
              <Skeleton className="h-3 w-44 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Primary Revenue Split Chart (Area Chart 2 cols + Donut Chart 1 col) */}
      <div className="animate-float-up delay-row-2">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Card 1: Monthly Stacked Area Chart (lg:col-span-2) */}
          <Card className="col-span-1 lg:col-span-2 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                <Skeleton className="h-5 w-72 rounded-md" />
              </div>
              <Skeleton className="h-3 w-80 rounded-md mt-1.5" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[280px] w-full flex flex-col justify-between">
                {/* Top Legend Skeleton */}
                <div className="flex items-center justify-center gap-6 h-8">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500/50" />
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </div>
                </div>

                {/* Simulated Stacked Area Chart SVG with Shimmer Wave */}
                <div className="relative flex-1 w-full overflow-hidden my-1">
                  <svg viewBox="0 0 700 190" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revAreaSkel1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="revAreaSkel2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    <line x1="0" y1="35" x2="700" y2="35" stroke="currentColor" className="text-slate-200/70 dark:text-slate-800" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="700" y2="80" stroke="currentColor" className="text-slate-200/70 dark:text-slate-800" strokeDasharray="3 3" />
                    <line x1="0" y1="125" x2="700" y2="125" stroke="currentColor" className="text-slate-200/70 dark:text-slate-800" strokeDasharray="3 3" />
                    <line x1="0" y1="170" x2="700" y2="170" stroke="currentColor" className="text-slate-200/70 dark:text-slate-800" strokeDasharray="3 3" />

                    {/* Stacked Wave Shapes */}
                    <path
                      d="M 0 125 Q 120 105, 240 85 T 480 60 T 700 45 L 700 180 L 0 180 Z"
                      fill="url(#revAreaSkel1)"
                    />
                    <path
                      d="M 0 150 Q 120 140, 240 120 T 480 105 T 700 90 L 700 180 L 0 180 Z"
                      fill="url(#revAreaSkel2)"
                    />

                    {/* Wave Strokes */}
                    <path
                      d="M 0 125 Q 120 105, 240 85 T 480 60 T 700 45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                    <path
                      d="M 0 150 Q 120 140, 240 120 T 480 105 T 700 90"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  </svg>
                  <div className="absolute inset-0 pointer-events-none shimmer-skeleton opacity-25" />
                </div>

                {/* X-Axis 12 Months */}
                <div className="flex justify-between items-center pt-1 px-1 border-t border-slate-100 dark:border-slate-800">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const isSelected = selectedMonth === i + 1;
                    return (
                      <span
                        key={i}
                        className={cn(
                          "text-[10px] font-mono px-1 py-0.5 rounded-xs transition-colors",
                          isSelected
                            ? "font-bold text-[#881224] dark:text-[#f87171] bg-[#881224]/10 dark:bg-[#881224]/20"
                            : "text-slate-400 dark:text-slate-600"
                        )}
                      >
                        {MONTH_NAMES_TH[i]}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Donut Chart (lg:col-span-1) */}
          <Card className="col-span-1 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md mt-1.5" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-0">
              {/* Donut Ring (height 190px matching real chart) */}
              <div className="relative h-[190px] w-full flex items-center justify-center">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                    {/* Wholesale Arc (70%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="55"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="22"
                      strokeDasharray="242 345"
                      opacity="0.5"
                    />
                    {/* Retail Arc (30%) */}
                    <circle
                      cx="80"
                      cy="80"
                      r="55"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="22"
                      strokeDasharray="103 345"
                      strokeDashoffset="-242"
                      opacity="0.5"
                    />
                  </svg>

                  {/* Center Donut Hole */}
                  <div className="absolute inset-0 m-auto flex flex-col items-center justify-center">
                    <Skeleton className="h-4 w-12 rounded-md" />
                    <Skeleton className="h-2.5 w-16 rounded-md mt-1" />
                  </div>
                </div>
              </div>

              {/* Custom Legend Badges */}
              <div className="w-full space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between rounded-md bg-blue-50/50 p-2 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500/70" />
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>

                <div className="flex items-center justify-between rounded-md bg-emerald-50/50 p-2 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
