import { NextRequest, NextResponse } from "next/server";
import { fetchRetailRevenue } from "@/lib/db";
import { RetailRevenueApiResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const year = yearParam ? parseInt(yearParam, 10) : 2026;
    const month = monthParam && monthParam !== "all" ? parseInt(monthParam, 10) : null;

    const result = await fetchRetailRevenue(year, month);
    const data = result.data;

    const totalRetailRevenue = data.reduce(
      (acc, item) => acc + (Number(item.RetailRevenue) || 0),
      0
    );

    const response: RetailRevenueApiResponse = {
      year,
      month,
      totalRetailRevenue,
      data,
      dataSource: "database",
      databaseError: result.error,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Revenue Retail API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
