import { NextRequest, NextResponse } from "next/server";
import { fetchExpenseDetails } from "@/lib/db";
import { ExpenseDetailApiResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    const year = yearParam ? parseInt(yearParam, 10) : 2026;
    const month = monthParam && monthParam !== "all" ? parseInt(monthParam, 10) : null;

    const result = await fetchExpenseDetails(year, month);
    const items = result.data;

    const totalExpenses = items.reduce((acc, item) => acc + (item.Ex_Price || 0), 0);

    // Group by category (Expense_Type_Name or Ex_Type)
    const categoryMap: Record<string, number> = {};
    items.forEach((item) => {
      const type = item.Expense_Type_Name || item.Ex_Type || item.Ex_Name || "ทั่วไป";
      categoryMap[type] = (categoryMap[type] || 0) + (item.Ex_Price || 0);
    });

    const categories = Object.entries(categoryMap)
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalExpenses > 0 ? Number(((total / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const response: ExpenseDetailApiResponse = {
      year,
      month,
      totalExpenses,
      items,
      categories,
      dataSource: "database",
      databaseError: result.error,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Expense Details API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
