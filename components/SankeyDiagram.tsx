"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FinancialData, SankeyNode, SankeyLink } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, ChevronDown, Check, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

interface SankeyDiagramProps {
  data: FinancialData;
  selectedYear?: number;
  selectedMonth?: number | null;
  onMonthChange?: (month: number | null) => void;
}

interface LayoutNode {
  id: string;
  label: string;
  color: string;
  column: number;
  x: number;
  y: number;
  h: number;
  value: number;
}

interface LayoutLink {
  id: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  value: number;
  x0: number;
  y0: number;
  h0: number;
  x1: number;
  y1: number;
  h1: number;
  sourceColor: string;
  targetColor: string;
}

const DYNAMIC_CATEGORY_COLORS = [
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#eab308", // yellow-500
  "#d946ef", // fuchsia-500
  "#fbbf24", // amber-400
  "#14b8a6", // teal-500
  "#a855f7", // purple-500
  "#f43f5e", // rose-500
  "#3b82f6", // blue-500
  "#64748b", // slate-500
];

const THAI_MONTHS = [
  { month: 1, name: "ม.ค.", fullName: "มกราคม" },
  { month: 2, name: "ก.พ.", fullName: "กุมภาพันธ์" },
  { month: 3, name: "มี.ค.", fullName: "มีนาคม" },
  { month: 4, name: "เม.ย.", fullName: "เมษายน" },
  { month: 5, name: "พ.ค.", fullName: "พฤษภาคม" },
  { month: 6, name: "มิ.ย.", fullName: "มิถุนายน" },
  { month: 7, name: "ก.ค.", fullName: "กรกฎาคม" },
  { month: 8, name: "ส.ค.", fullName: "สิงหาคม" },
  { month: 9, name: "ก.ย.", fullName: "กันยายน" },
  { month: 10, name: "ต.ค.", fullName: "ตุลาคม" },
  { month: 11, name: "พ.ย.", fullName: "พฤศจิกายน" },
  { month: 12, name: "ธ.ค.", fullName: "ธันวาคม" },
];

