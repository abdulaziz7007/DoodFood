"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Banner, Category, Order, OrderStatus, Product } from "@/lib/types";
import { money } from "@/lib/format";

type Tab = "dash" | "orders" | "customers" | "products" | "categories" | "banners";
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "dash", label: "Statistika", icon: "📊" },
  { id: "orders", label: "Buyurtmalar", icon: "🧾" },
  { id: "customers", label: "Mijozlar", icon: "👥" },
  { id: "products", label: "Mahsulotlar", icon: "🍔" },
  { id: "categories", label: "Kategoriyalar", icon: "🗂️" },
  { id: "banners", label: "Bannerlar", icon: "🖼️" },
];
const statusLabel: Record<OrderStatus, string> = { new: "Yangi", cooking: "Tayyorlanmoqda", delivering: "Yo'lda", done: "Yetkazildi", cancelled: "Bekor qilindi" };
const statusColor: Record<OrderStatus, string> = { new: "bg-blue-500/20 text-blue-300", cooking: "bg-amber-500/20 text-amber-300", delivering: "bg-purple-500/20 text-purple-300", done: "bg-green-500/20 text-green-300", cancelled: "bg-red-500/20 text-red-300" };

type Customer = { id: string; name: string; phone: string; address: string; createdAt: string; orders: number; spent: number };

const api = async (url: string, method = "GET", body?: unknown) => {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return r.json();
};

