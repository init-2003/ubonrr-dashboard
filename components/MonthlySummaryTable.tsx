"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { MonthlyAnalyticsData, ExecutiveKPISummary } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { FileSpreadsheet, Download } from "lucide-react";

interface MonthlySummaryTableProps {
  data: MonthlyAnalyticsData[];
  summary: ExecutiveKPISummary;
  selectedYear: number;
  onExportCSV: () => void;
  onSelectMonth?: (month: number) => void;
}

export function MonthlySummaryTable({
  data,
  summary,
  selectedYear,
  onExportCSV,
  onSelectMonth,
}: MonthlySummaryTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <CardTitle className="text-base font-bold sm:text-lg">
              ตารางสรุปข้อมูลงบการเงินและยอดขายรายเดือน (ปี {selectedYear})
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            รวบรวม Wholesale, Retail, COGS, OPEX, กำไรขั้นต้น และกำไรสุทธิครบทุกเดือน
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="gap-1.5 self-start sm:self-auto rounded-full"
        >
          <Download className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span>ส่งออกเป็น CSV</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="font-bold">เดือน</TableHead>
                <TableHead className="text-right">ขายส่ง (Wholesale)</TableHead>
                <TableHead className="text-right">ขายปลีก (Retail)</TableHead>
                <TableHead className="text-right font-bold text-blue-600 dark:text-blue-400">
                  รายได้รวม (Total)
                </TableHead>
                <TableHead className="text-right">ต้นทุน (COGS)</TableHead>
                <TableHead className="text-right">กำไรขั้นต้น (GP)</TableHead>
                <TableHead className="text-right">Gross Margin</TableHead>
                <TableHead className="text-right">ค่าใช้จ่าย (OPEX)</TableHead>
                <TableHead className="text-right font-bold">กำไรสุทธิ (Net)</TableHead>
                <TableHead className="text-right">Net Margin</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const isProfitable = row.NetProfit >= 0;
                return (
                  <TableRow
                    key={row.MonthSale}
                    className="text-xs cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                    onClick={() => onSelectMonth?.(row.MonthSale)}
                  >
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {row.MonthFullName}
                    </TableCell>
                    <TableCell className="text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(row.WholesaleRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(row.RetailRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(row.TotalRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600 dark:text-rose-400">
                      {formatCurrency(row.COGS)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(row.GrossProfit)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatPercent(row.GrossMarginPercent)}
                    </TableCell>
                    <TableCell className="text-right text-amber-600 dark:text-amber-400">
                      {formatCurrency(row.OperatingExpenses)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        isProfitable
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(row.NetProfit)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPercent(row.NetMarginPercent)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={isProfitable ? "success" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {isProfitable ? "กำไร" : "ขาดทุน"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="text-xs font-bold bg-slate-100/80 dark:bg-slate-900">
                <TableCell>รวมทั้งปี (Year Total)</TableCell>
                <TableCell className="text-right">{formatCurrency(summary.wholesaleRevenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(summary.retailRevenue)}</TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400">
                  {formatCurrency(summary.totalRevenue)}
                </TableCell>
                <TableCell className="text-right text-rose-600 dark:text-rose-400">
                  {formatCurrency(summary.cogs)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(summary.grossProfit)}</TableCell>
                <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                  {formatPercent(summary.grossMarginPercent)}
                </TableCell>
                <TableCell className="text-right text-amber-600 dark:text-amber-400">
                  {formatCurrency(summary.operatingExpenses)}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    summary.netProfit >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(summary.netProfit)}
                </TableCell>
                <TableCell className="text-right">{formatPercent(summary.netMarginPercent)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={summary.netProfit >= 0 ? "success" : "destructive"}
                    className="text-[10px]"
                  >
                    {summary.netProfit >= 0 ? "กำไรสุทธิ" : "ขาดทุน"}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
