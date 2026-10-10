import { NextRequest, NextResponse } from "next/server";
import { fetchSalesDashboard } from "@/lib/db";
import {
  MonthlyAnalyticsData,
  ExecutiveKPISummary,
  DashboardApiResponse,
} from "@/lib/types";
import { MONTH_NAMES_TH, MONTH_FULL_NAMES_TH } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam, 10) : 2026;
    const forceRefresh = searchParams.get("refresh") === "true";

    const salesResult = await fetchSalesDashboard(year, forceRefresh);

    const rawData = salesResult.data;

    // Fill all 12 months (or map existing data)
    const monthlyData: MonthlyAnalyticsData[] = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const found = rawData.find((d) => d.MonthSale === monthNum);

      const wholesale = found ? found.WholesaleRevenue || 0 : 0;
      const retail = found ? found.RetailRevenue || 0 : 0;
      const totalRevenue = wholesale + retail;
      const cogs = found ? found.COGS || 0 : 0;
      const opex = found ? found.OperatingExpenses || 0 : 0;
      const totalCostAndExpense = cogs + opex;

      const grossProfit = totalRevenue - cogs;
      const netProfit = grossProfit - opex;

      const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const wholesaleShare = totalRevenue > 0 ? (wholesale / totalRevenue) * 100 : 0;
      const retailShare = totalRevenue > 0 ? (retail / totalRevenue) * 100 : 0;

      return {
        YearSale: year,
        MonthSale: monthNum,
        MonthName: MONTH_NAMES_TH[i],
        MonthFullName: MONTH_FULL_NAMES_TH[i],
        WholesaleRevenue: wholesale,
        RetailRevenue: retail,
        TotalRevenue: totalRevenue,
        COGS: cogs,
        OperatingExpenses: opex,
        TotalCostAndExpense: totalCostAndExpense,
        GrossProfit: grossProfit,
        NetProfit: netProfit,
        GrossMarginPercent: Number(grossMarginPercent.toFixed(2)),
        NetMarginPercent: Number(netMarginPercent.toFixed(2)),
        WholesaleSharePercent: Number(wholesaleShare.toFixed(2)),
        RetailSharePercent: Number(retailShare.toFixed(2)),
      };
    });

    // Calculate Totals & KPI Summary
    const totalWholesale = monthlyData.reduce((acc, m) => acc + m.WholesaleRevenue, 0);
    const totalRetail = monthlyData.reduce((acc, m) => acc + m.RetailRevenue, 0);
    const totalRev = totalWholesale + totalRetail;
    const totalCOGS = monthlyData.reduce((acc, m) => acc + m.COGS, 0);
    const totalOPEX = monthlyData.reduce((acc, m) => acc + m.OperatingExpenses, 0);
    const totalGrossProfit = totalRev - totalCOGS;
    const totalNetProfit = totalGrossProfit - totalOPEX;

    // Find Best and Lowest Months
    const activeMonths = monthlyData.filter((m) => m.TotalRevenue > 0);
    let bestMonth = null;
    let lowestMonth = null;

    if (activeMonths.length > 0) {
      const sortedByNetProfit = [...activeMonths].sort((a, b) => b.NetProfit - a.NetProfit);
      const top = sortedByNetProfit[0];
      const bottom = sortedByNetProfit[sortedByNetProfit.length - 1];

      bestMonth = {
        monthSale: top.MonthSale,
        monthName: top.MonthFullName,
        revenue: top.TotalRevenue,
        netProfit: top.NetProfit,
      };

      lowestMonth = {
        monthSale: bottom.MonthSale,
        monthName: bottom.MonthFullName,
        revenue: bottom.TotalRevenue,
        netProfit: bottom.NetProfit,
      };
    }

    const summary: ExecutiveKPISummary = {
      totalRevenue: totalRev,
      wholesaleRevenue: totalWholesale,
      retailRevenue: totalRetail,
      cogs: totalCOGS,
      operatingExpenses: totalOPEX,
      grossProfit: totalGrossProfit,
      netProfit: totalNetProfit,
      grossMarginPercent: totalRev > 0 ? Number(((totalGrossProfit / totalRev) * 100).toFixed(2)) : 0,
      netMarginPercent: totalRev > 0 ? Number(((totalNetProfit / totalRev) * 100).toFixed(2)) : 0,
      cogsRatioPercent: totalRev > 0 ? Number(((totalCOGS / totalRev) * 100).toFixed(2)) : 0,
      opexRatioPercent: totalRev > 0 ? Number(((totalOPEX / totalRev) * 100).toFixed(2)) : 0,
      wholesalePercent: totalRev > 0 ? Number(((totalWholesale / totalRev) * 100).toFixed(2)) : 0,
      retailPercent: totalRev > 0 ? Number(((totalRetail / totalRev) * 100).toFixed(2)) : 0,
      bestMonth,
      lowestMonth,
    };

    const response: DashboardApiResponse = {
      year,
      availableYears: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
      summary,
      monthlyData,
      dataSource: "database",
      databaseError: salesResult.error,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
