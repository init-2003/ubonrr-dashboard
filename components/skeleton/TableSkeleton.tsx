"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MOCK_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function TableSkeleton() {
  return (
    <Card className="shadow-sm border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900 animate-float-up delay-row-1">
      {/* 1. Header with Title & Export Button Skeleton */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-md shrink-0" />
            <Skeleton className="h-5 w-80 rounded-md" />
          </div>
          <Skeleton className="h-3 w-96 rounded-md mt-1.5" />
        </div>

        {/* Export CSV Button Skeleton */}
        <Skeleton className="h-8.5 w-32 rounded-full shrink-0" />
      </CardHeader>

      <CardContent className="pt-4">
        {/* 2. Full 11-Column Data Grid Skeleton */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <TableHead className="w-24">
                  <Skeleton className="h-3.5 w-12 rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-24 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-24 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-22 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-3.5 w-18 ml-auto rounded-md" />
                </TableHead>
                <TableHead className="text-center w-20">
                  <Skeleton className="h-3.5 w-12 mx-auto rounded-md" />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {MOCK_MONTHS.map((month, idx) => (
                <TableRow
                  key={idx}
                  className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                >
                  {/* Month Name */}
                  <TableCell className="font-semibold text-slate-400 py-3">
                    <span className="text-[11px] text-slate-400/80 dark:text-slate-500 font-medium">
                      {month}
                    </span>
                  </TableCell>

                  {/* Wholesale */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                  </TableCell>

                  {/* Retail */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-16 ml-auto rounded-md" />
                  </TableCell>

                  {/* Total Revenue */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-22 ml-auto rounded-md" />
                  </TableCell>

                  {/* COGS */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-18 ml-auto rounded-md" />
                  </TableCell>

                  {/* Gross Profit */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                  </TableCell>

                  {/* Gross Margin % */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-12 ml-auto rounded-md" />
                  </TableCell>

                  {/* OPEX */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-18 ml-auto rounded-md" />
                  </TableCell>

                  {/* Net Profit */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-20 ml-auto rounded-md" />
                  </TableCell>

                  {/* Net Margin % */}
                  <TableCell className="text-right">
                    <Skeleton className="h-3.5 w-12 ml-auto rounded-md" />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="text-center">
                    <Skeleton className="h-4.5 w-11 mx-auto rounded-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {/* Table Footer: Year Total Row Skeleton */}
            <TableFooter>
              <TableRow className="text-xs font-bold bg-slate-100/80 dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800">
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-22 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-18 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-24 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-14 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-22 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-14 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-5 w-14 mx-auto rounded-full" />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
