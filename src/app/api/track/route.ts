import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const number = Number(sp.get("number"));
  const phone = (sp.get("phone") || "").replace(/\D/g, "").slice(-9);
  const o = readDB().orders.find((x) => x.number === number && x.phone.replace(/\D/g, "").slice(-9) === phone && phone.length >= 7);
  if (!o) return NextResponse.json({ error: "Buyurtma topilmadi. Raqam va telefonni tekshiring." }, { status: 404 });
  return NextResponse.json({ number: o.number, status: o.status, createdAt: o.createdAt, total: o.total, discount: o.discount ?? 0, items: o.items.map((i) => ({ name: i.name, qty: i.qty })) });
}
