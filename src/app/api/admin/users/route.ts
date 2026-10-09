import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = readDB();
  const list = (db.users ?? []).map((u) => {
    const mine = db.orders.filter((o) => o.userId === u.id && o.status !== "cancelled");
    return { id: u.id, name: u.name, phone: u.phone, address: u.address, createdAt: u.createdAt, orders: mine.length, spent: mine.reduce((s, o) => s + o.total, 0) };
  });
  return NextResponse.json(list.reverse());
}
