import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: P) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const db = readDB();
  const o = db.orders.find((x) => x.id === id);
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  o.status = status;
  writeDB(db);
  return NextResponse.json(o);
}

export async function DELETE(_: Request, { params }: P) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = readDB();
  db.orders = db.orders.filter((x) => x.id !== id);
  writeDB(db);
  return NextResponse.json({ ok: true });
}
