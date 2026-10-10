<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ubon Ruampaet (UbonRR) Data Analytics Dashboard — Agent Guidelines

This repository contains the executive data analytics dashboard for Ubon Ruampaet (อุบลรวมแพทย์), visualizing hospital and wholesale/retail pharmacy financial analytics, revenue pipelines, COGS, operating expenses, and net profit flows.

---

## 1. Technology Stack & Framework Rules

- **Framework**: Next.js 16.3.4 with Turbopack (App Router).
- **React**: React 19.2.8 (`"use client"` on interactive components).
- **Styling**: Tailwind CSS v4 + Vanilla CSS utilities (`cn` with `clsx` and `tailwind-merge`).
- **Icons**: `lucide-react`.
- **Charts**: `recharts` 3.10.1 + Custom SVG implementations (Sankey Diagram).
- **Database**: Microsoft SQL Server via `mssql` (with connection pooling in `lib/db.ts`).
- **Deployment / Web Server**: Node.js on Windows Server behind IIS ARR Reverse Proxy (`web.config`, `https://testproject.hengcomp.com`).

---

## 2. Core Project Architecture & Routes

| Route | Main Component | Data Sources (APIs) | Description |
| :--- | :--- | :--- | :--- |
| `/overview` (or `/`) | `components/KPICards.tsx` | `/api/dashboard` | Executive KPI Summary cards and sparklines |
| `/revenue` | `components/RevenueSplitChart.tsx` | `/api/revenue/wholesale`, `/api/revenue/retail` | Monthly revenue stacked area and Wholesale vs Retail split |
| `/expenses` | `components/ExpenseDrilldown.tsx` | `/api/operating-expenses`, `/api/expenses/detail` | Interactive categorized expense donut, ranked bar chart, item table |
| `/sankey` | `components/SankeyDiagram.tsx` | `/api/revenue/wholesale`, `/api/revenue/retail`, `/api/cogs`, `/api/operating-expenses`, `/api/expenses/detail` | Strict mathematical financial flow diagram (Revenue ➔ COGS/OPEX ➔ Net Profit) |
| `/table` | `components/MonthlySummaryTable.tsx` | `/api/dashboard` | Tabular monthly financial comparison |
| `/login` | `app/login/page.tsx` | `/api/auth/login` | Authentication portal |

---

## 3. Design System & UX Standards

### 3.1 Brand Identity
- **Primary Brand Color**: `#881224` (Ubon Ruampaet Crimson / Burgundy).
  - Used on active buttons, active picker highlights, badge indicators, and primary action states.
- **Theme Support**: Dual-mode (Light and Dark) via `next-themes`.
  - Dark mode surfaces: `dark:bg-slate-900`, `dark:border-slate-800`.
  - Light mode surfaces: `bg-white`, `border-slate-200`.

### 3.2 Recharts 3.x Implementation Rules
- **Do NOT use deprecated `activeIndex` or `activeShape` props on `<Pie>`**:
  In Recharts 3.x, use the `shape` prop on `<Pie shape={renderSector} />` to fully control active and inactive sectors without TypeScript errors.
- **Active Sector Border Highlights (ตามสัดส่วน)**:
  - Selected sector renders with `Sector`:
    - `stroke="currentColor"`
    - `strokeWidth={3.5}`
    - `className="text-slate-950 dark:text-white"`
    - `style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))" }}`
    - `outerRadius={outerRadius + 8}`, `innerRadius={Math.max(0, innerRadius - 2)}`
  - Center hole displays segment title and percentage formatted with brand accent.
  - Non-selected sectors dim to `opacity: 0.3`.
- **Bar & Composed Charts**:
  - Selected month/category bars receive `stroke="currentColor"`, `strokeWidth={2.5}`, and other bars dim to `opacity: 0.25`.
- **Sankey Diagram**:
  - Strictly follows mathematical financial proportions (`Math.max((val / totalInflow) * totalNodeH, 2.5)`).
  - Minimum 24px invisible hitboxes (`pointerEvents: 'auto'`) ensure easy hover and click on thin bars.
  - Persistent selection outline (`strokeWidth={2.5}`, `text-slate-950 dark:text-white`) with drop-shadow and dimming of unrelated links down to `opacity: 0.08`.

---

## 4. Development & Process Guidelines

1. **Port 3000 Hygiene**:
   - The user runs `npm run start` or `npm run dev` in their own terminal.
   - **Never run a persistent daemon `npm run start` in the background** with `run_command` that locks port 3000, as this triggers `Error: listen EADDRINUSE: address already in use :::3000`.
   - If port 3000 is occupied by a stale process during testing, free it before completing the turn.
2. **Build Verification**:
   - Always run `npm run build` after modifying components or APIs. Ensure **0 TypeScript errors** and clean static/dynamic page generation.
3. **Logo & Favicon**:
   - Logo assets reside in `public/UbonRR_Logo.png` and `public/icon.png`. Tab browser icon is declared in `app/layout.tsx`.

