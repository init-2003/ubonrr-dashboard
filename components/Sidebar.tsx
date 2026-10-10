"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  GitFork,
  Store,
  Receipt,
  Table as TableIcon,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut,
} from "lucide-react";

export type NavTabValue = "overview" | "sankey" | "revenue" | "expenses" | "table";

interface NavItem {
  id: NavTabValue;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    label: "ภาพรวมบริหาร (Overview)",
    shortLabel: "ภาพรวม",
    icon: LayoutDashboard,
    description: "สรุปตัวชี้วัดทางการเงินและ KPI หลัก (Executive KPI Cards)",
  },
  {
    id: "sankey",
    label: "ผังกระแสการเงิน (Financial Flow)",
    shortLabel: "ผังกระแสเงิน",
    icon: GitFork,
    description: "Sankey Diagram วิเคราะห์การไหลเวียนของรายได้ ต้นทุน และกำไร",
  },
  {
    id: "revenue",
    label: "ช่องทางรายได้ (Revenue Mix)",
    shortLabel: "ช่องทางรายได้",
    icon: Store,
    description: "เปรียบเทียบยอดขายส่ง (Wholesale) และขายปลีก (Retail)",
  },
  {
    id: "expenses",
    label: "เจาะลึกค่าใช้จ่าย (Expense Drilldown)",
    shortLabel: "ค่าใช้จ่าย",
    icon: Receipt,
    description: "วิเคราะห์ค่าใช้จ่ายดำเนินงานแยกตามหมวดหมู่",
  },
  {
    id: "table",
    label: "ตารางการเงิน (Data Grid)",
    shortLabel: "ตารางการเงิน",
    icon: TableIcon,
    description: "ตารางงบการเงินรายเดือนพร้อมระบบค้นหาและ Export CSV",
  },
];

interface SidebarProps {
  activeTab: NavTabValue;
  onTabChange: (tab: NavTabValue) => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleLogout = () => {
    if (typeof window !== "undefined" && window.confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      logout();
    }
  };

  const [prevActiveTab, setPrevActiveTab] = React.useState(activeTab);
  const [optimisticTab, setOptimisticTab] = React.useState<NavTabValue | null>(null);

  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setOptimisticTab(null);
  }

  const currentTab = optimisticTab ?? activeTab;
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === currentTab);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white/95 backdrop-blur-md transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden dark:border-slate-800 dark:bg-slate-950/95",
          // Desktop width
          isCollapsed ? "md:w-20" : "md:w-64",
          // Mobile slide-in
          isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Top Header & Brand Logo */}
        <div className="flex h-16 items-center px-5 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden shrink-0">
          {/* Fixed 40px Logo Slot (Aligned perfectly with navigation icons below) */}
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <button
              type="button"
              onClick={isCollapsed && !isMobileOpen ? onToggleCollapse : undefined}
              disabled={!isCollapsed || isMobileOpen}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-none overflow-hidden p-0 border-0 bg-transparent transition-transform duration-150",
                isCollapsed && !isMobileOpen ? "cursor-pointer active:scale-95" : "cursor-default"
              )}
              title={isCollapsed && !isMobileOpen ? "ขยายแถบเมนูด้านข้าง (Expand Sidebar)" : undefined}
            >
              <img
                src="/UbonRR_Logo.png"
                alt="UbonRR Logo"
                className={cn(
                  "h-10 w-10 rounded-none object-cover shadow-xs transition-all duration-200",
                  isCollapsed && !isMobileOpen && "group-hover:opacity-0 group-hover:scale-75"
                )}
              />
              {isCollapsed && !isMobileOpen && (
                <PanelLeftOpen className="absolute inset-0 m-auto h-5 w-5 text-slate-700 dark:text-slate-300 opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 pointer-events-none" />
              )}
            </button>
          </div>

          {/* Brand Name & Desktop Collapse Button (Right part that smoothly retracts) */}
          <div
            className={cn(
              "flex flex-1 items-center justify-between overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 ml-0 pointer-events-none" : "opacity-100 max-w-[180px] ml-3"
            )}
          >
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                UbonRR
              </span>
              <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Financial Analytics
              </span>
            </div>

            {/* Desktop Collapse Button */}
            <div className="hidden md:flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-transform duration-150 cursor-pointer"
                title="ย่อแถบเมนูด้านข้าง (Collapse Sidebar)"
              >
                <PanelLeftClose className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </Button>
            </div>

            {/* Close button on mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full active:scale-95"
                onClick={onCloseMobile}
                title="ปิดเมนู"
              >
                <X className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="relative flex flex-col gap-1.5">
            {/* Sliding Fluid Capsule Pill */}
            {activeIndex !== -1 && (
              <div
                className="absolute left-0 w-full bg-[#881224] shadow-md shadow-[#881224]/30 rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{
                  height: "40px",
                  transform: `translateY(${activeIndex * 46}px)`,
                }}
              />
            )}

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setOptimisticTab(item.id);
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={cn(
                    "relative z-10 group flex w-full h-10 items-center rounded-full text-sm font-medium transition-colors duration-200 text-left cursor-pointer active:scale-98 overflow-hidden",
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800/50"
                  )}
                  title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                >
                  {/* Fixed 40px Icon Slot */}
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        isActive
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200",
                        item.id === "sankey" && "rotate-90"
                      )}
                    />
                  </div>

                  {/* Retracting Label Section */}
                  <div
                    className={cn(
                      "flex flex-1 items-center justify-between overflow-hidden ml-3 pr-3.5 transition-all duration-300",
                      isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[160px]"
                    )}
                  >
                    <span className="truncate text-xs font-semibold sm:text-sm whitespace-nowrap">
                      {item.shortLabel}
                    </span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? "outline" : "purple"}
                        className={cn(
                          "ml-1.5 px-1.5 py-0 text-[10px] transition-colors duration-200 whitespace-nowrap",
                          isActive && "border-white/40 text-white bg-white/10"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: User Info & Collapse Toggle */}
        <div className="border-t border-slate-200/80 p-5 dark:border-slate-800/80 shrink-0 overflow-hidden">
          {mounted && user && (
            <div className="w-full h-10 flex items-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 transition-all duration-300 overflow-hidden">
              {/* Fixed 40px Avatar Slot */}
              <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#881224] text-white text-xs font-bold shadow-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Retracting User Info & Logout */}
              <div
                className={cn(
                  "flex flex-1 items-center justify-between overflow-hidden ml-2 pr-2.5 transition-all duration-300",
                  isCollapsed && !isMobileOpen ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[160px]"
                )}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {user.name || user.username}
                  </span>
                  <span className="truncate text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-150 active:scale-90 cursor-pointer shrink-0"
                  title="ออกจากระบบ (Logout)"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
