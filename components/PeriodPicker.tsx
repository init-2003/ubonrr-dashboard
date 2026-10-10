"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PeriodPickerProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  selectedMonth?: number | null;
  onMonthChange?: (month: number | null) => void;
}

export function PeriodPicker({
  selectedYear,
  onYearChange,
  availableYears,
  onMonthChange,
}: PeriodPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [decadeStart, setDecadeStart] = React.useState(
    Math.floor(selectedYear / 12) * 12
  );

  // Sync decadeStart whenever Popover opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setDecadeStart(Math.floor(selectedYear / 12) * 12);
    }
  };

  const handlePrevDecade = () => {
    setDecadeStart((prev) => prev - 12);
  };

  const handleNextDecade = () => {
    setDecadeStart((prev) => prev + 12);
  };

  const handleSelectYear = (yr: number) => {
    if (yr !== selectedYear) {
      onYearChange(yr);
    }
    if (onMonthChange) {
      onMonthChange(null);
    }
    setOpen(false);
  };

  // Generate 12 years for the window
  const decadeYears = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => decadeStart + i);
  }, [decadeStart]);

  const decadeEnd = decadeStart + 11;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-2 rounded-full border-slate-200/90 bg-white/90 px-3.5 text-xs font-semibold shadow-xs transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-800 sm:text-sm",
            open && "ring-2 ring-[#881224]/20 border-[#881224]/50 dark:border-[#881224]/50"
          )}
          title="เลือกปี (Year)"
        >
          <CalendarIcon className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
          <span className="truncate max-w-[240px] text-slate-900 dark:text-slate-100">
            ปี {selectedYear}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0 opacity-80 transition-transform duration-300 ease-out",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[280px] p-3 rounded-2xl">
        {/* Header: Decade Window Navigator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevDecade}
            className="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="12 ปีก่อนหน้า"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </Button>

          <div className="text-center">
            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
              ปี {decadeStart} - {decadeEnd}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDecade}
            className="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="12 ปีถัดไป"
          >
            <ChevronRight className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </Button>
        </div>

        {/* 12-Year Selection Grid (3 cols x 4 rows) */}
        <div className="grid grid-cols-3 gap-1.5 pt-2.5">
          {decadeYears.map((yr) => {
            const isSelected = selectedYear === yr;
            const hasData = availableYears ? availableYears.includes(yr) : true;

            return (
              <button
                key={yr}
                onClick={() => handleSelectYear(yr)}
                className={cn(
                  "relative flex items-center justify-center rounded-xl py-2.5 px-1 text-xs font-bold transition-all duration-150 cursor-pointer",
                  isSelected
                    ? "bg-[#881224] text-white shadow-md shadow-[#881224]/25 scale-[1.02]"
                    : hasData
                    ? "border border-slate-200/80 bg-white/90 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                    : "border border-slate-200/40 bg-slate-50/40 text-slate-400 hover:bg-slate-100/60 dark:border-slate-800/40 dark:bg-slate-900/40 dark:text-slate-600 dark:hover:text-slate-300"
                )}
                title={`เลือกปี ${yr}`}
              >
                <span>{yr}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
