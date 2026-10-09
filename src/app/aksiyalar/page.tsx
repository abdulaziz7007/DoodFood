import type { Metadata } from "next";
import Deals from "@/components/Deals";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Aksiyalar — DoodFood" };

export default function Page() {
  const { products } = readDB();
  const deals = products
    .filter((p) => p.active && p.oldPrice && p.oldPrice > p.price);
  const sorted = [...deals].sort((a, b) => 1 - b.price / b.oldPrice! - (1 - a.price / a.oldPrice!));
  return <Deals deals={sorted} hero={sorted[0]} />;
}
