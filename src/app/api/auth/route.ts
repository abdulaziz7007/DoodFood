import { NextResponse } from "next/server";
import { checkPassword, isAdmin, sign } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ admin: await isAdmin() });
}
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!checkPassword(password)) return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
  const res = NextResponse.json({ admin: true });
  res.cookies.set("admin", sign(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ admin: false });
  res.cookies.delete("admin");
  return res;
}
