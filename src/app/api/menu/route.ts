import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export async function GET() {
  const { categories, products, banners } = (await readDB());
  return NextResponse.json({
    categories: [...categories].sort((a, b) => a.order - b.order),
    products: products.filter((p) => p.active),
    banners: banners.filter((b) => b.active),
  });
}
