import Storefront from "@/components/Storefront";
import { readDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const { categories, products, banners } = readDB();
  return (
    <Storefront
      categories={[...categories].sort((a, b) => a.order - b.order)}
      products={products.filter((p) => p.active)}
      banners={banners.filter((b) => b.active)}
    />
  );
}
