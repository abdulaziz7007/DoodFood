import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { getUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const last9 = u.phone.slice(-9);
  const orders = (await readDB()).orders.filter((o) => o.userId === u.id || o.phone.replace(/\D/g, "").slice(-9) === last9).reverse();
  return NextResponse.json(orders);
}
