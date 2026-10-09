import type { Metadata } from "next";
import Branches from "@/components/Branches";

export const metadata: Metadata = { title: "Filiallar — DoodFood" };

export default function Page() {
  return <Branches />;
}
