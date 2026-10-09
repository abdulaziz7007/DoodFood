"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { SiteFooter, SiteHeader, PageTitle } from "./SiteShell";
import MiniCard from "./MiniCard";
import { addToCart } from "@/lib/cartStore";

function useTimeLeft() {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => { const n = new Date(); const end = new Date(n); end.setHours(23, 59, 59, 999); setT(end.getTime() - n.getTime()); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Deals({ deals, hero }: { deals: Product[]; hero?: Product }) {
  const t = useTimeLeft();
  const parts = t === null ? ["--", "--", "--"] : [Math.floor(t / 3600000), Math.floor(t / 60000) % 60, Math.floor(t / 1000) % 60].map((n) => String(n).padStart(2, "0"));
  const labels = ["soat", "daqiqa", "soniya"];
  return (
    <>
      <SiteHeader />
      <PageTitle emoji="🔥" title="Aksiyalar" sub="Bugungi eng foydali takliflar. Vaqt tugamasidan buyurtma bering!" />
      <div className="mx-auto max-w-7xl px-4">
        {hero && (
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 text-white shadow-2xl shadow-rose-500/20 md:grid-cols-2">
            <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-white/10" />
            <div className="relative z-10 p-8 sm:p-12">
              <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-extrabold backdrop-blur">⚡ KUN TAOMI</span>
              <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{hero.name}</h2>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">{money(hero.price)}</span>
                {hero.oldPrice && <span className="text-lg line-through opacity-60">{money(hero.oldPrice)}</span>}
              </div>
              <div className="mt-7 flex gap-3">
                {parts.map((p, i) => (
                  <div key={i} className="min-w-[4.2rem] rounded-2xl bg-black/20 px-3 py-2.5 text-center backdrop-blur">
                    <motion.div key={p} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl font-extrabold tabular-nums">{p}</motion.div>
                    <div className="text-[11px] font-semibold opacity-70">{labels[i]}</div>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => addToCart(hero.id)} className="mt-8 rounded-full bg-white px-8 py-3.5 font-bold text-rose-600 shadow-lg transition hover:scale-105">Savatga qo&apos;shish</motion.button>
            </div>
            <div className="relative min-h-[16rem]">
              {hero.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }} src={hero.image} alt={hero.name} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover md:[clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]" />
              )}
            </div>
          </motion.section>
        )}

        <h2 className="mb-5 mt-12 text-2xl font-extrabold tracking-tight">Barcha chegirmalar</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {deals.map((p, i) => <MiniCard key={p.id} p={p} i={i} />)}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
