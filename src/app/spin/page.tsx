import type { Metadata } from "next";
import Wheel from "@/components/Wheel";

export const metadata: Metadata = { title: "Omad g'ildiragi — DoodFood" };

export default function Page() {
  return <Wheel />;
}
