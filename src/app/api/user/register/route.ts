import { NextResponse } from "next/server";
import { readDB, uid, writeDB } from "@/lib/db";
import { cookieOpts, hashPassword, makeToken, normalizePhone, publicUser } from "@/lib/userAuth";

export async function POST(req: Request) {
  const b = await req.json();
  const name = String(b.name || "").trim().slice(0, 60);
  const phone = normalizePhone(b.phone);
  const password = String(b.password || "");
  if (!name) return NextResponse.json({ error: "Ismingizni kiriting" }, { status: 400 });
  if (!/^998\d{9}$/.test(phone)) return NextResponse.json({ error: "Telefon raqami noto'g'ri (+998 XX XXX XX XX)" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Parol kamida 6 belgi bo'lsin" }, { status: 400 });
  const db = (await readDB());
  db.users ||= [];
  if (db.users.some((u) => u.phone === phone)) return NextResponse.json({ error: "Bu raqam allaqachon ro'yxatdan o'tgan" }, { status: 409 });
  const user = { id: uid(), name, phone, address: String(b.address || "").trim().slice(0, 200), pass: hashPassword(password), createdAt: new Date().toISOString() };
  db.users.push(user);
  await writeDB(db);
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set("user", makeToken(user.id), cookieOpts);
  return res;
}
