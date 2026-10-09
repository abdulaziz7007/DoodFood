"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Order } from "@/lib/types";
import { money } from "@/lib/format";
import { addToCart } from "@/lib/cartStore";
import { SiteFooter, SiteHeader } from "./SiteShell";

type U = { id: string; name: string; phone: string; address: string; createdAt: string };
const statusLabel: Record<Order["status"], string> = { new: "Yangi", cooking: "Tayyorlanmoqda", delivering: "Yo'lda", done: "Yetkazildi", cancelled: "Bekor qilindi" };
const statusColor: Record<Order["status"], string> = { new: "bg-blue-50 text-blue-600", cooking: "bg-amber-50 text-amber-600", delivering: "bg-violet-50 text-violet-600", done: "bg-emerald-50 text-emerald-600", cancelled: "bg-rose-50 text-rose-500" };
const levels = [
  { name: "Bronza", min: 0, icon: "🥉", c: "from-amber-700 to-orange-500" },
  { name: "Kumush", min: 200000, icon: "🥈", c: "from-slate-500 to-slate-300" },
  { name: "Oltin", min: 600000, icon: "🥇", c: "from-yellow-500 to-amber-300" },
];
const tabs = [["info", "Ma'lumotlar"], ["orders", "Buyurtmalar"], ["bonus", "Bonus"]] as const;

