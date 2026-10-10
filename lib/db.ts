import sql from "mssql";
import {
  VSalesDashboard,
  VOperatingExpensesDetail,
  VCOGS,
  VRetailRevenue,
  VWholesaleRevenue,
  VOperatingExpenses,
  SystemAccessUser,
} from "./types";

const sqlConfig: sql.config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST as string,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true, // For self-signed certificates in local network
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const pendingPromises = new Map<string, Promise<unknown>>();

export function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 120000,
  forceRefresh: boolean = false
): Promise<T> {
  const now = Date.now();

  if (!forceRefresh) {
    const cached = memoryCache.get(key);
    if (cached && now - cached.timestamp < cached.ttl) {
      return Promise.resolve(cached.data as T);
    }
  }

  if (pendingPromises.has(key)) {
    return pendingPromises.get(key) as Promise<T>;
  }

  const promise = fetcher()
    .then((result) => {
      memoryCache.set(key, { data: result, timestamp: Date.now(), ttl: ttlMs });
      pendingPromises.delete(key);
      return result;
    })
    .catch((err) => {
      pendingPromises.delete(key);
      throw err;
    });

  pendingPromises.set(key, promise);
  return promise;
}

export function clearDbCache() {
  memoryCache.clear();
}

export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig).catch((err) => {
      console.warn("MSSQL Database Connection Warning:", err.message);
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

export async function fetchSalesDashboard(
  year: number,
  forceRefresh: boolean = false
): Promise<{
  data: VSalesDashboard[];
  error?: string | null;
}> {
  const ttl = year >= 2026 ? 120000 : 1800000;
  return getCached(
    `sales_dashboard_${year}`,
    async () => {
      try {
        const pool = await getDbPool();
        const result = await pool
          .request()
          .input("YearSale", sql.Int, year)
          .query<VSalesDashboard>(`
            SELECT 
              CAST(YearSale AS INT) AS YearSale,
              CAST(MonthSale AS INT) AS MonthSale,
              CAST(ISNULL(WholesaleRevenue, 0) AS FLOAT) AS WholesaleRevenue,
              CAST(ISNULL(RetailRevenue, 0) AS FLOAT) AS RetailRevenue,
              CAST(ISNULL(COGS, 0) AS FLOAT) AS COGS,
              CAST(ISNULL(OperatingExpenses, 0) AS FLOAT) AS OperatingExpenses
            FROM V_SalesDashboard
            WHERE YearSale = @YearSale
            ORDER BY MonthSale ASC
          `);

        return {
          data: result.recordset || [],
          error: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Database connection failed";
        console.error("Database error in fetchSalesDashboard:", message);
        return {
          data: [],
          error: message,
        };
      }
    },
    ttl,
    forceRefresh
  );
}

export async function fetchExpenseDetails(
  year: number,
  month?: number | null,
  forceRefresh: boolean = false
): Promise<{
  data: VOperatingExpensesDetail[];
  error?: string | null;
}> {
  const ttl = year >= 2026 ? 120000 : 1800000;
  return getCached(
    `expense_details_${year}_${month ?? "all"}`,
    async () => {
      try {
        const pool = await getDbPool();
        const request = pool.request().input("YearSale", sql.Int, year);
        
        let query = `
          SELECT *
          FROM V_OperatingExpenses_Detail
          WHERE YearSale = @YearSale
        `;

        if (month) {
          request.input("MonthSale", sql.Int, month);
          query += ` AND MonthSale = @MonthSale`;
        }

        query += ` ORDER BY Ex_Price DESC`;

        const result = await request.query<VOperatingExpensesDetail>(query);

        return {
          data: result.recordset || [],
          error: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Database connection failed";
        console.error("Database error in fetchExpenseDetails:", message);
        return {
          data: [],
          error: message,
        };
      }
    },
    ttl,
    forceRefresh
  );
}

export async function fetchCOGS(
  year: number,
  month?: number | null,
  forceRefresh: boolean = false
): Promise<{
  data: VCOGS[];
  error?: string | null;
}> {
  const ttl = year >= 2026 ? 120000 : 1800000;
  return getCached(
    `cogs_${year}_${month ?? "all"}`,
    async () => {
      try {
        const pool = await getDbPool();
        const request = pool.request().input("YearSale", sql.Int, year);
        
        let query = `
          SELECT *
          FROM V_COGS
          WHERE YearSale = @YearSale
        `;

        if (month) {
          request.input("MonthSale", sql.Int, month);
          query += ` AND MonthSale = @MonthSale`;
        }

        query += ` ORDER BY MonthSale ASC`;

        const result = await request.query<VCOGS>(query);

        return {
          data: result.recordset || [],
          error: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Database connection failed";
        console.error("Database error in fetchCOGS:", message);
        return {
          data: [],
          error: message,
        };
      }
    },
    ttl,
    forceRefresh
  );
}

export async function fetchRetailRevenue(
  year: number,
  month?: number | null,
  forceRefresh: boolean = false
): Promise<{
  data: VRetailRevenue[];
  error?: string | null;
}> {
  const ttl = year >= 2026 ? 120000 : 1800000;
  return getCached(
    `retail_${year}_${month ?? "all"}`,
    async () => {
      try {
        const pool = await getDbPool();
        const request = pool.request().input("YearSale", sql.Int, year);
        
        let query = `
          SELECT *
          FROM V_RetailRevenue
          WHERE YearSale = @YearSale
        `;

        if (month) {
          request.input("MonthSale", sql.Int, month);
          query += ` AND MonthSale = @MonthSale`;
        }

        query += ` ORDER BY MonthSale ASC`;

        const result = await request.query<VRetailRevenue>(query);

        return {
          data: result.recordset || [],
          error: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Database connection failed";
        console.error("Database error in fetchRetailRevenue:", message);
        return {
          data: [],
          error: message,
        };
      }
    },
    ttl,
    forceRefresh
  );
}

export async function fetchWholesaleRevenue(
  year: number,
  month?: number | null,
  forceRefresh: boolean = false
): Promise<{
  data: VWholesaleRevenue[];
  error?: string | null;
}> {
  const ttl = year >= 2026 ? 120000 : 1800000;
  return getCached(
    `wholesale_${year}_${month ?? "all"}`,
    async () => {
      try {
        const pool = await getDbPool();
        const request = pool.request().input("YearSale", sql.Int, year);
        
        let query = `
          SELECT *
          FROM V_WholesaleRevenue
          WHERE YearSale = @YearSale
        `;

        if (month) {
          request.input("MonthSale", sql.Int, month);
          query += ` AND MonthSale = @MonthSale`;
        }

        query += ` ORDER BY MonthSale ASC`;

        const result = await request.query<VWholesaleRevenue>(query);

        return {
          data: result.recordset || [],
          error: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Database connection failed";
        console.error("Database error in fetchWholesaleRevenue:", message);
        return {
          data: [],
          error: message,
        };
      }
    },
    ttl,
    forceRefresh
  );
}

export async function fetchOperatingExpenses(
  year: number,
  month?: number | null,
  forceRefresh: boolean = false
): Promise<{
  data: VOperatingExpenses[];
  error?: string | null;
}> {
  const ttl = year >= 2026 ? 120000 : 1800000;
  return getCached(
    `opex_${year}_${month ?? "all"}`,
    async () => {
      try {
        const pool = await getDbPool();
        const request = pool.request().input("YearSale", sql.Int, year);
        
        let query = `
          SELECT *
          FROM V_OperatingExpenses
          WHERE YearSale = @YearSale
        `;

        if (month) {
          request.input("MonthSale", sql.Int, month);
          query += ` AND MonthSale = @MonthSale`;
        }

        query += ` ORDER BY MonthSale ASC`;

        const result = await request.query<VOperatingExpenses>(query);

        return {
          data: result.recordset || [],
          error: null,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Database connection failed";
        console.error("Database error in fetchOperatingExpenses:", message);
        return {
          data: [],
          error: message,
        };
      }
    },
    ttl,
    forceRefresh
  );
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<{
  user: SystemAccessUser | null;
  error?: string | null;
}> {
  try {
    const pool = await getDbPool();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const result = await pool
      .request()
      .input("SUser", sql.NVarChar, cleanUsername)
      .input("SPass", sql.NVarChar, cleanPassword)
      .query<SystemAccessUser>(`
        SELECT TOP 1 *
        FROM System_Access
        WHERE LOWER(RTRIM(LTRIM(SUser))) = LOWER(@SUser)
          AND (RTRIM(LTRIM(SPass)) = @SPass OR SPass = @SPass)
      `);

    const user = result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;

    return {
      user,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database connection failed";
    console.error("Database error in authenticateUser:", message);
    return {
      user: null,
      error: message,
    };
  }
}
