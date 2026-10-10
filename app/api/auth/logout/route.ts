import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieOptions = getSessionCookieOptions(0);

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
