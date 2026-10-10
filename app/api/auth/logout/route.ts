import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol;
  const isHttps = proto === "https" || proto === "https:";
  const cookieOptions = getSessionCookieOptions(0, isHttps);

  const response = NextResponse.json({
    success: true,
    message: "ออกจากระบบเรียบร้อยแล้ว",
  });

  response.cookies.set({
    ...cookieOptions,
    value: "",
    maxAge: 0,
  });

  return response;
}
