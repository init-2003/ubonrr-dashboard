"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SankeySkeleton() {
  return (
    <div
      className="flex flex-col h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[480px] w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 relative shadow-sm dark:bg-slate-900 dark:border-slate-800/80 overflow-hidden animate-float-up delay-row-1"
    >
      {/* 1. Header with Title and Filter Dropdown Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/60 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
            <Skeleton className="h-5 w-60 rounded-md" />
          </div>
          <Skeleton className="h-3 w-80 rounded-md mt-2" />
        </div>

        {/* Right side Month Selector & Info Skeleton */}
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7.5 w-32 rounded-full" />
          <Skeleton className="h-7.5 w-20 rounded-full hidden sm:inline-block" />
        </div>
      </div>

      {/* 2. Column Stage Headers Skeleton */}
      <div className="grid grid-cols-4 gap-4 px-2 py-2 mb-2 border-b border-slate-100/80 dark:border-slate-800/40 shrink-0">
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-2.5 w-16 rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-32 rounded-md" />
          <Skeleton className="h-2.5 w-20 rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-32 rounded-md" />
          <Skeleton className="h-2.5 w-20 rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-36 rounded-md" />
          <Skeleton className="h-2.5 w-24 rounded-md" />
        </div>
      </div>

      {/* 3. Main Simulated Sankey Diagram SVG Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <svg
          viewBox="0 0 1000 420"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sankeySkelRibbon1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.32" />
            </linearGradient>
            <linearGradient id="sankeySkelRibbon2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="sankeySkelRibbon3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="sankeySkelRibbon4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="sankeySkelRibbon5" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.28" />
            </linearGradient>
            <linearGradient id="sankeySkelRibbonSub" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Flow Ribbons (Col 0 -> Col 1) */}
          <path
            d="M 94 50 C 205 50, 229 40, 340 40 v 150 C 229 190, 205 190, 94 190 Z"
            fill="url(#sankeySkelRibbon1)"
          />
          <path
            d="M 94 220 C 205 220, 229 190, 340 190 v 130 C 229 320, 205 340, 94 340 Z"
            fill="url(#sankeySkelRibbon2)"
          />

          {/* Flow Ribbons (Col 1 -> Col 2) */}
          <path
            d="M 354 40 C 483 40, 511 30, 640 30 v 110 C 511 140, 483 150, 354 150 Z"
            fill="url(#sankeySkelRibbon3)"
          />
          <path
            d="M 354 150 C 483 150, 511 160, 640 160 v 100 C 511 260, 483 250, 354 250 Z"
            fill="url(#sankeySkelRibbon4)"
          />
          <path
            d="M 354 250 C 483 250, 511 280, 640 280 v 80 C 511 360, 483 320, 354 320 Z"
            fill="url(#sankeySkelRibbon5)"
          />

          {/* Flow Ribbons (Col 2 -> Col 3 - Sub OPEX) */}
          <path
            d="M 654 160 C 765 160, 789 130, 900 130 v 28 C 789 158, 765 185, 654 185 Z"
            fill="url(#sankeySkelRibbonSub)"
          />
          <path
            d="M 654 185 C 765 185, 789 166, 900 166 v 26 C 789 192, 765 210, 654 210 Z"
            fill="url(#sankeySkelRibbonSub)"
          />
          <path
            d="M 654 210 C 765 210, 789 200, 900 200 v 24 C 789 224, 765 235, 654 235 Z"
            fill="url(#sankeySkelRibbonSub)"
          />
          <path
            d="M 654 235 C 765 235, 789 232, 900 232 v 20 C 789 252, 765 260, 654 260 Z"
            fill="url(#sankeySkelRibbonSub)"
          />

          {/* Node Column 0: Wholesale & Retail */}
          <rect x="80" y="50" width="14" height="140" rx="3" className="fill-blue-500/70 dark:fill-blue-500/60" />
          <rect x="80" y="220" width="14" height="120" rx="3" className="fill-indigo-500/70 dark:fill-indigo-500/60" />

          {/* Node Column 1: Total Revenue */}
          <rect x="340" y="40" width="14" height="280" rx="3" className="fill-sky-500/80 dark:fill-sky-500/70" />

          {/* Node Column 2: COGS, OPEX, Net Profit */}
          <rect x="640" y="30" width="14" height="110" rx="3" className="fill-amber-500/70 dark:fill-amber-500/60" />
          <rect x="640" y="160" width="14" height="100" rx="3" className="fill-pink-500/70 dark:fill-pink-500/60" />
          <rect x="640" y="280" width="14" height="80" rx="3" className="fill-emerald-500/70 dark:fill-emerald-500/60" />

          {/* Node Column 3: OPEX Sub Categories */}
          <rect x="900" y="130" width="14" height="28" rx="3" className="fill-purple-500/70 dark:fill-purple-500/60" />
          <rect x="900" y="166" width="14" height="26" rx="3" className="fill-purple-500/70 dark:fill-purple-500/60" />
          <rect x="900" y="200" width="14" height="24" rx="3" className="fill-purple-500/70 dark:fill-purple-500/60" />
          <rect x="900" y="232" width="14" height="20" rx="3" className="fill-purple-500/70 dark:fill-purple-500/60" />
        </svg>

        {/* Shimmer Overlay across Diagram */}
        <div className="absolute inset-0 pointer-events-none shimmer-skeleton opacity-40" />
      </div>

      {/* 4. Bottom Legend & Summary Pill Skeletons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-44 rounded-md" />
      </div>
    </div>
  );
}
