import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { cookieOpts, makeToken, normalizePhone, publicUser, verifyPassword } from "@/lib/userAuth";

export async function POST(req: Request) {
  const b = await req.json();
  const phone = normalizePhone(b.phone);
  const u = (readDB().users ?? []).find((x) => x.phone === phone);
  if (!u || !verifyPassword(String(b.password || ""), u.pass)) return NextResponse.json({ error: "Telefon yoki parol noto'g'ri" }, { status: 401 });
  const res = NextResponse.json({ user: publicUser(u) });
  res.cookies.set("user", makeToken(u.id), cookieOpts);
  return res;
}
