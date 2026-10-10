import * as React from "react";
import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "UbonRR - Financial Analytics",
  description: "Executive sales, revenue, cost, and operating expenses dashboard powered by SQL Server analytics.",
  icons: {
    icon: [
      { url: "/UbonRR_Logo.png", type: "image/png" },
    ],
    shortcut: "/UbonRR_Logo.png",
    apple: "/UbonRR_Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${prompt.variable} antialiased`}
    >
      <body className={`${prompt.className} min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50 font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <React.Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              }
            >
              <DashboardProvider>
                <AppShell>{children}</AppShell>
              </DashboardProvider>
            </React.Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
