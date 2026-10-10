import { NextRequest, NextResponse } from "next/server";
import { fetchWholesaleRevenue } from "@/lib/db";
import { WholesaleRevenueApiResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const year = yearParam ? parseInt(yearParam, 10) : 2026;
    const month = monthParam && monthParam !== "all" ? parseInt(monthParam, 10) : null;
    const forceRefresh = searchParams.get("refresh") === "true";

    const result = await fetchWholesaleRevenue(year, month, forceRefresh);
    const data = result.data;

    const totalWholesaleRevenue = data.reduce(
      (acc, item) => acc + (Number(item.WholesaleRevenue) || 0),
      0
    );

    const response: WholesaleRevenueApiResponse = {
      year,
      month,
      totalWholesaleRevenue,
      data,
      dataSource: "database",
      databaseError: result.error,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Wholesale Revenue API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
