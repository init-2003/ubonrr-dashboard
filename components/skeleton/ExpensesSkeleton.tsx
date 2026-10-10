"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpensesSkeleton() {
  return (
    <Card className="shadow-sm border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900 animate-float-up delay-row-1">
      {/* 1. Header with Title & Month Filter Capsule */}
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
            <Skeleton className="h-5 w-80 rounded-md" />
          </div>
          <Skeleton className="h-3 w-96 rounded-md mt-1.5" />
        </div>

        {/* Month Selector Capsule Skeleton */}
        <Skeleton className="h-7.5 w-32 rounded-full shrink-0" />
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* 2. Charts Grid (Donut & Horizontal Bar Chart) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Donut Chart of Categories (5 cols) */}
          <div className="col-span-1 lg:col-span-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <Skeleton className="h-3.5 w-48 rounded-md mb-3" />

            {/* Donut Ring Skeleton */}
            <div className="relative h-[210px] w-full flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="h-44 w-44 -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="22"
                  strokeDasharray="140 364"
                  opacity="0.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="22"
                  strokeDasharray="90 364"
                  strokeDashoffset="-140"
                  opacity="0.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="22"
                  strokeDasharray="75 364"
                  strokeDashoffset="-230"
                  opacity="0.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="22"
                  strokeDasharray="59 364"
                  strokeDashoffset="-305"
                  opacity="0.5"
                />
              </svg>
              <div className="absolute inset-0 m-auto flex flex-col items-center justify-center">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-3 w-12 rounded-md mt-1" />
              </div>
            </div>

            {/* Category Legend List Skeleton */}
            <div className="mt-3 space-y-2 border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
              {[
                { color: "bg-red-500/70", w: "w-28", val: "w-20", pct: "38%" },
                { color: "bg-amber-500/70", w: "w-24", val: "w-18", pct: "25%" },
                { color: "bg-blue-500/70", w: "w-32", val: "w-16", pct: "21%" },
                { color: "bg-purple-500/70", w: "w-20", val: "w-16", pct: "16%" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-xs shrink-0 ${item.color}`} />
                    <Skeleton className={`h-3.5 ${item.w} rounded-md`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className={`h-3.5 ${item.val} rounded-md`} />
                    <Skeleton className="h-4 w-9 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Ranked Horizontal Bar Chart (7 cols) */}
          <div className="col-span-1 lg:col-span-7 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3.5 w-52 rounded-md" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>

            {/* Horizontal Bar Chart Skeletons */}
            <div className="space-y-4 my-auto">
              {[
                { labelW: "w-32", barW: "w-[85%]", color: "bg-red-500/60" },
                { labelW: "w-28", barW: "w-[68%]", color: "bg-amber-500/60" },
                { labelW: "w-36", barW: "w-[54%]", color: "bg-blue-500/60" },
                { labelW: "w-24", barW: "w-[42%]", color: "bg-purple-500/60" },
                { labelW: "w-30", barW: "w-[30%]", color: "bg-emerald-500/60" },
                { labelW: "w-26", barW: "w-[18%]", color: "bg-pink-500/60" },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Skeleton className={`h-3.5 ${row.labelW} shrink-0 rounded-md`} />
                  <div className="flex-1 flex items-center">
                    <div
                      className={`h-5.5 rounded-r-md ${row.color} shimmer-skeleton`}
                      style={{ width: row.barW.replace("w-[", "").replace("]", "") }}
                    />
                  </div>
                  <Skeleton className="h-3.5 w-16 shrink-0 rounded-md" />
                </div>
              ))}
            </div>

            {/* X-Axis Numbers */}
            <div className="flex justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mt-4 px-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* 3. Expense Items Table Skeleton */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-9 w-full sm:w-64 rounded-full" />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50/90 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <div className="col-span-1">
                <Skeleton className="h-3.5 w-8" />
              </div>
              <div className="col-span-3">
                <Skeleton className="h-3.5 w-24" />
              </div>
              <div className="col-span-5">
                <Skeleton className="h-3.5 w-32" />
              </div>
              <div className="col-span-3 flex justify-end">
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[
                { tagColor: "bg-red-500/70", tagW: "w-24", descW: "w-48", priceW: "w-20" },
                { tagColor: "bg-amber-500/70", tagW: "w-20", descW: "w-64", priceW: "w-18" },
                { tagColor: "bg-blue-500/70", tagW: "w-28", descW: "w-52", priceW: "w-22" },
                { tagColor: "bg-purple-500/70", tagW: "w-22", descW: "w-40", priceW: "w-16" },
                { tagColor: "bg-emerald-500/70", tagW: "w-26", descW: "w-56", priceW: "w-24" },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                >
                  <div className="col-span-1">
                    <Skeleton className="h-3.5 w-8 rounded-md" />
                  </div>
                  <div className="col-span-3">
                    <div className={`h-6 ${row.tagW} rounded-lg ${row.tagColor} shimmer-skeleton`} />
                  </div>
                  <div className="col-span-5">
                    <Skeleton className={`h-3.5 ${row.descW} rounded-md`} />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <Skeleton className={`h-4 ${row.priceW} rounded-md`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