export default function SankeyDiagram({
  data,
  selectedYear = 2026,
  selectedMonth = null,
  onMonthChange,
}: SankeyDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 440 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // Toggle OPEX breakdown state (persisted in localStorage)
  const [showOpexBreakdown, setShowOpexBreakdown] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ubr_sankey_opex_breakdown");
        if (saved !== null) return saved === "true";
      } catch {
        // ignore
      }
    }
    return true;
  });

  const toggleOpexBreakdown = () => {
    setShowOpexBreakdown((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ubr_sankey_opex_breakdown", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ show: false, x: 0, y: 0, content: null });

  // Handle container resizing to fit viewport height precisely without overflowing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.max(rect.width, 760);
      const containerH = containerRef.current.clientHeight;
      const h = containerH > 150 ? containerH : (typeof window !== "undefined" ? Math.max(window.innerHeight - 280, 360) : 440);
      setDimensions({
        width: w,
        height: h,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const targetW = Math.max(width, 760);
      const targetH = height > 150 ? height : 440;

      setDimensions((prev) => {
        if (prev.width === targetW && Math.abs(prev.height - targetH) < 3) return prev;
        return { width: targetW, height: targetH };
      });
    });

    resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const {
    wholesaleRevenue: wholesale,
    retailRevenue: retail,
    cogs,
    operatingExpenses: opexProp,
    expenseCategories = [],
    tax = 0,
  } = data;

  const opex = useMemo(() => {
    if (typeof opexProp === "number" && opexProp > 0) return opexProp;
    return expenseCategories.reduce((acc, c) => acc + (c.total || 0), 0);
  }, [opexProp, expenseCategories]);

  // Normalized dynamic categories for Column 3
  const normalizedOpexCategories = useMemo(() => {
    if (!expenseCategories || expenseCategories.length === 0) return [];

    const valid = [...expenseCategories].filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    if (valid.length <= 6) {
      return valid.map((c, idx) => ({
        id: `opex_cat_${idx}`,
        label: c.category,
        value: c.total,
        color: DYNAMIC_CATEGORY_COLORS[idx % DYNAMIC_CATEGORY_COLORS.length],
      }));
    }

    const top5 = valid.slice(0, 5);
    const rest = valid.slice(5);
    const restTotal = rest.reduce((acc, c) => acc + c.total, 0);

    const result = top5.map((c, idx) => ({
      id: `opex_cat_${idx}`,
      label: c.category,
      value: c.total,
      color: DYNAMIC_CATEGORY_COLORS[idx % DYNAMIC_CATEGORY_COLORS.length],
    }));

    if (restTotal > 0) {
      result.push({
        id: `opex_cat_others`,
        label: `หมวดหมู่อื่นๆ (${rest.length} หมวด)`,
        value: restTotal,
        color: "#94a3b8",
      });
    }

    return result;
  }, [expenseCategories]);

  const actualRevenue = useMemo(() => {
    return wholesale + retail;
  }, [wholesale, retail]);

  const netProfit = useMemo(() => {
    return actualRevenue - (cogs + opex + tax);
  }, [actualRevenue, cogs, opex, tax]);

  const netLoss = useMemo(() => {
    return netProfit < 0 ? -netProfit : 0;
  }, [netProfit]);

  const totalInflow = useMemo(() => {
    return actualRevenue + netLoss;
  }, [actualRevenue, netLoss]);

  // Construct Nodes dynamically
  const nodes = useMemo(() => {
    const list: SankeyNode[] = [];

    // Column 0: Sources of money
    if (wholesale > 0) {
      list.push({ id: 'wholesale', label: 'รายได้จากขายส่ง', color: '#0ea5e9', column: 0 }); // sky-500
    }
    if (retail > 0) {
      list.push({ id: 'retail', label: 'รายได้จากขายปลีก', color: '#6366f1', column: 0 }); // indigo-500
    }
    if (netLoss > 0) {
      list.push({ id: 'net_loss', label: 'ส่วนที่ขาดทุนสุทธิ', color: '#ef4444', column: 0 }); // red-500
    }

    // Column 1: Intermediate
    if (totalInflow > 0) {
      list.push({ id: 'total_revenue', label: 'หมุนเวียนรวม', color: '#64748b', column: 1 }); // slate-500
    }

    // Column 2: Destinies
    if (cogs > 0) {
      list.push({ id: 'cogs', label: 'ต้นทุนสินค้า (COGS)', color: '#f59e0b', column: 2 }); // amber-500
    }
    if (opex > 0) {
      list.push({ id: 'opex', label: 'ค่าใช้จ่ายดำเนินงาน', color: '#8b5cf6', column: 2 }); // violet-500
    }
    if (tax > 0) {
      list.push({ id: 'tax', label: 'ภาษี', color: '#f97316', column: 2 }); // orange-500
    }
    if (netProfit > 0) {
      list.push({ id: 'net_profit', label: 'กำไรสุทธิ', color: '#10b981', column: 2 }); // emerald-500
    }

    // Column 3: Dynamic Opex splits from database (if enabled)
    if (showOpexBreakdown && opex > 0 && normalizedOpexCategories.length > 0) {
      normalizedOpexCategories.forEach((cat) => {
        list.push({
          id: cat.id,
          label: cat.label,
          color: cat.color,
          column: 3,
        });
      });
    }

    return list;
  }, [wholesale, retail, netLoss, totalInflow, cogs, opex, tax, netProfit, normalizedOpexCategories, showOpexBreakdown]);

  // Construct Links dynamically
  const links = useMemo(() => {
    const list: SankeyLink[] = [];
    if (totalInflow <= 0) return list;

    // Col 0 -> Col 1
    if (wholesale > 0) {
      list.push({ source: 'wholesale', target: 'total_revenue', value: wholesale });
    }
    if (retail > 0) {
      list.push({ source: 'retail', target: 'total_revenue', value: retail });
    }
    if (netLoss > 0) {
      list.push({ source: 'net_loss', target: 'total_revenue', value: netLoss });
    }

    // Col 1 -> Col 2
    if (cogs > 0) {
      list.push({ source: 'total_revenue', target: 'cogs', value: cogs });
    }
    if (opex > 0) {
      list.push({ source: 'total_revenue', target: 'opex', value: opex });
    }
    if (tax > 0) {
      list.push({ source: 'total_revenue', target: 'tax', value: tax });
    }
    if (netProfit > 0) {
      list.push({ source: 'total_revenue', target: 'net_profit', value: netProfit });
    }

    // Col 2 -> Col 3 (Dynamic Opex splits if enabled)
    if (showOpexBreakdown && opex > 0 && normalizedOpexCategories.length > 0) {
      normalizedOpexCategories.forEach((cat) => {
        list.push({
          source: 'opex',
          target: cat.id,
          value: cat.value,
        });
      });
    }

    return list;
  }, [totalInflow, wholesale, retail, netLoss, cogs, opex, tax, netProfit, normalizedOpexCategories, showOpexBreakdown]);

  // Compute Layout positions with generous proportions
  const layout = useMemo(() => {
    const { width, height } = dimensions;
    if (totalInflow <= 0) return { layoutNodes: [], layoutLinks: [] };

    const paddingLeft = 170; // generous margin for left labels so they are never clipped
    const paddingRight = showOpexBreakdown ? 180 : 170; // generous margin for right labels
    const nodeWidth = 14;
    const numSteps = showOpexBreakdown ? 3 : 2;
    const colWidth = (width - paddingLeft - paddingRight - nodeWidth) / numSteps;

    // X coordinates
    const getColX = (col: number) => paddingLeft + col * colWidth;

    // Group nodes by column
    const colNodes: Record<number, SankeyNode[]> = { 0: [], 1: [], 2: [], 3: [] };
    nodes.forEach(node => {
      colNodes[node.column].push(node);
    });

    // Vertical scale for columns 0, 1, 2
    const totalAvailableHeight = Math.max(height - 48, 160);
    const nodePadding = Math.max(Math.min(height * 0.015, 8), 6);
    const maxSpacing = Math.max(
      (colNodes[0].length - 1) * nodePadding,
      (colNodes[2].length - 1) * nodePadding,
      0
    );
    const totalNodeH = Math.max(totalAvailableHeight - maxSpacing, 140);

    // Map to hold calculated positions
    const nodeMap = new Map<string, { x: number; y: number; h: number; node: SankeyNode }>();

    // 1. Column 0 (Inflows: Wholesale, Retail, Net Loss)
    const c0List = colNodes[0];
    let sumC0H = 0;
    if (c0List.length > 0) {
      const c0Spacing = (c0List.length - 1) * nodePadding;
      const c0StartTop = Math.max((height - (totalNodeH + c0Spacing)) / 2, 12);
      let c0CurrentY = c0StartTop;

      c0List.forEach(node => {
        let val = 0;
        if (node.id === 'wholesale') val = wholesale;
        else if (node.id === 'retail') val = retail;
        else if (node.id === 'net_loss') val = netLoss;

        // Proportional height strictly based on data share with 2.5px visible minimum
        const rawH = (val / totalInflow) * totalNodeH;
        const h = Math.max(rawH, 2.5);
        nodeMap.set(node.id, {
          x: getColX(0),
          y: c0CurrentY,
          h: h,
          node: node
        });
        c0CurrentY += h + nodePadding;
        sumC0H += h;
      });
    }

    // 2. Column 2 (Outflows: COGS, OPEX, Tax, Net Profit)
    const c2List = colNodes[2];
    let sumC2H = 0;
    if (c2List.length > 0) {
      const c2Spacing = (c2List.length - 1) * nodePadding;
      const c2StartTop = Math.max((height - (totalNodeH + c2Spacing)) / 2, 12);
      let c2CurrentY = c2StartTop;

      c2List.forEach(node => {
        let val = 0;
        if (node.id === 'cogs') val = cogs;
        else if (node.id === 'opex') val = opex;
        else if (node.id === 'tax') val = tax;
        else if (node.id === 'net_profit') val = netProfit;

        // Proportional height strictly based on data share with 2.5px visible minimum
        const rawH = (val / totalInflow) * totalNodeH;
        const h = Math.max(rawH, 2.5);

        nodeMap.set(node.id, {
          x: getColX(2),
          y: c2CurrentY,
          h: h,
          node: node
        });
        c2CurrentY += h + nodePadding;
        sumC2H += h;
      });
    }

    // 3. Column 1 (Total Revenue)
    // Sized to seamlessly match sum of node heights
    const totalRevenueH = Math.max(sumC0H, sumC2H, totalNodeH);
    const totalRevenueY = (height - totalRevenueH) / 2;
    if (colNodes[1].length > 0) {
      nodeMap.set('total_revenue', {
        x: getColX(1),
        y: totalRevenueY,
        h: totalRevenueH,
        node: colNodes[1][0]
      });
    }

    // 4. Column 3 (Sub OPEX splits)
    const categoryValueMap = new Map<string, number>();
    normalizedOpexCategories.forEach(c => categoryValueMap.set(c.id, c.value));

    const c3List = colNodes[3];
    if (showOpexBreakdown && c3List.length > 0 && opex > 0) {
      const opexNode = nodeMap.get('opex');
      const opexCenterY = opexNode ? opexNode.y + opexNode.h / 2 : height / 2;
      const c3NodePadding = Math.max(Math.min(height * 0.015, 8), 4);
      const c3TotalHeight = Math.min(height * 0.72, 320);
      const availableNodeHeight = Math.max(c3TotalHeight - (c3List.length - 1) * c3NodePadding, 60);

      let c3CurrentY = Math.max(opexCenterY - c3TotalHeight / 2, 12);
      if (c3CurrentY + c3TotalHeight > height - 12) {
        c3CurrentY = Math.max(height - c3TotalHeight - 12, 12);
      }

      c3List.forEach(node => {
        const val = categoryValueMap.get(node.id) || 0;
        const ratio = val / Math.max(opex, 1);
        const h = Math.max(ratio * availableNodeHeight, 4);

        nodeMap.set(node.id, {
          x: getColX(3),
          y: c3CurrentY,
          h: h,
          node: node
        });
        c3CurrentY += h + c3NodePadding;
      });
    }

    // Stacking offset markers
    const outOffsets: Record<string, number> = {};
    const inOffsets: Record<string, number> = {};
    nodes.forEach(n => {
      outOffsets[n.id] = 0;
      inOffsets[n.id] = 0;
    });

    // Create paths with 100% matched source and target slice heights
    const layoutLinks = links.map((link, idx) => {
      const srcNode = nodeMap.get(link.source);
      const tgtNode = nodeMap.get(link.target);

      if (!srcNode || !tgtNode) return null;

      let srcSliceH = 0;
      let tgtSliceH = 0;

      if (link.source === 'wholesale' || link.source === 'retail' || link.source === 'net_loss') {
        // Col 0 -> Col 1: Slice height matches exact source node height
        srcSliceH = srcNode.h;
        tgtSliceH = srcNode.h;
      } else if (link.source === 'total_revenue') {
        // Col 1 -> Col 2: Slice height matches exact target node height
        srcSliceH = tgtNode.h;
        tgtSliceH = tgtNode.h;
      } else if (link.source === 'opex') {
        // Col 2 -> Col 3: Slices of OPEX node expanding to Col 3 nodes
        srcSliceH = (link.value / Math.max(opex, 1)) * srcNode.h;
        tgtSliceH = tgtNode.h;
      } else {
        const linkH = Math.max((link.value / totalInflow) * totalNodeH, 2.5);
        srcSliceH = linkH;
        tgtSliceH = linkH;
      }

      const y0 = srcNode.y + outOffsets[link.source];
      outOffsets[link.source] += srcSliceH;

      const y1 = tgtNode.y + inOffsets[link.target];
      inOffsets[link.target] += tgtSliceH;

      return {
        id: `${link.source}-${link.target}-${idx}`,
        sourceId: link.source,
        targetId: link.target,
        sourceLabel: srcNode.node.label,
        targetLabel: tgtNode.node.label,
        value: link.value,
        x0: srcNode.x + nodeWidth,
        y0: y0,
        h0: srcSliceH,
        x1: tgtNode.x,
        y1: y1,
        h1: tgtSliceH,
        sourceColor: srcNode.node.color,
        targetColor: tgtNode.node.color,
      };
    }).filter((l): l is NonNullable<typeof l> => l !== null);

    const layoutNodes = Array.from(nodeMap.values()).map(n => {
      let val = 0;
      if (n.node.id === 'wholesale') val = wholesale;
      else if (n.node.id === 'retail') val = retail;
      else if (n.node.id === 'net_loss') val = netLoss;
      else if (n.node.id === 'total_revenue') val = totalInflow;
      else if (n.node.id === 'cogs') val = cogs;
      else if (n.node.id === 'opex') val = opex;
      else if (n.node.id === 'tax') val = tax;
      else if (n.node.id === 'net_profit') val = netProfit;
      else if (categoryValueMap.has(n.node.id)) val = categoryValueMap.get(n.node.id) || 0;

      return {
        id: n.node.id,
        label: n.node.label,
        color: n.node.color,
        column: n.node.column,
        x: n.x,
        y: n.y,
        h: n.h,
        value: val,
      };
    });

    return { layoutNodes, layoutLinks };
  }, [dimensions, nodes, links, totalInflow, wholesale, retail, netLoss, cogs, opex, tax, netProfit, normalizedOpexCategories, showOpexBreakdown]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(val);
  };

  const getPercentage = (val: number) => {
    if (actualRevenue <= 0) return '0%';
    return `${((val / actualRevenue) * 100).toFixed(1)}%`;
  };

  // Check if link or node is highlighted
  const getLinkHighlight = (link: LayoutLink) => {
    if (!hoveredNodeId && !hoveredLinkId) return { opacity: 0.45, isHighlighted: false };

    if (hoveredLinkId === link.id) return { opacity: 0.88, isHighlighted: true };

    if (hoveredNodeId && (link.sourceId === hoveredNodeId || link.targetId === hoveredNodeId)) {
      return { opacity: 0.88, isHighlighted: true };
    }

    return { opacity: 0.08, isHighlighted: false };
  };

  const getNodeHighlight = (nodeId: string) => {
    if (!hoveredNodeId && !hoveredLinkId) return { opacity: 1, isHighlighted: false };

    if (hoveredNodeId === nodeId) return { opacity: 1, isHighlighted: true };

    if (hoveredLinkId) {
      const activeLink = layout.layoutLinks.find(l => l.id === hoveredLinkId);
      if (activeLink && (activeLink.sourceId === nodeId || activeLink.targetId === nodeId)) {
        return { opacity: 1, isHighlighted: true };
      }
    }

    if (hoveredNodeId) {
      const isConnected = layout.layoutLinks.some(
        l => (l.sourceId === hoveredNodeId && l.targetId === nodeId) ||
          (l.targetId === hoveredNodeId && l.sourceId === nodeId)
      );
      if (isConnected) return { opacity: 1, isHighlighted: true };
    }

    return { opacity: 0.25, isHighlighted: false };
  };

  // Precise tooltip coordinate calculation
  const getTooltipCoords = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const containerWidth = rect.width;
    let x = e.clientX - rect.left + 16;
    let y = e.clientY - rect.top - 10;
    if (x + 280 > containerWidth) {
      x = e.clientX - rect.left - 290;
    }
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    return { x, y };
  };

  // Hover handlers for links
  const handleLinkMouseEnter = (e: React.MouseEvent, link: LayoutLink) => {
    setHoveredLinkId(link.id);
    const { x, y } = getTooltipCoords(e);
    const shareOfRev = getPercentage(link.value);

    setTooltip({
      show: true,
      x,
      y,
      content: (
        <div className="space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">เส้นทางการไหลของเงิน</div>
          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {link.sourceLabel} → {link.targetLabel}
          </div>
          <div className="flex items-baseline justify-between gap-6 pt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">{formatCurrency(link.value)}</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold font-mono">({shareOfRev} ของรายได้)</span>
          </div>
        </div>
      )
    });
  };

  const handleLinkMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getTooltipCoords(e);
    setTooltip(prev => ({ ...prev, x, y }));
  };

  const handleLinkMouseLeave = () => {
    setHoveredLinkId(null);
    setTooltip(prev => ({ ...prev, show: false }));
  };

  // Hover handlers for nodes
  const handleNodeMouseEnter = (e: React.MouseEvent, node: LayoutNode) => {
    setHoveredNodeId(node.id);
    const { x, y } = getTooltipCoords(e);

    let infoText = '';
    if (node.id === 'net_profit') {
      infoText = 'กำไรสุทธิหลังหักต้นทุนและค่าใช้จ่ายทั้งหมด';
    } else if (node.id === 'net_loss') {
      infoText = 'ยอดขาดทุนสุทธิ (รายจ่ายมากกว่ารายได้)';
    } else if (node.id === 'cogs') {
      infoText = 'ต้นทุนการซื้อสินค้ามาจัดจำหน่าย';
    } else if (node.id === 'opex') {
      infoText = 'รวมค่าใช้จ่ายส่วนปฏิบัติการ (ค่าน้ำ, ไฟ, น้ำมัน, เงินเดือน ฯลฯ)';
    } else if (node.id === 'total_revenue') {
      infoText = 'ยอดเงินหมุนเวียนขาเข้าทั้งหมด';
    } else {
      infoText = `ยอดรวมประเภท ${node.label}`;
    }

    setTooltip({
      show: true,
      x,
      y,
      content: (
        <div className="space-y-1 max-w-xs">
          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }}></span>
            {node.label}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{infoText}</div>
          <div className="flex items-baseline justify-between gap-6 pt-1 border-t border-slate-200 dark:border-slate-800/60 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">{formatCurrency(node.value)}</span>
            {node.id !== 'total_revenue' && (
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold font-mono">({getPercentage(node.value)})</span>
            )}
          </div>
        </div>
      )
    });
  };

  const handleNodeMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getTooltipCoords(e);
    setTooltip(prev => ({ ...prev, x, y }));
  };

  const handleNodeMouseLeave = () => {
    setHoveredNodeId(null);
    setTooltip(prev => ({ ...prev, show: false }));
  };

  // Funnel Bézier curve generator (supports different source and target heights)
  const getBezierRibbonPath = (x0: number, y0: number, h0: number, x1: number, y1: number, h1: number) => {
    const controlX = x0 + (x1 - x0) * 0.45;
    return `
      M ${x0} ${y0}
      C ${controlX} ${y0}, ${x1 - (x1 - x0) * 0.45} ${y1}, ${x1} ${y1}
      v ${h1}
      C ${x1 - (x1 - x0) * 0.45} ${y1 + h1}, ${controlX} ${y0 + h0}, ${x0} ${y0 + h0}
      Z
    `;
  };

  // Centerline for wide invisible hitbox
  const getCenterlinePath = (x0: number, y0: number, h0: number, x1: number, y1: number, h1: number) => {
    const cy0 = y0 + h0 / 2;
    const cy1 = y1 + h1 / 2;
    const controlX = x0 + (x1 - x0) * 0.45;
    return `M ${x0} ${cy0} C ${controlX} ${cy0}, ${x1 - (x1 - x0) * 0.45} ${cy1}, ${x1} ${cy1}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] min-h-[440px] w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 relative shadow-md dark:bg-slate-900 dark:border-slate-800/80 dark:shadow-xl overflow-hidden transition-colors" id="sankey-diagram-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/60 shrink-0">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2" id="sankey-title">
            <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            แผนภาพกระแสการเงิน (Sankey Diagram)
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedMonth
              ? `แสดงทิศทางการกระจายรายได้และค่าใช้จ่ายประจำเดือน ${THAI_MONTHS[selectedMonth - 1]?.fullName || ""} ปี ${selectedYear}`
              : `แสดงทิศทางการกระจายรายได้และค่าใช้จ่ายรวมทั้งปี ${selectedYear}`}
          </p>
        </div>

        {/* Right side: Opex Toggle & Month dropdown */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Toggle OPEX Breakdown Switch */}
          {opex > 0 && normalizedOpexCategories.length > 0 && (
            <button
              type="button"
              id="sankey-toggle-opex-breakdown"
              role="switch"
              aria-checked={showOpexBreakdown}
              onClick={toggleOpexBreakdown}
              className={cn(
                "inline-flex items-center gap-2 h-7.5 pl-2.5 pr-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer select-none active:scale-95",
                showOpexBreakdown
                  ? "bg-[#881224]/10 text-[#881224] border-[#881224]/30 dark:bg-[#881224]/20 dark:text-[#ff99a8] dark:border-[#881224]/50"
                  : "bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 dark:bg-slate-900/90 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              )}
              title={showOpexBreakdown ? "คลิกเพื่อปิดรายการแยกย่อยค่าใช้จ่าย" : "คลิกเพื่อเปิดรายการแยกย่อยค่าใช้จ่าย"}
            >
              <ListTree
                className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-colors",
                  showOpexBreakdown ? "text-[#881224] dark:text-[#ff99a8]" : "text-slate-500 dark:text-slate-400"
                )}
              />
              <span>แยกย่อย คชจ.</span>
              {/* Switch Track & Knob */}
              <div
                className={cn(
                  "relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out",
                  showOpexBreakdown ? "bg-[#881224] shadow-xs shadow-[#881224]/30" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out",
                    showOpexBreakdown ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </div>
            </button>
          )}

          {onMonthChange && (
            <Popover open={isMonthOpen} onOpenChange={setIsMonthOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  id="sankey-month-filter"
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7.5 px-3 rounded-full border border-slate-200/90 bg-white/95 text-xs font-semibold text-slate-800 shadow-xs transition-all duration-200 hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer",
                    isMonthOpen && "ring-2 ring-[#881224]/20 border-[#881224]/50 dark:border-[#881224]/50"
                  )}
                  title="เลือกเดือนที่ต้องการแสดง"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                  <span>
                    {selectedMonth
                      ? `เดือน ${THAI_MONTHS[selectedMonth - 1]?.fullName || THAI_MONTHS[selectedMonth - 1]?.name}`
                      : `ทั้งปี ${selectedYear}`}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-300 ease-out",
                      isMonthOpen && "rotate-180"
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[270px] p-2.5 rounded-2xl">
                <div className="mb-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      เลือกช่วงเวลา (Sankey)
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
                        : "border border-slate-200/80 bg-slate-50/80 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                    )}
                  >
                    <span>ทั้งปี {selectedYear} (รวม 12 เดือน)</span>
                    {!selectedMonth && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  {THAI_MONTHS.map((m) => {
                    const isSelected = selectedMonth === m.month;
                    return (
                      <button
                        key={m.month}
                        type="button"
                        onClick={() => {
                          onMonthChange(m.month);
                          setIsMonthOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-center py-2 px-1 rounded-xl text-xs transition-all duration-150 cursor-pointer active:scale-95",
                          isSelected
                            ? "bg-[#881224] text-white font-bold shadow-xs scale-[1.02]"
                            : "border border-slate-200/80 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        )}
                        title={m.fullName}
                      >
                        <span className="font-medium">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Indicator legends */}
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> รายรับขายส่ง
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> รายรับขายปลีก
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ต้นทุนสินค้า
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span> ค่าใช้จ่ายรวม
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> กำไรสุทธิ
            </span>
          </div>
        </div>
      </div>

      {totalInflow <= 0 ? (
        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center px-4 dark:border-slate-800 dark:bg-slate-950/40" id="sankey-empty">
          <div className="flex items-center justify-center text-slate-700 dark:text-slate-300 mb-3 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-300">ไม่มีข้อมูลธุรกรรมทางการเงิน</span>
          <p className="text-xs text-slate-500 max-w-sm mt-1">กรุณากรอกยอดขาย รายได้ หรือค่าใช้จ่ายด้านซ้ายเพื่อเปิดใช้งานแผนภาพ Sankey</p>
        </div>
      ) : (
        <div ref={containerRef} className="relative w-full flex-1 h-full min-h-0 select-none overflow-x-auto overflow-y-hidden flex items-center justify-center" id="sankey-svg-container">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-full block min-w-[760px] max-h-full"
          >
            <defs>
              {/* Gradients for flows */}
              {layout.layoutLinks.map((link) => (
                <linearGradient
                  key={`gradient-${link.id}`}
                  id={`gradient-${link.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor={link.sourceColor} />
                  <stop offset="100%" stopColor={link.targetColor} />
                </linearGradient>
              ))}
            </defs>

            {/* Links Group */}
            <g className="sankey-links">
              {layout.layoutLinks.map((link) => {
                const highlight = getLinkHighlight(link);
                return (
                  <g key={link.id} className="cursor-pointer">
                    {/* 1. Full Ribbon Path with direct mouse hover */}
                    <path
                      d={getBezierRibbonPath(link.x0, link.y0, link.h0, link.x1, link.y1, link.h1)}
                      fill={`url(#gradient-${link.id})`}
                      style={{
                        opacity: highlight.opacity,
                        transition: 'opacity 0.15s ease, fill 0.15s ease',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                      }}
                      onMouseEnter={(e) => handleLinkMouseEnter(e, link)}
                      onMouseMove={handleLinkMouseMove}
                      onMouseLeave={handleLinkMouseLeave}
                    />

                    {/* 2. Extra Invisible Centerline Hitbox for thin ribbons */}
                    <path
                      d={getCenterlinePath(link.x0, link.y0, link.h0, link.x1, link.y1, link.h1)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={Math.max(link.h0 + 12, 28)}
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onMouseEnter={(e) => handleLinkMouseEnter(e, link)}
                      onMouseMove={handleLinkMouseMove}
                      onMouseLeave={handleLinkMouseLeave}
                    />
                  </g>
                );
              })}
            </g>

            {/* Nodes Group */}
            <g className="sankey-nodes">
              {layout.layoutNodes.map((node) => {
                const nodeWidth = 14;
                const highlight = getNodeHighlight(node.id);

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onMouseEnter={(e) => handleNodeMouseEnter(e, node)}
                    onMouseMove={handleNodeMouseMove}
                    onMouseLeave={handleNodeMouseLeave}
                  >
                    {/* Generous Invisible Hover Hitbox around node (minimum 24px tall) */}
                    <rect
                      x={node.x - 6}
                      y={node.y - Math.max((24 - node.h) / 2, 4)}
                      width={nodeWidth + 12}
                      height={Math.max(node.h + 8, 24)}
                      fill="transparent"
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    />

                    {/* Visible Node Bar */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={nodeWidth}
                      height={node.h}
                      fill={node.color}
                      rx={Math.min(node.h / 2, 3)}
                      style={{
                        opacity: highlight.opacity,
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        filter: highlight.isHighlighted ? `drop-shadow(0 0 6px ${node.color}80)` : 'none',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                      }}
                    />

                    {/* Node Labels */}
                    <text
                      x={
                        node.column === 0
                          ? node.x - 12
                          : node.column === 3
                            ? node.x + nodeWidth + 12
                            : node.column === 1
                              ? node.x + nodeWidth / 2
                              : node.id === 'opex' && showOpexBreakdown
                                ? node.x - 12
                                : node.x + nodeWidth + 12
                      }
                      y={
                        node.column === 1
                          ? node.y - 8
                          : node.h < 18
                            ? node.y + node.h / 2 - 3
                            : node.y + node.h / 2 + 4
                      }
                      textAnchor={
                        node.column === 0
                          ? 'end'
                          : node.column === 3
                            ? 'start'
                            : node.column === 1
                              ? 'middle'
                              : node.id === 'opex' && showOpexBreakdown
                                ? 'end'
                                : 'start'
                      }
                      className={`text-[12px] font-semibold tracking-wide fill-slate-700 dark:fill-slate-300 transition-all duration-200 select-none cursor-pointer ${highlight.isHighlighted ? 'fill-slate-950 font-bold dark:fill-slate-100 text-xs' : 'opacity-90'
                        }`}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {node.label}
                    </text>

                    {/* Node value label */}
                    <text
                      x={
                        node.column === 0
                          ? node.x - 12
                          : node.column === 3
                            ? node.x + nodeWidth + 12
                            : node.column === 1
                              ? node.x + nodeWidth / 2
                              : node.id === 'opex' && showOpexBreakdown
                                ? node.x - 12
                                : node.x + nodeWidth + 12
                      }
                      y={
                        node.column === 1
                          ? node.y + node.h + 14
                          : node.h < 18
                            ? node.y + node.h / 2 + 10
                            : node.y + node.h / 2 + 17
                      }
                      textAnchor={
                        node.column === 0
                          ? 'end'
                          : node.column === 3
                            ? 'start'
                            : node.column === 1
                              ? 'middle'
                              : node.id === 'opex' && showOpexBreakdown
                                ? 'end'
                                : 'start'
                      }
                      className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400 transition-opacity duration-200 select-none font-bold cursor-pointer"
                      style={{ opacity: highlight.opacity, pointerEvents: 'auto' }}
                    >
                      {formatCurrency(node.value)}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Tooltip positioned precisely inside container */}
          {tooltip.show && (
            <div
              className="absolute z-30 pointer-events-none bg-white/95 border border-slate-200 dark:bg-slate-950/95 dark:border-slate-800/80 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-[280px] transition-transform duration-75 text-slate-900 dark:text-slate-200"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
              }}
              id="sankey-tooltip"
            >
              {tooltip.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
