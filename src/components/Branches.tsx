"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteFooter, SiteHeader, PageTitle } from "./SiteShell";

const branches = [
  { name: "Chilonzor", addr: "Chilonzor 9-kvartal, Bunyodkor ko'chasi 12", phone: "+998 71 200 00 01", open: 10, close: 23, zone: "Chilonzor, Yunusobod" , emoji: "🏙️" },
  { name: "Yunusobod", addr: "Amir Temur shoh ko'chasi 108", phone: "+998 71 200 00 02", open: 10, close: 24, zone: "Yunusobod, Mirzo Ulug'bek", emoji: "🌳" },
  { name: "Mirobod", addr: "Mirobod ko'chasi 24, Ziyolilar", phone: "+998 71 200 00 03", open: 9, close: 23, zone: "Mirobod, Shayxontohur", emoji: "🏛️" },
  { name: "Sergeli", addr: "Sergeli 7-mavze, Yangi Sergeli ko'chasi 3", phone: "+998 71 200 00 04", open: 10, close: 22, zone: "Sergeli, Yangihayot", emoji: "🛍️" },
  { name: "Yakkasaroy", addr: "Shota Rustaveli ko'chasi 45", phone: "+998 71 200 00 05", open: 10, close: 23, zone: "Yakkasaroy, Mirzo Ulug'bek", emoji: "☕" },
  { name: "Oybek (24/7)", addr: "Oybek metro yonida, Navoiy ko'chasi", phone: "+998 71 200 00 06", open: 0, close: 24, zone: "Markaziy hudud", emoji: "🌙" },
];

export default function Branches() {
  const [hour, setHour] = useState<number | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    const upd = () => setHour(Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Tashkent" }).format(new Date())) % 24);
    upd();
    const id = setInterval(upd, 60000);
    return () => clearInterval(id);
  }, []);
  const list = branches.filter((b) => (b.name + b.addr + b.zone).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SiteHeader />
      <PageTitle emoji="📍" title="Filiallar" sub="Eng yaqin DoodFood filialini toping. Ochiq/yopiq holati Toshkent vaqti bilan ko'rsatiladi." />
      <div className="mx-auto max-w-7xl px-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Tuman yoki ko'cha bo'yicha qidirish" className="mb-6 w-full max-w-md rounded-full bg-white px-5 py-3 font-medium outline-none ring-1 ring-black/10 transition focus:ring-brand/60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b, i) => {
            const isOpen = hour !== null && hour >= b.open && hour < b.close;
            return (
              <motion.article key={b.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_8px_24px_-8px_rgba(17,17,20,.12)] ring-1 ring-black/[.04]">
                <div className="absolute -right-6 -top-6 text-[7rem] opacity-[.07] transition duration-500 group-hover:rotate-12 group-hover:scale-110">{b.emoji}</div>
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-2xl">{b.emoji}</span>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${hour === null ? "bg-black/5 text-black/40" : isOpen ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${hour === null ? "bg-black/30" : isOpen ? "animate-pulse bg-emerald-500" : "bg-rose-400"}`} />
                    {hour === null ? "…" : isOpen ? "Ochiq" : "Yopiq"}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-extrabold tracking-tight">{b.name}</h2>
                <p className="mt-1 text-sm text-black/55">{b.addr}</p>
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-black/40">Ish vaqti</span><b>{b.open === 0 && b.close === 24 ? "24/7" : `${String(b.open).padStart(2, "0")}:00 — ${b.close === 24 ? "00" : b.close}:00`}</b></div>
                  <div className="flex justify-between"><span className="text-black/40">Yetkazish</span><b className="text-right">{b.zone}</b></div>
                </div>
                <div className="mt-5 flex gap-2">
                  <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="flex-1 rounded-full bg-ink py-2.5 text-center text-sm font-bold text-white transition hover:bg-black">📞 Qo&apos;ng&apos;iroq</a>
                  <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent("Toshkent " + b.addr)}`} className="flex-1 rounded-full bg-black/5 py-2.5 text-center text-sm font-bold transition hover:bg-black/10">🗺 Xaritada</a>
                </div>
              </motion.article>
            );
          })}
        </div>
        {list.length === 0 && <p className="py-16 text-center text-black/45">Filial topilmadi</p>}
      </div>
      <SiteFooter />
    </>
  );
}
