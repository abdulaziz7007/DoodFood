import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";

const kinds = ["categories", "products", "banners"] as const;
type Kind = (typeof kinds)[number];
type P = { params: Promise<{ kind: string; id: string }> };

export async function PUT(req: Request, { params }: P) {
  const { kind, id } = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kinds.includes(kind as Kind)) return NextResponse.json({ error: "bad kind" }, { status: 404 });
  const db = (await readDB());
  const list = db[kind as Kind] as { id: string }[];
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  list[i] = { ...list[i], ...(await req.json()), id };
  await writeDB(db);
  return NextResponse.json(list[i]);
}

export async function DELETE(_: Request, { params }: P) {
  const { kind, id } = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!kinds.includes(kind as Kind)) return NextResponse.json({ error: "bad kind" }, { status: 404 });
  const db = (await readDB());
  if (kind === "categories") db.products = db.products.filter((p) => p.categoryId !== id);
  (db as unknown as Record<string, { id: string }[]>)[kind] = (db[kind as Kind] as { id: string }[]).filter((x) => x.id !== id);
  await writeDB(db);
  return NextResponse.json({ ok: true });
}
