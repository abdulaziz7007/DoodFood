import { NextResponse } from "next/server";
import { promoPercent } from "@/lib/promo";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") || "";
  const percent = promoPercent(code);
  if (!percent) return NextResponse.json({ error: "Promo-kod topilmadi" }, { status: 404 });
  return NextResponse.json({ code: code.trim().toUpperCase(), percent });
}
