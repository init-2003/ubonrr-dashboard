export interface VWholesaleRevenue {
  YearSale: number;
  MonthSale: number;
  WholesaleRevenue: number;
  [key: string]: unknown;
}

export interface VRetailRevenue {
  YearSale: number;
  MonthSale: number;
  RetailRevenue: number;
  [key: string]: unknown;
}

export interface VCOGS {
  YearSale: number;
  MonthSale: number;
  COGS: number;
  [key: string]: unknown;
}

export interface VOperatingExpenses {
  YearSale: number;
  MonthSale: number;
  OperatingExpenses: number;
  [key: string]: unknown;
}

export interface VSalesDashboard {
  YearSale: number;
  MonthSale: number;
  WholesaleRevenue: number;
  RetailRevenue: number;
  COGS: number;
  OperatingExpenses: number;
}

export interface VOperatingExpensesDetail {
  YearSale: number;
  MonthSale: number;
  Ex_ID?: number | string;
  Expense_Type_Name?: string;
  Ex_Type?: string;
  Ex_Name?: string;
  Ex_Detail?: string;
  Ex_Price: number;
  Ex_Date?: string | Date;
  [key: string]: unknown;
}

// Calculated & Processed Dashboard Data
export interface MonthlyAnalyticsData {
  YearSale: number;
  MonthSale: number;
  MonthName: string;
  MonthFullName: string;
  WholesaleRevenue: number;
  RetailRevenue: number;
  TotalRevenue: number;
  COGS: number;
  OperatingExpenses: number;
  TotalCostAndExpense: number;
  GrossProfit: number;
  NetProfit: number;
  GrossMarginPercent: number;
  NetMarginPercent: number;
  WholesaleSharePercent: number;
  RetailSharePercent: number;
}

export interface ExecutiveKPISummary {
  totalRevenue: number;
  wholesaleRevenue: number;
  retailRevenue: number;
  cogs: number;
  operatingExpenses: number;
  grossProfit: number;
  netProfit: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  cogsRatioPercent: number;
  opexRatioPercent: number;
  wholesalePercent: number;
  retailPercent: number;
  bestMonth: {
    monthSale: number;
    monthName: string;
    revenue: number;
    netProfit: number;
  } | null;
  lowestMonth: {
    monthSale: number;
    monthName: string;
    revenue: number;
    netProfit: number;
  } | null;
}

export interface DashboardApiResponse {
  year: number;
  availableYears: number[];
  summary: ExecutiveKPISummary;
  monthlyData: MonthlyAnalyticsData[];
  dataSource?: "database";
  databaseError?: string | null;
}

export interface ExpenseDetailApiResponse {
  year: number;
  month: number | null;
  totalExpenses: number;
  items: VOperatingExpensesDetail[];
  categories: {
    category: string;
    total: number;
    percentage: number;
  }[];
  dataSource?: "database";
  databaseError?: string | null;
}

export interface COGSApiResponse {
  year: number;
  month: number | null;
  totalCOGS: number;
  data: VCOGS[];
  dataSource?: "database";
  databaseError?: string | null;
}

export interface RetailRevenueApiResponse {
  year: number;
  month: number | null;
  totalRetailRevenue: number;
  data: VRetailRevenue[];
  dataSource?: "database";
  databaseError?: string | null;
}

export interface WholesaleRevenueApiResponse {
  year: number;
  month: number | null;
  totalWholesaleRevenue: number;
  data: VWholesaleRevenue[];
  dataSource?: "database";
  databaseError?: string | null;
}

export interface OperatingExpensesApiResponse {
  year: number;
  month: number | null;
  totalOperatingExpenses: number;
  data: VOperatingExpenses[];
  dataSource?: "database";
  databaseError?: string | null;
}

export interface DynamicExpenseCategory {
  category: string;
  total: number;
  percentage?: number;
}

export interface FinancialData {
  wholesaleRevenue: number;
  retailRevenue: number;
  cogs: number;
  operatingExpenses?: number;
  expenseCategories?: DynamicExpenseCategory[];
  tax?: number;
}

export interface SankeyNode {
  id: string;
  label: string;
  color: string;
  column: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

// Authentication Types (System_Access table)
export interface SystemAccessUser {
  SUser: string;
  SPass?: string;
  SName?: string;
  SRole?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  username: string;
  name?: string;
  role?: string;
}

export interface LoginApiResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}
