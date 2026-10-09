"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Product } from "@/lib/types";
import { SiteFooter, SiteHeader, PageTitle } from "./SiteShell";
import MiniCard from "./MiniCard";

const steps = [
  { q: "Hozir qanday kayfiyatdasiz?", key: "mood", opts: [
    { v: "light", e: "🥨", t: "Yengil gazak", d: "Tez, kichik" },
    { v: "lunch", e: "🌯", t: "To'yimli tushlik", d: "Qorin to'ysin" },
    { v: "share", e: "🍕", t: "Hamma bilan baham", d: "Oila yoki do'stlar" },
    { v: "sweet", e: "🍩", t: "Shirin va salqin", d: "Desert, ichimlik" },
  ] },
  { q: "Qaysi ta'm yoqadi?", key: "taste", opts: [
    { v: "chicken", e: "🍗", t: "Tovuq", d: "" },
    { v: "beef", e: "🥩", t: "Go'sht", d: "" },
    { v: "cheese", e: "🧀", t: "Pishloqli", d: "" },
    { v: "any", e: "🎲", t: "Farqi yo'q", d: "" },
  ] },
  { q: "Byudjet (bir kishi uchun)?", key: "budget", opts: [
    { v: "30", e: "💸", t: "30 000 gacha", d: "" },
    { v: "60", e: "💵", t: "60 000 gacha", d: "" },
    { v: "999", e: "💎", t: "Cheklovsiz", d: "" },
  ] },
] as const;

const moodCats: Record<string, string[]> = {
  light: ["Gazaklar", "Salatlar", "Hot-doglar", "Burgerlar"],
  lunch: ["Lavash", "Tovuqli yangiliklar", "Donerlar", "Burgerlar"],
  share: ["Katta pitsalar", "Foydali setlar"],
  sweet: ["Desertlar", "Limonadlar", "Ichimliklar"],
};
const tasteRe: Record<string, RegExp> = { chicken: /tovuq|nagets|strips|longer/i, beef: /mol|go'sht|doner|big|burger|gamburger/i, cheese: /pishloq|chizburger/i, any: /./ };

export default function Quiz({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  const results = useMemo(() => {
    if (step < steps.length) return [];
    const max = Number(ans.budget || 999) * 1000;
    const cats = moodCats[ans.mood] || [];
    const re = tasteRe[ans.taste] || /./;
    return products
      .filter((p) => p.price <= max && cats.includes(catName[p.categoryId]))
      .map((p) => ({ p, s: (re.test(p.name) ? 3 : 0) + (ans.taste === "any" ? 0 : 0) + (p.oldPrice ? 1 : 0) + Math.random() * 1.5 - Math.abs(p.price - max * 0.7) / max }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.p);
  }, [step, ans, products, catName]);

  const pick = (key: string, v: string) => { setAns((a) => ({ ...a, [key]: v })); setStep((s) => s + 1); };
  const cur = steps[step];

  return (
    <>
      <SiteHeader />
      <PageTitle emoji="🤔" title="Nima yeyman?" sub="3 ta savolga javob bering — biz sizga mos taomlarni tanlab beramiz." />
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500" initial={false} animate={{ width: step > i ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {cur ? (
            <motion.div key={step} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35 }}>
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight">{cur.q}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {cur.opts.map((o, i) => (
                  <motion.button key={o.v} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => pick(cur.key, o.v)} className="flex items-center gap-4 rounded-3xl bg-white p-5 text-left shadow-[0_8px_24px_-8px_rgba(17,17,20,.14)] ring-1 ring-black/[.04] transition hover:ring-brand/40">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-3xl">{o.e}</span>
                    <span><span className="block text-lg font-extrabold">{o.t}</span>{o.d && <span className="text-sm text-black/45">{o.d}</span>}</span>
                  </motion.button>
                ))}
              </div>
              {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-sm font-semibold text-black/45 hover:text-ink">← Orqaga</button>}
            </motion.div>
          ) : (
            <motion.div key="res" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl font-extrabold tracking-tight">Sizga mos taomlar ✨</h2>
              <p className="mb-6 mt-1 text-black/50">Tanlovingizga qarab tavsiya qildik.</p>
              {results.length === 0 ? <p className="rounded-3xl bg-white p-8 text-center text-black/50">Mos taom topilmadi. Byudjetni oshirib ko&apos;ring.</p> : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {results.map((p, i) => <MiniCard key={p.id} p={p} i={i} badge={i === 0 ? "⭐ Eng mos" : undefined} />)}
                </div>
              )}
              <div className="mt-8 flex gap-3">
                <button onClick={() => { setStep(0); setAns({}); }} className="rounded-full bg-white px-6 py-3 font-bold ring-1 ring-black/10 transition hover:bg-black/5">Qayta urinish</button>
                <a href="/" className="rounded-full bg-ink px-6 py-3 font-bold text-white">Savatga o&apos;tish</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SiteFooter />
    </>
  );
}
