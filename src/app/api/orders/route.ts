import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readDB, uid, writeDB } from "@/lib/db";
import type { Order } from "@/lib/types";
import { promoPercent } from "@/lib/promo";
import { getUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json([...readDB().orders].reverse());
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = readDB();
  const items = (body.items as { productId: string; qty: number }[] | undefined)?.flatMap((i) => {
    const p = db.products.find((x) => x.id === i.productId && x.active);
    return p && i.qty > 0 ? [{ productId: p.id, name: p.name, price: p.price, qty: Math.min(99, Math.floor(i.qty)) }] : [];
  });
  if (!items?.length || !body.name?.trim() || !body.phone?.trim() || !body.address?.trim())
    return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const percent = promoPercent(body.promo);
  const discount = Math.round((sub * percent) / 100);
  const user = await getUser();
  const order: Order = {
    id: uid(),
    number: ++db.seq,
    createdAt: new Date().toISOString(),
    name: String(body.name).slice(0, 80),
    phone: String(body.phone).slice(0, 30),
    address: String(body.address).slice(0, 200),
    comment: String(body.comment || "").slice(0, 300),
    items,
    total: sub - discount,
    userId: user?.id,
    promo: percent ? String(body.promo).trim().toUpperCase() : undefined,
    discount: discount || undefined,
    status: "new",
  };
  db.orders.push(order);
  writeDB(db);
  return NextResponse.json({ number: order.number, total: order.total });
}