export default function Profile({ initial }: { initial: U }) {
  const router = useRouter();
  const [user, setUser] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("info");
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => { fetch("/api/user/orders").then((r) => r.json()).then((d) => setOrders(Array.isArray(d) ? d : [])); }, []);

  const valid = (orders ?? []).filter((o) => o.status !== "cancelled");
  const spent = valid.reduce((s, o) => s + o.total, 0);
  const lvlIdx = levels.reduce((a, l, i) => (spent >= l.min ? i : a), 0);
  const lvl = levels[lvlIdx], next = levels[lvlIdx + 1];
  const progress = next ? Math.min(100, ((spent - lvl.min) / (next.min - lvl.min)) * 100) : 100;

  const logout = async () => { await fetch("/api/user/logout", { method: "POST" }); router.push("/"); router.refresh(); };

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 pt-10">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-zinc-800 to-zinc-700 p-6 text-white shadow-2xl sm:p-8">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/5" />
          <div className="relative flex flex-wrap items-center gap-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className={`grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${lvl.c} text-3xl font-extrabold shadow-xl`}>{user.name.trim()[0]?.toUpperCase()}</motion.div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-extrabold tracking-tight">{user.name}</h1>
              <p className="text-white/60">+{user.phone.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}</p>
              <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{lvl.icon} {lvl.name} daraja</span>
            </div>
            <button onClick={logout} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold transition hover:bg-white/20">Chiqish</button>
          </div>
          <div className="relative mt-6 grid grid-cols-3 gap-3 text-center">
            {[[valid.length, "buyurtma"], [money(spent), "xarid"], [Math.floor(spent / 1000), "bonus ball"]].map(([n, l]) => (
              <div key={String(l)} className="rounded-2xl bg-white/10 p-3"><div className="text-lg font-extrabold sm:text-2xl">{n}</div><div className="text-xs text-white/55">{l}</div></div>
            ))}
          </div>
        </motion.section>

        <div className="mt-6 flex gap-2">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === k ? "text-white" : "bg-white text-black/55 ring-1 ring-black/5"}`}>
              {tab === k && <motion.span layoutId="ptab" className="absolute inset-0 rounded-full bg-ink" />}
              <span className="relative">{l}{k === "orders" && orders ? ` (${orders.length})` : ""}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mt-5">
            {tab === "info" && <Info user={user} onSaved={setUser} />}
            {tab === "orders" && <Orders orders={orders} />}
            {tab === "bonus" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5">
                  <h3 className="text-lg font-extrabold">Sodiqlik darajasi</h3>
                  <p className="mt-1 text-sm text-black/50">{next ? `${next.icon} ${next.name} darajagacha yana ${money(next.min - spent)} xarid qiling.` : "Siz eng yuqori darajadasiz! 🎉"}</p>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/5"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} className={`h-full rounded-full bg-gradient-to-r ${lvl.c}`} /></div>
                  <div className="mt-2 flex justify-between text-xs font-semibold text-black/40">{levels.map((l) => <span key={l.name}>{l.icon} {l.name}</span>)}</div>
                </div>
                <div className="rounded-[1.75rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 p-6 text-white">
                  <div className="text-4xl">🎡</div>
                  <h3 className="mt-3 text-lg font-extrabold">Kunlik omad g&apos;ildiragi</h3>
                  <p className="mt-1 text-sm text-white/80">Har kuni aylantiring va 20% gacha chegirma promo-kodini yuting.</p>
                  <Link href="/spin" className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-violet-600">Aylantirish →</Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <SiteFooter />
    </>
  );
}

function Info({ user, onSaved }: { user: U; onSaved: (u: U) => void }) {
  const [f, setF] = useState({ name: user.name, address: user.address, currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await fetch("/api/user", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, t: d.error });
    onSaved(d.user); setF({ ...f, currentPassword: "", newPassword: "" }); setMsg({ ok: true, t: "Saqlandi ✓" });
  };
  const input = "w-full rounded-2xl bg-black/[.045] px-4 py-3.5 font-medium outline-none ring-1 ring-transparent transition placeholder:text-black/35 focus:bg-white focus:ring-brand/60";
  return (
    <form onSubmit={save} className="grid gap-4 rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5 md:grid-cols-2">
      <label className="text-sm font-bold">Ism<input className={`${input} mt-1.5 font-medium`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
      <label className="text-sm font-bold">Telefon<input className={`${input} mt-1.5 font-medium opacity-60`} value={"+" + user.phone} disabled /></label>
      <label className="text-sm font-bold md:col-span-2">Yetkazish manzili<input className={`${input} mt-1.5 font-medium`} placeholder="Ko'cha, uy, mo'ljal" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></label>
      <div className="border-t border-black/5 pt-4 md:col-span-2"><h3 className="font-extrabold">Parolni o&apos;zgartirish</h3><p className="text-sm text-black/45">Bo&apos;sh qoldirsangiz, parol o&apos;zgarmaydi.</p></div>
      <input type="password" className={input} placeholder="Joriy parol" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} />
      <input type="password" className={input} placeholder="Yangi parol (kamida 6)" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} />
      <div className="flex items-center gap-4 md:col-span-2">
        <button disabled={busy} className="rounded-full bg-ink px-8 py-3 font-bold text-white transition hover:bg-black disabled:opacity-60">{busy ? "Saqlanmoqda…" : "Saqlash"}</button>
        {msg && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`text-sm font-bold ${msg.ok ? "text-emerald-600" : "text-rose-500"}`}>{msg.t}</motion.span>}
      </div>
    </form>
  );
}

function Orders({ orders }: { orders: Order[] | null }) {
  const router = useRouter();
  const [again, setAgain] = useState<string | null>(null);
  const reorder = (o: Order) => { o.items.forEach((i) => addToCart(i.productId, i.qty)); setAgain(o.id); setTimeout(() => router.push("/"), 700); };
  const list = useMemo(() => orders ?? [], [orders]);
  if (orders === null) return <p className="py-16 text-center text-black/40">Yuklanmoqda…</p>;
  if (!list.length) return (
    <div className="rounded-[1.75rem] bg-white p-12 text-center ring-1 ring-black/5"><div className="text-6xl">🍽️</div><h3 className="mt-3 text-xl font-extrabold">Hali buyurtmalar yo&apos;q</h3><p className="mt-1 text-black/45">Birinchi buyurtmangizni bering!</p><Link href="/" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 font-bold text-white">Menyuga o&apos;tish</Link></div>
  );
  return (
    <div className="space-y-3">
      {list.map((o, i) => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[1.5rem] bg-white p-5 ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold">#{o.number} <span className="ml-2 text-sm font-medium text-black/40">{new Date(o.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</span></div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
          </div>
          <p className="mt-2 text-sm text-black/55">{o.items.map((x) => `${x.name} × ${x.qty}`).join(", ")}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <b className="text-lg">{money(o.total)}</b>
            <div className="flex gap-2">
              {o.status !== "done" && o.status !== "cancelled" && <Link href="/track" className="rounded-full bg-black/5 px-4 py-2 text-sm font-bold transition hover:bg-black/10">📦 Kuzatish</Link>}
              <button onClick={() => reorder(o)} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-black">{again === o.id ? "✓ Savatga qo'shildi" : "↻ Qayta buyurtma"}</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
