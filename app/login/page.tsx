"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const initialUsername = searchParams.get("username") || "";
  const initialPassword = searchParams.get("password") || "";

  const [username, setUsername] = React.useState(initialUsername);
  const [password, setPassword] = React.useState(initialPassword);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const mounted = React.useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : false;

  // Load remembered username from localStorage on mount
  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ubonrr_remember_username");
      if (savedUser && !initialUsername) {
        setUsername(savedUser);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage unavailable
    }
  }, [initialUsername]);

  // Auto-login if both username and password are provided in URL query parameters
  const autoLoginAttempted = React.useRef(false);
  React.useEffect(() => {
    if (initialUsername && !username) setUsername(initialUsername);
    if (initialPassword && !password) setPassword(initialPassword);

    if (
      initialUsername &&
      initialPassword &&
      !autoLoginAttempted.current &&
      !isAuthenticated &&
      !isAuthLoading
    ) {
      autoLoginAttempted.current = true;
      const doAutoLogin = async () => {
        setIsSubmitting(true);
        try {
          const res = await login(initialUsername.trim(), initialPassword, true);
          if (res.success) {
            const redirectUrl = searchParams.get("redirect") || "/overview";
            window.location.href = redirectUrl;
          } else {
            setErrorMessage(res.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
          }
        } catch (err: unknown) {
          setErrorMessage(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์"
          );
        } finally {
          setIsSubmitting(false);
        }
      };
      doAutoLogin();
    }
  }, [initialUsername, initialPassword, isAuthenticated, isAuthLoading, login, searchParams, username, password]);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || "/overview";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    if (!password) {
      setErrorMessage("กรุณากรอกรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save or remove remembered username
      try {
        if (rememberMe) {
          localStorage.setItem("ubonrr_remember_username", username.trim());
        } else {
          localStorage.removeItem("ubonrr_remember_username");
        }
      } catch {
        // Ignore localStorage error
      }

      const res = await login(username.trim(), password, rememberMe);

      if (res.success) {
        const redirectUrl = searchParams.get("redirect") || "/overview";
        window.location.href = redirectUrl;
      } else {
        setErrorMessage(res.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 transition-colors duration-300 dark:bg-slate-950 sm:px-6 lg:px-8 font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#881224]/10 blur-3xl dark:bg-[#881224]/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#881224]/10 blur-3xl dark:bg-[#881224]/15" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#881224]/5 blur-3xl dark:bg-[#881224]/10" />

      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            className="group h-9 w-9 rounded-full border-slate-200/90 bg-white/90 shadow-xs backdrop-blur-md transition-all duration-200 hover:bg-slate-100 hover:scale-105 active:scale-95 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-800 cursor-pointer"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 dark:text-white transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </Button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-slate-800/90 dark:bg-slate-900/90 sm:p-10">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-none">
              <img
                src="/UbonRR_Logo.png"
                alt="UbonRR Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              UbonRR Dashboard
            </h1>
            <p className="mt-1 text-xs font-semibold tracking-wide text-[#881224] dark:text-[#d12d46] uppercase">
              Financial Analytics
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              เข้าสู่ระบบ
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-50/80 p-3.5 text-xs text-red-700 backdrop-blur-xs transition-all animate-in fade-in-50 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 pl-1"
              >
                ชื่อผู้ใช้
              </label>
              <div className="relative rounded-full shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={isSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  className="block w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#881224] focus:ring-2 focus:ring-[#881224]/20 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 pl-1"
              >
                รหัสผ่าน
              </label>
              <div className="relative rounded-full shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="block w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-11 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#881224] focus:ring-2 focus:ring-[#881224]/20 focus:outline-none dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-100 sm:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5 px-1">
              <label
                htmlFor="remember-me"
                className="group inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="sr-only peer"
                  />
                  <div
                    className={cn(
                      "flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-all duration-200 shadow-2xs cursor-pointer",
                      rememberMe
                        ? "border-[#881224] bg-[#881224] text-white shadow-xs shadow-[#881224]/30"
                        : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-slate-600",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-[#881224]/30"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-2.5 w-2.5 transition-transform duration-150 stroke-[3]",
                        rememberMe ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                    />
                  </div>
                </div>
                <span>จดจำการเข้าสู่ระบบ (Remember Me)</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#881224] text-sm font-bold text-white shadow-lg shadow-[#881224]/25 transition-all duration-200 hover:bg-[#720e1e] hover:shadow-[#881224]/35 focus:outline-none focus:ring-2 focus:ring-[#881224] focus:ring-offset-2 disabled:opacity-60 cursor-pointer dark:bg-[#881224] dark:hover:bg-[#720e1e]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>กำลังตรวจสอบสิทธิ์...</span>
                  </>
                ) : (
                  <span>เข้าสู่ระบบ</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
