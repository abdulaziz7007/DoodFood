"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteFooter, SiteHeader, PageTitle } from "./SiteShell";

type Seg = { label: string; code?: string; color: string; weight: number };
const segs: Seg[] = [
  { label: "5%", code: "DOOD5", color: "#ff8a3d", weight: 30 },
  { label: "Yana", color: "#2b2b33", weight: 15 },
  { label: "10%", code: "DOOD10", color: "#f0432d", weight: 25 },
  { label: "15%", code: "DOOD15", color: "#e0245e", weight: 10 },
  { label: "5%", code: "DOOD5", color: "#ffb020", weight: 30 },
  { label: "Yana", color: "#2b2b33", weight: 15 },
  { label: "20%", code: "LAVASH20", color: "#8b2fe0", weight: 4 },
  { label: "10%", code: "DOOD10", color: "#f0432d", weight: 25 },
];
const N = segs.length, A = 360 / N, R = 150;
const pt = (a: number, r = R) => [R + r * Math.sin((a * Math.PI) / 180), R - r * Math.cos((a * Math.PI) / 180)];
const today = () => new Date().toISOString().slice(0, 10);

export default function Wheel() {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Seg | null>(null);
  const [used, setUsed] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setUsed(localStorage.getItem("spinDate") === today());
      setSaved(localStorage.getItem("promo"));
    } catch {}
  }, []);

  const spin = () => {
    if (spinning || used) return;
    const total = segs.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total, idx = 0;
    for (; idx < N; idx++) { r -= segs[idx].weight; if (r <= 0) break; }
    idx = Math.min(idx, N - 1);
    const jitter = (Math.random() - 0.5) * (A * 0.7);
    const target = 360 * 6 + (360 - (idx * A + A / 2)) + jitter;
    setSpinning(true);
    setRot((cur) => cur - (cur % 360) + target);
    setTimeout(() => {
      setSpinning(false);
      setResult(segs[idx]);
      if (segs[idx].code) {
        try { localStorage.setItem("promo", segs[idx].code!); localStorage.setItem("spinDate", today()); } catch {}
        setSaved(segs[idx].code!); setUsed(true);
      } else {
        // "Yana" gives one more try today: do not lock
      }
    }, 5200);
  };

  const copy = async (c: string) => {
    try { await navigator.clipboard.writeText(c); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <SiteHeader />
      <PageTitle emoji="🎡" title="Omad g'ildiragi" sub="Kuniga bir marta aylantiring va buyurtmangiz uchun chegirma promo-kodini yuting." />
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 text-4xl drop-shadow-lg">🔻</div>
          <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 opacity-30 blur-2xl" />
          <motion.svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="relative w-full rounded-full bg-white p-2 shadow-2xl ring-8 ring-ink/90"
            animate={{ rotate: rot }} transition={{ duration: spinning ? 5 : 0, ease: [0.12, 0.7, 0.1, 1] }}>
            {segs.map((s, i) => {
              const [x1, y1] = pt(i * A), [x2, y2] = pt((i + 1) * A);
              const [tx, ty] = pt(i * A + A / 2, R * 0.66);
              return (
                <g key={i}>
                  <path d={`M${R} ${R} L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={s.color} stroke="#fff" strokeWidth="2" />
                  <text x={tx} y={ty} fill="#fff" fontSize="22" fontWeight="800" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * A + A / 2} ${tx} ${ty})`}>{s.label}</text>
                </g>
              );
            })}
            <circle cx={R} cy={R} r="26" fill="#111114" stroke="#fff" strokeWidth="4" />
            <text x={R} y={R} fill="#fff" fontSize="18" textAnchor="middle" dominantBaseline="middle">🌯</text>
          </motion.svg>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{used ? "Bugungi urinish ishlatildi" : "Omadingizni sinang!"}</h2>
          <p className="mt-2 text-black/50">Yutuq promo-koding buyurtma berish oynasida o&apos;zi paydo bo&apos;ladi. Ertaga yana urinib ko&apos;rishingiz mumkin.</p>
          <motion.button whileTap={{ scale: 0.95 }} disabled={spinning || used} onClick={spin}
            className="shine mt-6 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-10 py-4 text-lg font-extrabold text-white shadow-xl shadow-rose-500/30 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100">
            {spinning ? "Aylanmoqda…" : used ? "Ertaga qaytib keling" : "Aylantirish"}
          </motion.button>
          {saved && (
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div><div className="text-xs font-bold text-black/40">SIZNING PROMO-KODINGIZ</div><div className="text-2xl font-extrabold tracking-wider text-brand">{saved}</div></div>
              <button onClick={() => copy(saved)} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">{copied ? "✓ Nusxalandi" : "Nusxalash"}</button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResult(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.6, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl">
              <div className="text-7xl">{result.code ? "🎉" : "🔁"}</div>
              <h3 className="mt-3 text-2xl font-extrabold">{result.code ? `${result.label} chegirma yutdingiz!` : "Yana bir urinish!"}</h3>
              {result.code ? <p className="mt-2 text-black/55">Promo-kod: <b className="text-brand">{result.code}</b><br />Buyurtma berishda avtomatik qo&apos;llanadi.</p> : <p className="mt-2 text-black/55">Bu safar yutuq yo&apos;q, lekin yana aylantirishingiz mumkin.</p>}
              <button onClick={() => setResult(null)} className="mt-6 w-full rounded-2xl bg-ink py-3.5 font-bold text-white">Zo&apos;r</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SiteFooter />
    </>
  );
}
