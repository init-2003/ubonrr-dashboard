"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock varying bar heights for 12 months sparkline
const MOCK_BAR_HEIGHTS = [
  [35, 55, 45, 70, 60, 85, 65, 90, 75, 95, 80, 100],
  [45, 65, 50, 80, 70, 75, 60, 85, 70, 90, 85, 95],
  [30, 45, 40, 60, 50, 65, 55, 75, 60, 70, 65, 80],
  [25, 40, 35, 55, 45, 70, 50, 80, 65, 85, 75, 90],
];

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* 4 Large Executive KPI Hero Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
        {MOCK_BAR_HEIGHTS.map((heights, cardIdx) => {
          const isRow1 = cardIdx < 2;

          return (
            <Card
              key={cardIdx}
              className={`relative overflow-hidden border border-slate-200/90 bg-white p-1 shadow-sm dark:border-slate-800/90 dark:bg-slate-900 animate-float-up ${isRow1 ? "delay-row-1" : "delay-row-2"
                }`}
            >
              <CardContent className="flex flex-col justify-between p-6">
                <div>
                  {/* Card Header: Icon, Titles & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-xl shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-36 rounded-md" />
                        <Skeleton className="h-3 w-48 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>

                  {/* Big Number Amount */}
                  <div className="mt-5">
                    <Skeleton className="h-9 w-52 rounded-xl" />
                  </div>
                </div>

                {/* 12-Month Sparkline Chart Placeholder */}
                <div className="my-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-36 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>

                  <div className="flex h-20 items-end gap-1.5 pt-2 px-0.5">
                    {heights.map((h, i) => (
                      <div key={i} className="flex-1 flex items-end h-full">
                        <Skeleton
                          className="w-full rounded-t-sm"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Breakdown & Metrics */}
                <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-32 rounded-md" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-36 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Executive Performance Highlights Deck (Row 3) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-float-up delay-row-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-xs"
          >
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5 overflow-hidden">
              <Skeleton className="h-3 w-36 rounded-md" />
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
