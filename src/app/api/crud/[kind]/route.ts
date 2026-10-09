import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDB, uid, writeDB } from "@/lib/db";

const kinds = ["categories", "products", "banners"] as const;
type Kind = (typeof kinds)[number];

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kinds.includes(kind as Kind)) return NextResponse.json({ error: "bad kind" }, { status: 404 });
  return NextResponse.json(readDB()[kind as Kind]);
}

export async function POST(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kinds.includes(kind as Kind)) return NextResponse.json({ error: "bad kind" }, { status: 404 });
  const db = readDB();
  const item = { ...(await req.json()), id: uid() };
  (db[kind as Kind] as unknown[]).push(item);
  writeDB(db);
  return NextResponse.json(item);
}
