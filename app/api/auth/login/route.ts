import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/db";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth";
import { AuthUser, LoginApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, rememberMe } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json<LoginApiResponse>(
        { success: false, error: "กรุณากรอกชื่อผู้ใช้ (Username)" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json<LoginApiResponse>(
        { success: false, error: "กรุณากรอกรหัสผ่าน (Password)" },
        { status: 400 }
      );
    }

    const { user, error } = await authenticateUser(username.trim(), password);

    if (error) {
      console.error("Authentication error from DB:", error);
      return NextResponse.json<LoginApiResponse>(
        { success: false, error: `ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ${error}` },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json<LoginApiResponse>(
        { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const authUser: AuthUser = {
      username: String(user.SUser),
      name: (user.Em_Fullname as string) || (user.SName as string) || (user.Name as string) || String(user.SUser),
      role: (user.Status as string) || (user.SRole as string) || (user.Role as string) || undefined,
    };

    // If rememberMe is checked, keep session for 30 days; otherwise 1 day
    const sessionMaxAge = Boolean(rememberMe) ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 1;
    const token = await createSessionToken(authUser, sessionMaxAge);
    const cookieOptions = getSessionCookieOptions(sessionMaxAge);

    const response = NextResponse.json<LoginApiResponse>({
      success: true,
      user: authUser,
    });

    response.cookies.set({
      ...cookieOptions,
      value: token,
    });

    return response;
  } catch (err: unknown) {
    console.error("Login API Exception:", err);
    return NextResponse.json<LoginApiResponse>(
      {
        success: false,
        error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      },
      { status: 500 }
    );
  }
}