export default function Admin() {
  const [auth, setAuth] = useState<boolean | null>(null);
  useEffect(() => { api("/api/auth").then((d) => setAuth(d.admin)); }, []);
  if (auth === null) return null;
  if (!auth) return <Login onOk={() => setAuth(true)} />;
  return <Panel onLogout={async () => { await api("/api/auth", "DELETE"); setAuth(false); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = await api("/api/auth", "POST", { password: pw });
    if (d.admin) onOk(); else setErr(d.error || "Xatolik");
  };
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand to-amber-400 p-4">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm space-y-4 rounded-3xl bg-card p-8 text-cream shadow-2xl ring-1 ring-white/10">
        <div className="text-center">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl">🌯</motion.div>
          <h1 className="mt-2 text-2xl font-black">Admin panel</h1>
        </div>
        <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Parol"
          className="w-full rounded-xl border border-white/10 bg-card/5 px-4 py-3 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
        {err && <motion.p initial={{ x: -8 }} animate={{ x: [-8, 8, -4, 4, 0] }} className="text-sm text-brand">{err}</motion.p>}
        <button className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark">Kirish</button>
        <Link href="/" className="block text-center text-sm text-white/50 hover:text-brand">← Saytga qaytish</Link>
      </motion.form>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dash");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const load = useCallback(async () => {
    const [o, p, c, b, u] = await Promise.all([api("/api/orders"), api("/api/crud/products"), api("/api/crud/categories"), api("/api/crud/banners"), api("/api/admin/users")]);
    setOrders(o); setProducts(p); setCategories(c.sort((x: Category, y: Category) => x.order - y.order)); setBanners(b); setCustomers(Array.isArray(u) ? u : []);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="min-h-screen bg-ink text-cream lg:flex">
      <aside className="border-r border-white/10 bg-black text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between p-4 lg:block lg:p-6">
          <div className="font-display text-3xl tracking-wide">DOOD<span className="text-brand">.</span>FOOD<div className="font-sans text-xs font-normal tracking-normal text-white/40">Boshqaruv paneli</div></div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex w-full shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-medium transition ${tab === t.id ? "text-white" : "text-white/60 hover:text-white"}`}>
              {tab === t.id && <motion.span layoutId="admintab" className="absolute inset-0 rounded-xl bg-brand" />}
              <span className="relative">{t.icon}</span><span className="relative">{t.label}</span>
              {t.id === "orders" && newCount > 0 && <span className="relative ml-auto rounded-full bg-sun px-2 text-xs font-bold text-ink">{newCount}</span>}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 p-3 lg:absolute lg:bottom-0 lg:block lg:w-64">
          <Link href="/" className="block rounded-xl px-4 py-3 text-sm text-white/60 hover:text-white">↗ Saytni ko&apos;rish</Link>
          <button onClick={onLogout} className="block w-full rounded-xl px-4 py-3 text-left text-sm text-white/60 hover:text-white">⎋ Chiqish</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
            {tab === "dash" && <Dash orders={orders} products={products} categories={categories} />}
            {tab === "orders" && <Orders orders={orders} reload={load} />}
            {tab === "customers" && <Customers customers={customers} />}
            {tab === "products" && <Products products={products} categories={categories} reload={load} />}
            {tab === "categories" && <Categories categories={categories} reload={load} />}
            {tab === "banners" && <Banners banners={banners} reload={load} />}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex gap-4 text-sm lg:hidden">
          <Link href="/" className="text-brand">↗ Sayt</Link>
          <button onClick={onLogout} className="text-white/50">Chiqish</button>
        </div>
      </main>
    </div>
  );
}

function Count({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / 900); setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n.toLocaleString("ru-RU")}</>;
}

function Dash({ orders, products, categories }: { orders: Order[]; products: Product[]; categories: Category[] }) {
  const paid = orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const avg = paid.length ? Math.round(revenue / paid.length) : 0;
  const top = Object.values(paid.flatMap((o) => o.items).reduce<Record<string, { name: string; qty: number }>>((a, i) => {
    (a[i.productId] ||= { name: i.name, qty: 0 }).qty += i.qty; return a;
  }, {})).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const days = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - k));
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const sum = paid.filter((o) => { const t = new Date(o.createdAt); return t >= d && t < next; }).reduce((s, o) => s + o.total, 0);
    return { label: d.toLocaleDateString("uz-UZ", { weekday: "short" }), sum };
  });
  const max = Math.max(1, ...days.map((d) => d.sum));
  const statuses = (Object.keys(statusLabel) as OrderStatus[]).map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));
  const cards = [
    { label: "Buyurtmalar", v: orders.length, icon: "🧾", c: "from-sky-500/30 to-indigo-500/10", ring: "ring-sky-400/30" },
    { label: "Daromad (so'm)", v: revenue, icon: "💰", c: "from-emerald-500/30 to-green-500/10", ring: "ring-emerald-400/30" },
    { label: "O'rtacha chek (so'm)", v: avg, icon: "📈", c: "from-brand/35 to-amber-500/10", ring: "ring-brand/40" },
    { label: "Mahsulotlar", v: products.length, icon: "🍔", c: "from-fuchsia-500/30 to-rose-500/10", ring: "ring-fuchsia-400/30" },
  ];
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div><h1 className="font-display text-5xl uppercase leading-none">Statistika</h1><p className="mt-1 text-sm text-white/40">{categories.length} ta kategoriya · {products.filter((p) => p.active).length} ta faol mahsulot</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
            className={`rounded-3xl bg-gradient-to-br ${c.c} p-5 ring-1 ${c.ring}`}>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-2xl">{c.icon}</div>
            <div className="font-display mt-4 text-4xl leading-none"><Count to={c.v} /></div>
            <div className="mt-1 text-sm text-white/60">{c.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-white/10 xl:col-span-3">
          <h2 className="mb-6 text-lg font-extrabold">Oxirgi 7 kun daromadi</h2>
          <div className="flex h-48 items-end gap-3">
            {days.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] text-white/40">{d.sum ? Math.round(d.sum / 1000) + "k" : ""}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.sum / max) * 100)}%` }} transition={{ delay: 0.2 + i * 0.07, type: "spring", stiffness: 90, damping: 14 }}
                  className="w-full rounded-t-xl bg-gradient-to-t from-brand to-sun" style={{ opacity: d.sum ? 1 : 0.2 }} />
                <span className="text-xs font-semibold text-white/50">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-white/10 xl:col-span-2">
          <h2 className="mb-4 text-lg font-extrabold">Buyurtma holatlari</h2>
          <div className="space-y-3">
            {statuses.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-3">
                <span className={`w-32 shrink-0 rounded-full px-3 py-1 text-center text-xs font-bold ${statusColor[s]}`}>{statusLabel[s]}</span>
                <div className="h-2 flex-1 rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${orders.length ? (n / orders.length) * 100 : 0}%` }} transition={{ duration: 0.8 }} className="h-2 rounded-full bg-brand" /></div>
                <b className="w-6 text-right text-sm">{n}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-card p-6 ring-1 ring-white/10">
        <h2 className="mb-4 text-lg font-extrabold">🏆 Eng ko&apos;p sotilganlar</h2>
        {top.length === 0 && <p className="text-white/40">Hozircha buyurtmalar yo&apos;q.</p>}
        {top.map((t, i) => (
          <div key={t.name} className="mb-3">
            <div className="mb-1 flex justify-between text-sm"><span>{t.name}</span><b>{t.qty} ta</b></div>
            <div className="h-2 rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${(t.qty / top[0].qty) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} className="h-2 rounded-full bg-gradient-to-r from-brand to-sun" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Orders({ orders, reload }: { orders: Order[]; reload: () => void }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const list = orders.filter((o) => filter === "all" || o.status === filter);
  const setStatus = async (id: string, status: OrderStatus) => { await api(`/api/orders/${id}`, "PATCH", { status }); reload(); };
  const del = async (id: string) => { if (confirm("Buyurtma o'chirilsinmi?")) { await api(`/api/orders/${id}`, "DELETE"); reload(); } };
  return (
    <div>
      <h1 className="font-display mb-4 text-5xl uppercase">Buyurtmalar</h1>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {(["all", "new", "cooking", "delivering", "done", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === s ? "bg-brand text-white" : "bg-card hover:bg-white/10"}`}>{s === "all" ? "Hammasi" : statusLabel[s]}</button>
        ))}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-white/50">Buyurtmalar yo&apos;q</p>}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {list.map((o) => (
            <motion.div layout key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }} className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-lg font-black">#{o.number} <span className="ml-2 text-sm font-normal text-white/40">{new Date(o.createdAt).toLocaleString("ru-RU")}</span></div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
              </div>
              <div className="mt-2 text-sm text-white/70">👤 {o.name} · 📞 <a className="text-brand" href={`tel:${o.phone}`}>{o.phone}</a><br />📍 {o.address}{o.comment && <><br />💬 {o.comment}</>}</div>
              <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
                {o.items.map((i) => <li key={i.productId} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></li>)}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div><b className="text-lg">{money(o.total)}</b>{o.promo && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">{o.promo} −{money(o.discount ?? 0)}</span>}</div>
                <div className="flex gap-2">
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)} className="rounded-xl border border-white/10 bg-card/5 px-3 py-2 text-sm">
                    {(Object.keys(statusLabel) as OrderStatus[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                  <button onClick={() => del(o.id)} className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-400 hover:bg-red-500/200/25">🗑</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const field = "w-full rounded-xl border border-white/10 bg-card/5 px-4 py-2.5 outline-none focus:border-brand focus:bg-card/10 focus:ring-4 focus:ring-brand/10";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-white/100 p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black">{title}</h3><button onClick={onClose} className="h-8 w-8 rounded-full bg-white/10">✕</button></div>
        {children}
      </motion.div>
    </motion.div>
  );
}
const Label = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm font-semibold">{t}<div className="mt-1 font-normal">{children}</div></label>;

function Head({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-display text-5xl uppercase leading-none">{title}</h1>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onAdd} className="rounded-xl bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">+ Qo&apos;shish</motion.button>
    </div>
  );
}

function Products({ products, categories, reload }: { products: Product[]; categories: Category[]; reload: () => void }) {
  const [edit, setEdit] = useState<Partial<Product> | null>(null);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const list = products.filter((p) => (cat === "all" || p.categoryId === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = { ...edit, price: Number(edit!.price), oldPrice: edit!.oldPrice ? Number(edit!.oldPrice) : undefined };
    if (p.id) await api(`/api/crud/products/${p.id}`, "PUT", p); else await api("/api/crud/products", "POST", p);
    setEdit(null); reload();
  };
  const toggle = async (p: Product) => { await api(`/api/crud/products/${p.id}`, "PUT", { active: !p.active }); reload(); };
  const del = async (p: Product) => { if (confirm(`"${p.name}" o'chirilsinmi?`)) { await api(`/api/crud/products/${p.id}`, "DELETE"); reload(); } };
  const cname = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  return (
    <div>
      <Head title="Mahsulotlar" onAdd={() => setEdit({ categoryId: categories[0]?.id, name: "", description: "", price: 0, emoji: categories[0]?.emoji || "🍽️", active: true })} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish…" className={`${field} max-w-xs`} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${field} max-w-xs`}>
          <option value="all">Barcha kategoriyalar</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/5 text-white/50"><tr><th className="p-3">Nomi</th><th>Kategoriya</th><th>Narxi</th><th>Holat</th><th></th></tr></thead>
          <tbody>
            <AnimatePresence initial={false}>
              {list.map((p) => (
                <motion.tr layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-white/10 hover:bg-white/[.03]">
                  <td className="p-3 font-semibold">{p.emoji} {p.name}</td>
                  <td>{cname(p.categoryId)}</td>
                  <td>{money(p.price)}{p.oldPrice ? <span className="ml-2 text-xs text-white/40 line-through">{money(p.oldPrice)}</span> : null}</td>
                  <td><button onClick={() => toggle(p)} className={`rounded-full px-3 py-1 text-xs font-bold ${p.active ? "bg-green-500/20 text-green-300" : "bg-white/15 text-white/50"}`}>{p.active ? "Faol" : "O'chiq"}</button></td>
                  <td className="whitespace-nowrap pr-3 text-right"><button onClick={() => setEdit(p)} className="rounded-lg px-2 py-1 hover:bg-white/10">✏️</button><button onClick={() => del(p)} className="rounded-lg px-2 py-1 hover:bg-red-500/20">🗑</button></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {edit && (
          <Modal title={edit.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot"} onClose={() => setEdit(null)}>
            <form onSubmit={save} className="space-y-3">
              <Label t="Nomi"><input required className={field} value={edit.name || ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Label>
              <Label t="Kategoriya">
                <select className={field} value={edit.categoryId} onChange={(e) => setEdit({ ...edit, categoryId: e.target.value })}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Label t="Narxi (so'm)"><input required type="number" min={0} className={field} value={edit.price ?? ""} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Label>
                <Label t="Eski narx (ixtiyoriy)"><input type="number" min={0} className={field} value={edit.oldPrice ?? ""} onChange={(e) => setEdit({ ...edit, oldPrice: e.target.value ? Number(e.target.value) : undefined })} /></Label>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-3">
                <Label t="Emoji"><input className={field} value={edit.emoji || ""} onChange={(e) => setEdit({ ...edit, emoji: e.target.value })} /></Label>
                <Label t="Rasm URL (ixtiyoriy)"><input className={field} placeholder="https://…" value={edit.image || ""} onChange={(e) => setEdit({ ...edit, image: e.target.value })} /></Label>
              </div>
              <Label t="Tavsif"><textarea rows={2} className={field} value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={edit.active ?? true} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Saytda ko&apos;rsatish</label>
              <button className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark">Saqlash</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Categories({ categories, reload }: { categories: Category[]; reload: () => void }) {
  const [edit, setEdit] = useState<Partial<Category> | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = { ...edit, order: Number(edit!.order) };
    if (c.id) await api(`/api/crud/categories/${c.id}`, "PUT", c); else await api("/api/crud/categories", "POST", c);
    setEdit(null); reload();
  };
  const del = async (c: Category) => { if (confirm(`"${c.name}" va undagi barcha mahsulotlar o'chirilsinmi?`)) { await api(`/api/crud/categories/${c.id}`, "DELETE"); reload(); } };
  return (
    <div>
      <Head title="Kategoriyalar" onAdd={() => setEdit({ name: "", emoji: "🍽️", order: categories.length })} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {categories.map((c, i) => (
            <motion.div layout key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -3 }}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <span className="text-4xl">{c.emoji}</span>
              <div className="flex-1"><div className="font-bold">{c.name}</div><div className="text-xs text-white/40">Tartib: {c.order}</div></div>
              <button onClick={() => setEdit(c)} className="rounded-lg px-2 py-1 hover:bg-white/10">✏️</button>
              <button onClick={() => del(c)} className="rounded-lg px-2 py-1 hover:bg-red-500/20">🗑</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {edit && (
          <Modal title={edit.id ? "Kategoriyani tahrirlash" : "Yangi kategoriya"} onClose={() => setEdit(null)}>
            <form onSubmit={save} className="space-y-3">
              <Label t="Nomi"><input required className={field} value={edit.name || ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Label>
              <div className="grid grid-cols-2 gap-3">
                <Label t="Emoji"><input className={field} value={edit.emoji || ""} onChange={(e) => setEdit({ ...edit, emoji: e.target.value })} /></Label>
                <Label t="Tartib raqami"><input type="number" className={field} value={edit.order ?? 0} onChange={(e) => setEdit({ ...edit, order: Number(e.target.value) })} /></Label>
              </div>
              <button className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark">Saqlash</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Banners({ banners, reload }: { banners: Banner[]; reload: () => void }) {
  const [edit, setEdit] = useState<Partial<Banner> | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (edit!.id) await api(`/api/crud/banners/${edit!.id}`, "PUT", edit); else await api("/api/crud/banners", "POST", edit);
    setEdit(null); reload();
  };
  const del = async (b: Banner) => { if (confirm("Banner o'chirilsinmi?")) { await api(`/api/crud/banners/${b.id}`, "DELETE"); reload(); } };
  return (
    <div>
      <Head title="Bannerlar" onAdd={() => setEdit({ title: "", subtitle: "", from: "#e11d2e", to: "#ff7a18", emoji: "🌯", active: true })} />
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {banners.map((b) => (
            <motion.div layout key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: 1.02 }}
              className="relative flex h-40 items-center justify-between overflow-hidden rounded-2xl p-5 text-white shadow-md" style={{ background: `linear-gradient(120deg, ${b.from}, ${b.to})`, opacity: b.active ? 1 : 0.5 }}>
              <div><div className="text-3xl font-black">{b.title}</div><div className="text-sm">{b.subtitle}</div></div>
              <div className="text-7xl">{b.emoji}</div>
              <div className="absolute right-2 top-2 flex gap-1"><button onClick={() => setEdit(b)} className="rounded-lg bg-card/25 px-2 py-1">✏️</button><button onClick={() => del(b)} className="rounded-lg bg-card/25 px-2 py-1">🗑</button></div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {edit && (
          <Modal title={edit.id ? "Bannerni tahrirlash" : "Yangi banner"} onClose={() => setEdit(null)}>
            <form onSubmit={save} className="space-y-3">
              <Label t="Sarlavha"><input required className={field} value={edit.title || ""} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Label>
              <Label t="Qo'shimcha matn"><input className={field} value={edit.subtitle || ""} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} /></Label>
              <div className="grid grid-cols-3 gap-3">
                <Label t="Rang 1"><input type="color" className="h-11 w-full rounded-xl" value={edit.from || "#e11d2e"} onChange={(e) => setEdit({ ...edit, from: e.target.value })} /></Label>
                <Label t="Rang 2"><input type="color" className="h-11 w-full rounded-xl" value={edit.to || "#ff7a18"} onChange={(e) => setEdit({ ...edit, to: e.target.value })} /></Label>
                <Label t="Emoji"><input className={field} value={edit.emoji || ""} onChange={(e) => setEdit({ ...edit, emoji: e.target.value })} /></Label>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={edit.active ?? true} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Saytda ko&apos;rsatish</label>
              <button className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark">Saqlash</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Customers({ customers }: { customers: Customer[] }) {
  const [q, setQ] = useState("");
  const list = customers.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-5xl uppercase leading-none">Mijozlar</h1><p className="mt-1 text-sm text-white/40">{customers.length} ta ro&apos;yxatdan o&apos;tgan foydalanuvchi</p></div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism yoki telefon…" className={`${field} max-w-xs`} />
      </div>
      {list.length === 0 && <p className="py-16 text-center text-white/40">Mijozlar yo&apos;q</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {list.map((c, i) => (
            <motion.div layout key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -3 }} className="rounded-3xl bg-card p-5 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-amber-400 text-lg font-extrabold text-black">{c.name.trim()[0]?.toUpperCase()}</span>
                <div className="min-w-0"><div className="truncate font-bold">{c.name}</div><a href={`tel:+${c.phone}`} className="text-sm text-brand">+{c.phone}</a></div>
              </div>
              {c.address && <p className="mt-3 truncate text-sm text-white/50">📍 {c.address}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-white/5 p-2"><div className="font-extrabold">{c.orders}</div><div className="text-xs text-white/40">buyurtma</div></div>
                <div className="rounded-2xl bg-white/5 p-2"><div className="font-extrabold">{money(c.spent)}</div><div className="text-xs text-white/40">xarid</div></div>
              </div>
              <div className="mt-3 text-xs text-white/30">Ro&apos;yxatdan o&apos;tgan: {new Date(c.createdAt).toLocaleDateString("ru-RU")}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
