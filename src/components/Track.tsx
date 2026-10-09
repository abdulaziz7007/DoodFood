"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { money } from "@/lib/format";
import { SiteFooter, SiteHeader, PageTitle } from "./SiteShell";

type Info = { number: number; status: "new" | "cooking" | "delivering" | "done" | "cancelled"; createdAt: string; total: number; discount: number; items: { name: string; qty: number }[] };
const flow = [
  { s: "new", e: "📝", t: "Qabul qilindi", d: "Buyurtmangiz tizimga tushdi" },
  { s: "cooking", e: "👨‍🍳", t: "Tayyorlanmoqda", d: "Oshpazlarimiz ishga kirishdi" },
  { s: "delivering", e: "🛵", t: "Yo'lda", d: "Kuryer sizga yo'l oldi" },
  { s: "done", e: "✅", t: "Yetkazildi", d: "Yoqimli ishtaha!" },
];

export default function Track() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("+998");
  const [info, setInfo] = useState<Info | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef("");

  const load = useCallback(async (n: string, p: string, quiet = false) => {
    if (!quiet) setBusy(true);
    const r = await fetch(`/api/track?number=${encodeURIComponent(n)}&phone=${encodeURIComponent(p)}`);
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { if (!quiet) { setErr(d.error); setInfo(null); } return; }
    setErr(""); setInfo(d);
  }, []);

  const submit = (e: React.FormEvent) => { e.preventDefault(); key.current = `${number}|${phone}`; load(number, phone); };

  useEffect(() => {
    if (!info) return;
    const id = setInterval(() => load(number, phone, true), 8000);
    return () => clearInterval(id);
  }, [info, number, phone, load]);

  const idx = info ? flow.findIndex((f) => f.s === info.status) : -1;
  const input = "w-full rounded-2xl bg-black/[.045] px-4 py-3.5 font-medium outline-none ring-1 ring-transparent transition placeholder:text-black/35 focus:bg-white focus:ring-brand/60";

  return (
    <>
      <SiteHeader />
      <PageTitle emoji="📦" title="Buyurtmani kuzatish" sub="Buyurtma raqami va telefon raqamingizni kiriting. Holat avtomatik yangilanib turadi." />
      <div className="mx-auto max-w-2xl px-4">
        <form onSubmit={submit} className="grid gap-3 rounded-[2rem] bg-white p-5 shadow-[0_8px_24px_-8px_rgba(17,17,20,.12)] ring-1 ring-black/[.04] sm:grid-cols-[1fr_1.4fr_auto]">
          <input required inputMode="numeric" className={input} placeholder="Buyurtma № (1001)" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))} />
          <input required className={input} placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button disabled={busy} className="rounded-2xl bg-ink px-7 py-3.5 font-bold text-white transition hover:bg-black disabled:opacity-60">{busy ? "…" : "Topish"}</button>
        </form>
        {err && <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{err}</motion.p>}

        <AnimatePresence>
          {info && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-[2rem] bg-white p-6 shadow-[0_8px_24px_-8px_rgba(17,17,20,.12)] ring-1 ring-black/[.04] sm:p-8">
              <div className="flex items-center justify-between">
                <div><div className="text-xs font-bold text-black/40">BUYURTMA</div><div className="text-3xl font-extrabold tracking-tight">#{info.number}</div></div>
                <div className="text-right"><div className="text-xs font-bold text-black/40">JAMI</div><div className="text-xl font-extrabold">{money(info.total)}</div></div>
              </div>

              {info.status === "cancelled" ? (
                <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-center font-bold text-rose-600">❌ Buyurtma bekor qilingan</div>
              ) : (
                <ol className="relative mt-8 space-y-6">
                  <div className="absolute bottom-4 left-[1.35rem] top-4 w-0.5 bg-black/10" />
                  <motion.div className="absolute left-[1.35rem] top-4 w-0.5 bg-gradient-to-b from-orange-500 to-rose-500" initial={{ height: 0 }} animate={{ height: `${(idx / (flow.length - 1)) * (100 - 12)}%` }} transition={{ duration: 0.9 }} />
                  {flow.map((f, i) => {
                    const on = i <= idx, now = i === idx;
                    return (
                      <li key={f.s} className="relative flex items-center gap-4">
                        <motion.span animate={now ? { scale: [1, 1.15, 1] } : {}} transition={{ repeat: Infinity, duration: 1.8 }}
                          className={`relative z-10 grid h-11 w-11 place-items-center rounded-full text-xl ${on ? "bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-rose-500/30" : "bg-black/10 grayscale"}`}>{f.e}</motion.span>
                        <div className={on ? "" : "opacity-40"}>
                          <div className="font-extrabold">{f.t}{now && info.status !== "done" && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-600">hozir</span>}</div>
                          <div className="text-sm text-black/50">{f.d}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="mt-8 border-t border-black/5 pt-5">
                {info.items.map((i) => <div key={i.name} className="flex justify-between py-1 text-sm"><span>{i.name}</span><b>× {i.qty}</b></div>)}
                {info.discount > 0 && <div className="mt-2 text-sm font-semibold text-emerald-600">Promo chegirma: −{money(info.discount)}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SiteFooter />
    </>
  );
}
