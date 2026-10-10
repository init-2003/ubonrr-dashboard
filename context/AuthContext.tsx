"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthUser, LoginApiResponse } from "@/lib/types";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  // Load current user from session cookie on mount
  React.useEffect(() => {
    let ignore = false;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to check auth state", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();
    return () => {
      ignore = true;
    };
  }, []);

  const login = async (
    username: string,
    password: string,
    rememberMe?: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data: LoginApiResponse = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      };
    } catch (err: unknown) {
      console.error("Login network error", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย",
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
