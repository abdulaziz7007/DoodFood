import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getUser, hashPassword, publicUser, verifyPassword } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getUser();
  return NextResponse.json({ user: u ? publicUser(u) : null });
}

export async function PUT(req: Request) {
  const me = await getUser();
  if (!me) return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 });
  const body = await req.json();
  const db = (await readDB());
  const u = db.users!.find((x) => x.id === me.id)!;
  if (typeof body.name === "string" && body.name.trim()) u.name = body.name.trim().slice(0, 60);
  if (typeof body.address === "string") u.address = body.address.trim().slice(0, 200);
  if (body.newPassword) {
    if (String(body.newPassword).length < 6) return NextResponse.json({ error: "Yangi parol kamida 6 belgi bo'lsin" }, { status: 400 });
    if (!verifyPassword(String(body.currentPassword || ""), u.pass)) return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 400 });
    u.pass = hashPassword(String(body.newPassword));
  }
  await writeDB(db);
  return NextResponse.json({ user: publicUser(u) });
}
