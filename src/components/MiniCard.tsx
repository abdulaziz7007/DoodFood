"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { addToCart } from "@/lib/cartStore";

export default function MiniCard({ p, i = 0, badge }: { p: Product; i?: number; badge?: string }) {
  const [added, setAdded] = useState(0);
  const disc = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -5 }}
      className="group flex flex-col rounded-[1.5rem] bg-white p-2 shadow-[0_8px_24px_-8px_rgba(17,17,20,.12)] ring-1 ring-black/[.04]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-orange-50">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        ) : <div className="grid h-full place-items-center text-6xl">{p.emoji}</div>}
        {(badge || disc > 0) && <span className="absolute left-2.5 top-2.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-extrabold text-brand backdrop-blur">{badge ?? `-${disc}%`}</span>}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug">{p.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <div className="font-extrabold tracking-tight">{money(p.price)}</div>
            {disc > 0 && <div className="text-xs text-black/35 line-through">{money(p.oldPrice!)}</div>}
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAdded(addToCart(p.id))}
            className="relative overflow-hidden rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-black">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="block">
                {added ? `✓ ${added} ta` : "+ Savat"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
