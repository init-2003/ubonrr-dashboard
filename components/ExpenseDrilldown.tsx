"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ExpenseDetailApiResponse, OperatingExpensesApiResponse } from "@/lib/types";
import { formatCurrency, formatPercent, MONTH_NAMES_TH, MONTH_FULL_NAMES_TH, cn } from "@/lib/utils";
import { PieChart as PieIcon, Search, Calendar, ChevronDown, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ExpenseDrilldownProps {
  selectedYear: number;
  selectedMonth: number | null;
  onMonthChange?: (month: number | null) => void;
}

const CATEGORY_COLORS = [
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#84cc16", // Lime
  "#a855f7", // Violet
  "#eab308", // Yellow
  "#64748b", // Slate
];

export function ExpenseDrilldown({
  selectedYear,
  selectedMonth,
  onMonthChange,
}: ExpenseDrilldownProps) {
  const [data, setData] = React.useState<ExpenseDetailApiResponse | null>(null);
  const [opexSummary, setOpexSummary] = React.useState<OperatingExpensesApiResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isMonthOpen, setIsMonthOpen] = React.useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = React.useState<number | null>(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function loadData() {
      setIsLoading(true);
      try {
        const monthQuery = selectedMonth ? `&month=${selectedMonth}` : "";
        const [detailRes, opexRes] = await Promise.all([
          fetch(`/api/expenses/detail?year=${selectedYear}${monthQuery}`),
          fetch(`/api/operating-expenses?year=${selectedYear}${monthQuery}`),
        ]);

        if (detailRes.ok) {
          const json = await detailRes.json();
          if (!ignore) {
            setData(json);
          }
        }
        if (opexRes.ok) {
          const json = await opexRes.json();
          if (!ignore) {
            setOpexSummary(json);
          }
        }
      } catch (err) {
        console.error("Failed to load expense details", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadData();

    return () => {
      ignore = true;
    };
  }, [selectedYear, selectedMonth]);

  // Reset selection when year or month changes
  React.useEffect(() => {
    setSelectedCategoryIndex(null);
    setHoveredCategoryIndex(null);
  }, [selectedYear, selectedMonth]);

  const selectedCategory = React.useMemo(() => {
    if (selectedCategoryIndex === null || !data?.categories) return null;
    return data.categories[selectedCategoryIndex] || null;
  }, [selectedCategoryIndex, data]);

  const selectedCategoryName = selectedCategory?.category || null;

  const filteredItems = React.useMemo(() => {
    if (!data?.items) return [];
    let items = data.items;

    // Filter by selected category if any
    if (selectedCategoryName) {
      items = items.filter((item) => {
        const itemCat = item.Expense_Type_Name || item.Ex_Type || item.Ex_Name || "ทั่วไป";
        return itemCat.trim().toLowerCase() === selectedCategoryName.trim().toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          (item.Expense_Type_Name && item.Expense_Type_Name.toLowerCase().includes(term)) ||
          (item.Ex_Name && item.Ex_Name.toLowerCase().includes(term)) ||
          (item.Ex_Type && item.Ex_Type.toLowerCase().includes(term)) ||
          (item.Ex_Detail && item.Ex_Detail.toLowerCase().includes(term)) ||
          (item.Ex_ID && String(item.Ex_ID).toLowerCase().includes(term))
      );
    }

    return items;
  }, [data, searchTerm, selectedCategoryName]);

  // Custom shape rendering: selected slice gets prominent outline, pops out, and shows center info; others dim
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSector = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      index,
    } = props;

    const isSelected = activePieIndex === index;
    const hasSelection = activePieIndex >= 0;

    if (isSelected) {
      return (
        <g className="cursor-pointer select-none outline-none focus:outline-none" style={{ outline: "none" }} tabIndex={-1}>
          {/* Selected slice with crisp outline border & drop-shadow */}
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={Math.max(0, innerRadius - 2)}
            outerRadius={outerRadius + 8}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinejoin="round"
            className="text-slate-950 dark:text-white outline-none focus:outline-none"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))",
              outline: "none",
            }}
            tabIndex={-1}
          />
          {/* Center text inside donut hole */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-slate-900 dark:fill-slate-100 font-bold select-none pointer-events-none"
            style={{ fontSize: "11px", fontWeight: 700, outline: "none" }}
          >
            {payload?.category && payload.category.length > 12
              ? `${payload.category.slice(0, 10)}...`
              : payload?.category || ""}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="fill-[#881224] dark:fill-[#f87171] font-mono font-bold select-none pointer-events-none"
            style={{ fontSize: "12px", fontWeight: 700, outline: "none" }}
          >
            {`${((percent || 0) * 100).toFixed(1)}%`}
          </text>
        </g>
      );
    }

    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={hasSelection ? 0.3 : 1}
        stroke="transparent"
        className="cursor-pointer transition-opacity duration-200 outline-none focus:outline-none"
        style={{ outline: "none" }}
        tabIndex={-1}
      />
    );
  };

  const activePieIndex = selectedCategoryIndex !== null
    ? selectedCategoryIndex
    : (hoveredCategoryIndex !== null ? hoveredCategoryIndex : -1);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <CardTitle className="text-base font-bold sm:text-lg">
              เจาะลึกรายละเอียดค่าใช้จ่ายดำเนินงาน (Operating Expenses)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {selectedMonth
              ? `วิเคราะห์แยกตามหมวดหมู่และรายการค่าใช้จ่าย ประจำเดือน ${MONTH_FULL_NAMES_TH[selectedMonth - 1] || MONTH_NAMES_TH[selectedMonth - 1]} ปี ${selectedYear}`
              : `วิเคราะห์แยกตามหมวดหมู่และรายการค่าใช้จ่าย รวมทั้งปี ${selectedYear}`}
          </CardDescription>
        </div>

        {onMonthChange && (
          <Popover open={isMonthOpen} onOpenChange={setIsMonthOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                id="expense-month-filter"
                className={cn(
                  "inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-slate-200/90 bg-white/95 text-xs font-semibold text-slate-800 shadow-xs transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto",
                  isMonthOpen && "ring-2 ring-[#881224]/20 border-[#881224]/50 dark:border-[#881224]/50"
                )}
                title="เลือกเดือนที่ต้องการแสดง"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  {selectedMonth
                    ? `เดือน ${MONTH_FULL_NAMES_TH[selectedMonth - 1] || MONTH_NAMES_TH[selectedMonth - 1]}`
                    : `ทั้งปี ${selectedYear}`}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-300 ease-out",
                    isMonthOpen && "rotate-180"
                  )}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[270px] p-2.5 rounded-2xl">
              <div className="mb-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    เลือกช่วงเวลา (ค่าใช้จ่าย)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ปี {selectedYear}
                  </span>
                </div>

                {/* All Year Button */}
                <button
                  type="button"
                  onClick={() => {
                    onMonthChange(null);
                    setIsMonthOpen(false);
                  }}
                  className={cn(
                    "mt-2 w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-98",
                    !selectedMonth
                      ? "bg-[#881224] text-white shadow-xs font-bold"
                      : "border border-slate-200/80 bg-slate-50/80 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <span>ทั้งปี {selectedYear} (รวม 12 เดือน)</span>
                  {!selectedMonth && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                {MONTH_NAMES_TH.map((monthName, idx) => {
                  const mNum = idx + 1;
                  const isSelected = selectedMonth === mNum;
                  return (
                    <button
                      key={mNum}
                      type="button"
                      onClick={() => {
                        onMonthChange(mNum);
                        setIsMonthOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-center py-2 px-1 rounded-xl text-xs transition-all duration-150 cursor-pointer active:scale-95",
                        isSelected
                          ? "bg-[#881224] text-white font-bold shadow-xs scale-[1.02]"
                          : "border border-slate-200/80 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                      title={MONTH_FULL_NAMES_TH[idx]}
                    >
                      <span className="font-medium">{monthName}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Donut Chart of Categories (5 cols) */}
          <div className="col-span-1 lg:col-span-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  สัดส่วนค่าใช้จ่ายตามประเภท ({data?.categories.length || 0} หมวด)
                </h4>
              </div>

              <div className="h-[230px] w-full">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    กำลังโหลดข้อมูล...
                  </div>
                ) : data && data.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart className="outline-none focus:outline-none" style={{ outline: "none" }}>
                      <Pie
                        data={data.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="total"
                        nameKey="category"
                        shape={renderSector}
                        onMouseEnter={(_, idx) => {
                          if (selectedCategoryIndex === null) {
                            setHoveredCategoryIndex(idx);
                          }
                        }}
                        onMouseLeave={() => {
                          if (selectedCategoryIndex === null) {
                            setHoveredCategoryIndex(null);
                          }
                        }}
                        onClick={(_, idx) => {
                          setSelectedCategoryIndex((prev) => (prev === idx ? null : idx));
                        }}
                        className="cursor-pointer select-none outline-none focus:outline-none"
                        style={{ outline: "none" }}
                        tabIndex={-1}
                      >
                        {data.categories.map((entry, index) => (
                          <Cell
                            key={`cat-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: unknown) => {
                          const num = Number(value || 0);
                          return [
                            `${formatCurrency(num)} (${formatPercent(
                              data.totalExpenses > 0 ? (num / data.totalExpenses) * 100 : 0
                            )})`,
                            "",
                          ];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    ไม่พบข้อมูลค่าใช้จ่าย
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Category Legend List */}
            <div className="mt-2 max-h-[140px] space-y-1 overflow-y-auto pr-1 text-xs">
              {data?.categories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategoryIndex((prev) => (prev === idx ? null : idx))}
                  className="w-full flex items-center justify-between rounded-lg px-2 py-1 text-left transition-all duration-150 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/70"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(cat.total)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {cat.percentage}%
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Ranked Horizontal Bar Chart (7 cols) */}
          <div className="col-span-1 lg:col-span-7 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                อันดับหมวดหมู่ค่าใช้จ่ายทั้งหมด ({data?.categories.length || 0} หมวด)
              </h4>
              <Badge variant="warning" className="text-xs">
                รวม: {formatCurrency(data?.totalExpenses || 0)}
              </Badge>
            </div>
            <div
              className="w-full"
              style={{
                height: data && data.categories.length > 0 ? `${Math.max(340, data.categories.length * 42)}px` : "340px",
              }}
            >
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  กำลังโหลดข้อมูล...
                </div>
              ) : data && data.categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.categories.map((cat, index) => ({
                      displayName: cat.category,
                      Ex_Price: cat.total,
                      percentage: cat.percentage,
                      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      categoryIndex: index,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="displayName"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={160}
                      tickFormatter={(val) =>
                        val && val.length > 22 ? `${val.substring(0, 20)}...` : val
                      }
                    />
                    <Tooltip
                      cursor={false}
                      formatter={(val: unknown, _name: unknown, entry: unknown) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const payload = (entry as any)?.payload;
                        return [
                          `${formatCurrency(Number(val || 0))} (${payload?.percentage || 0}%)`,
                          "ยอดรวมหมวดหมู่",
                        ];
                      }}
                    />
                    <Bar
                      dataKey="Ex_Price"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={22}
                      className="cursor-pointer select-none"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={(entry: any) => {
                        const idx = entry?.categoryIndex ?? entry?.payload?.categoryIndex;
                        if (typeof idx === "number") {
                          setSelectedCategoryIndex((prev) => (prev === idx ? null : idx));
                        }
                      }}
                    >
                      {data.categories.map((cat, index) => {
                        const isSelected = selectedCategoryIndex === index;
                        const hasSelection = selectedCategoryIndex !== null;
                        return (
                          <Cell
                            key={`bar-cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            opacity={hasSelection && !isSelected ? 0.3 : 1}
                            stroke={isSelected ? "currentColor" : "transparent"}
                            strokeWidth={isSelected ? 2 : 0}
                            className="transition-opacity duration-200 text-slate-900 dark:text-white"
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  ไม่พบข้อมูลค่าใช้จ่าย
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expense Items Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                ตารางรายการค่าใช้จ่าย ({filteredItems.length} รายการ)
              </h4>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryIndex(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#881224]/10 text-[#881224] dark:bg-[#881224]/25 dark:text-[#f87171] border border-[#881224]/30 hover:bg-[#881224]/20 transition-all cursor-pointer"
                  title="คลิกเพื่อยกเลิกการกรองหมวดหมู่นี้"
                >
                  <span>หมวด: {selectedCategory.category}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาประเภทค่าใช้จ่าย, หมวดหมู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-full border border-slate-200/90 bg-white/90 pl-9 pr-4 text-xs shadow-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">เดือน</TableHead>
                  <TableHead>ประเภทค่าใช้จ่าย</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead className="text-right">ยอดเงิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-slate-400 py-6">
                      กำลังโหลดรายการ...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-slate-400 py-6">
                      ไม่พบข้อมูลค่าใช้จ่ายตามเงื่อนไขที่ค้นหา
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, idx) => {
                    const categoryName = item.Expense_Type_Name || item.Ex_Type || item.Ex_Name || "ทั่วไป";
                    const catIndex = data?.categories.findIndex((c) => c.category === categoryName) ?? -1;
                    const catColor = catIndex >= 0 ? CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length] : "#64748b";
                    const isSelected = selectedCategoryIndex === catIndex;

                    return (
                      <TableRow key={item.Ex_ID || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60">
                        <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {MONTH_NAMES_TH[(item.MonthSale || 1) - 1]}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => {
                              if (catIndex >= 0) {
                                setSelectedCategoryIndex((prev) => (prev === catIndex ? null : catIndex));
                              }
                            }}
                            className={cn(
                              "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-all tracking-wide cursor-pointer hover:brightness-110 active:scale-95",
                              isSelected && "ring-2 ring-offset-1 ring-slate-900 dark:ring-white"
                            )}
                            style={{
                              backgroundColor: catColor,
                            }}
                            title="คลิกเพื่อกรองเฉพาะหมวดนี้"
                          >
                            <span className="truncate max-w-[180px]">{categoryName}</span>
                          </button>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                          {item.Ex_Name || item.Ex_Detail || item.Expense_Type_Name || "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-amber-600 dark:text-amber-400 text-xs font-mono">
                          {formatCurrency(item.Ex_Price)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
