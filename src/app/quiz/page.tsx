import type { Metadata } from "next";
import Quiz from "@/components/Quiz";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nima yeyman? — DoodFood" };

export default function Page() {
  const { products, categories } = readDB();
  return <Quiz products={products.filter((p) => p.active)} categories={categories} />;
}
