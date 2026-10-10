import { NextRequest, NextResponse } from "next/server";
import { fetchOperatingExpenses } from "@/lib/db";
import { OperatingExpensesApiResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const year = yearParam ? parseInt(yearParam, 10) : 2026;
    const month = monthParam && monthParam !== "all" ? parseInt(monthParam, 10) : null;

    const result = await fetchOperatingExpenses(year, month);
    const data = result.data;

    const totalOperatingExpenses = data.reduce(
      (acc, item) => acc + (Number(item.OperatingExpenses) || 0),
      0
    );

    const response: OperatingExpensesApiResponse = {
      year,
      month,
      totalOperatingExpenses,
      data,
      dataSource: "database",
      databaseError: result.error,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Operating Expenses API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
