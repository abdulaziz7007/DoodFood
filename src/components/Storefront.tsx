"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Banner, Category, Product } from "@/lib/types";
import { money } from "@/lib/format";
import { links } from "./SiteShell";
import UserChip from "./UserChip";

type Cart = Record<string, number>;
type Line = { p: Product; qty: number };

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease } });

export default function Storefront({ categories, products, banners }: { categories: Category[]; products: Product[]; banners: Banner[] }) {
  const [cart, setCart] = useState<Cart>({});
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(categories[0]?.id);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [done, setDone] = useState<{ number: number; total: number } | null>(null);
  const [bump, setBump] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("cart") || "{}")); } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const lines: Line[] = Object.entries(cart).flatMap(([id, qty]) => (byId[id] ? [{ p: byId[id], qty }] : []));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);

  const add = (id: string, d = 1) => {
    setCart((c) => {
      const q = (c[id] || 0) + d;
      const n = { ...c };
      if (q <= 0) delete n[id]; else n[id] = q;
      return n;
    });
    if (d > 0) setBump((b) => b + 1);
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("cat-", ""))),
      { rootMargin: "-25% 0px -65% 0px" },
    );
    categories.forEach((c) => { const el = document.getElementById("cat-" + c.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [categories, query]);

  useEffect(() => {
    document.getElementById("chip-" + active)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const q = query.trim().toLowerCase();
  const groups = categories
    .map((c) => ({ c, items: products.filter((p) => p.categoryId === c.id && (!q || p.name.toLowerCase().includes(q))) }))
    .filter((g) => g.items.length);

  return (
    <div className="min-h-screen">
      <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }} className="sticky top-0 z-40">
        <div className="glass border-x-0 border-t-0 border-b-black/5">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
            <a href="#" className="flex items-center gap-2.5">
              <span className="grad grid h-9 w-9 place-items-center rounded-xl text-lg shadow-lg shadow-brand/30">🌯</span>
              <span className="text-lg font-extrabold tracking-tight">Dood<span className="text-brand">Food</span></span>
            </a>
            <nav className="hidden items-center gap-0.5 xl:flex">
              {links.map((l) => (<Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-black/55 transition hover:bg-black/5 hover:text-ink">{l.label}</Link>))}
            </nav>
            <div className="relative mx-auto hidden max-w-md flex-1 md:block">
              <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Taom qidirish"
                className="w-full rounded-full bg-black/[.045] py-2.5 pl-11 pr-4 text-sm font-medium outline-none ring-1 ring-transparent transition placeholder:text-black/35 focus:bg-white focus:ring-black/10" />
            </div>
            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <Link href="/admin" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-black/55 transition hover:bg-black/5 hover:text-ink sm:block">Admin</Link>
              <UserChip />
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black">
                <motion.svg key={`b${bump}`} animate={{ rotate: [0, -14, 14, 0], scale: [1, 1.25, 1] }} transition={{ duration: 0.45 }} className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.6 9H8L6 3H3" /><circle cx="9" cy="20" r="1.2" /><circle cx="18" cy="20" r="1.2" /></motion.svg>
                <span>{count > 0 ? money(total) : "Savat"}</span>
                <AnimatePresence>
                  {count > 0 && <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="grad grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-extrabold">{count}</motion.span>}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <Hero products={products} />
      <BannerRow banners={banners} />
      <Explore />

      <div className="sticky top-[57px] z-30 bg-[#f6f6f8]/80 py-3 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4">
          {categories.map((c) => (
            <a key={c.id} id={`chip-${c.id}`} href={`#cat-${c.id}`}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active === c.id ? "text-white" : "bg-white text-black/65 ring-1 ring-black/5 hover:text-ink"}`}>
              {active === c.id && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 340, damping: 30 }} />}
              <span className="relative">{c.emoji}</span><span className="relative">{c.name}</span>
            </a>
          ))}
        </div>
        <div className="mx-auto mt-2 max-w-7xl px-4 md:hidden">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Taom qidirish" className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-medium outline-none ring-1 ring-black/5 focus:ring-black/15" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-4">
        {groups.length === 0 && <p className="py-24 text-center font-medium text-black/45">Hech narsa topilmadi</p>}
        {groups.map(({ c, items }) => (
          <section key={c.id} id={`cat-${c.id}`} className="mb-14 scroll-mt-32">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="mb-5 flex items-baseline gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{c.name}</h2>
              <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-bold text-black/45">{items.length}</span>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} p={p} i={i} qty={cart[p.id] || 0} onAdd={(d) => add(p.id, d)} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-10 text-sm text-black/50 sm:flex-row">
          <span className="text-base font-extrabold text-ink">Dood<span className="text-brand">Food</span></span>
          <span>Har kuni 10:00 — 23:00 · +998 71 200 00 00 · Toshkent</span>
        </div>
      </footer>

      <AnimatePresence>
        {count > 0 && !cartOpen && (
          <motion.button initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ ease, duration: 0.4 }} onClick={() => setCartOpen(true)}
            className="grad soft-lg shine fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-2xl px-5 py-4 font-bold text-white sm:hidden">
            <span>Savat · {count} ta</span><span>{money(total)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} lines={lines} total={total} add={add}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }} />
      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} lines={lines} total={total}
        onDone={(r) => { setCheckout(false); setCart({}); setDone(r); }} />
      <AnimatePresence>
        {done && (
          <Overlay onClose={() => setDone(null)}>
            <div className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15 }} className="grad mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full text-4xl text-white shadow-xl shadow-brand/30">✓</motion.div>
              <h3 className="text-2xl font-extrabold tracking-tight">Buyurtma qabul qilindi</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/55">Raqam <b className="text-ink">#{done.number}</b> · Jami <b className="text-ink">{money(done.total)}</b><br />Operator tez orada siz bilan bog&apos;lanadi.<br /><Link href="/track" className="font-bold text-brand">Buyurtmani kuzatish →</Link></p>
              <button onClick={() => setDone(null)} className="mt-6 w-full rounded-2xl bg-ink py-3.5 font-bold text-white">Yaxshi</button>
            </div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function Hero({ products }: { products: Product[] }) {
  const pics = products.filter((p) => p.image);
  const a = pics[0];
  const b = pics.find((p) => /pitsa/i.test(p.name)) ?? pics[10];
  const stats = [["30 daq", "yetkazish"], ["4.9 ★", "reyting"], [`${products.length}+`, "taom"]];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 ring-1 ring-black/5 soft">
        <div className="blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="blob absolute -bottom-32 right-10 h-96 w-96 rounded-full bg-rose-300/30 blur-3xl" style={{ animationDelay: "-4s" }} />
        <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
          <div>
            <motion.span {...fadeUp(0.05)} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-black/70">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
              Hozir ochiq · yetkazib berish bor
            </motion.span>
            <motion.h1 {...fadeUp(0.15)} className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Sevimli taomlaringiz,<br /><span className="bg-gradient-to-r from-brand to-rose-500 bg-clip-text text-transparent">tez va issiq</span> yetib keladi
            </motion.h1>
            <motion.p {...fadeUp(0.25)} className="mt-5 max-w-md text-base leading-relaxed text-black/55">Lavash, shaurma, burger va pitsa. Tanlang, buyurtma bering — qolganini bizga qoldiring.</motion.p>
            <motion.div {...fadeUp(0.35)} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#cat-c1" className="grad soft-lg shine rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:scale-[1.03] active:scale-95">Menyuni ko&apos;rish</a>
              <a href="#cat-c2" className="rounded-full bg-white px-7 py-3.5 text-sm font-bold ring-1 ring-black/10 transition hover:bg-black/5">Foydali setlar</a>
            </motion.div>
            <motion.dl {...fadeUp(0.45)} className="mt-10 flex gap-8">
              {stats.map(([n, l]) => (<div key={l}><dt className="text-2xl font-extrabold tracking-tight">{n}</dt><dd className="text-xs font-semibold text-black/45">{l}</dd></div>))}
            </motion.dl>
          </div>

          <div className="relative mx-auto h-72 w-full max-w-md sm:h-96">
            {a && (
              <motion.div initial={{ opacity: 0, scale: 0.85, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} transition={{ duration: 0.9, delay: 0.3, ease }} className="floaty absolute left-0 top-0 w-[62%] overflow-hidden rounded-[1.75rem] bg-white p-2 soft-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.name} referrerPolicy="no-referrer" className="aspect-[4/5] w-full rounded-[1.25rem] object-cover" />
              </motion.div>
            )}
            {b && (
              <motion.div initial={{ opacity: 0, scale: 0.85, rotate: 8 }} animate={{ opacity: 1, scale: 1, rotate: 5 }} transition={{ duration: 0.9, delay: 0.45, ease }} className="floaty absolute bottom-0 right-0 w-[52%] overflow-hidden rounded-[1.75rem] bg-white p-2 soft-lg" style={{ animationDelay: "-2.5s" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.name} referrerPolicy="no-referrer" className="aspect-square w-full rounded-[1.25rem] object-cover" />
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, ease, duration: 0.6 }} className="glass soft-lg absolute right-0 top-4 flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="grad grid h-9 w-9 place-items-center rounded-xl text-base text-white">🛵</span>
              <div><div className="text-sm font-extrabold leading-tight">Bepul yetkazish</div><div className="text-[11px] font-medium text-black/45">100 000 so&apos;mdan</div></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Explore() {
  const cards = [
    { ...links[0], d: "Bugungi chegirmalar va kun taomi", c: "from-orange-500 to-rose-500" },
    { ...links[1], d: "Aylantiring va promo-kod yuting", c: "from-violet-500 to-fuchsia-500" },
    { ...links[2], d: "3 savol — sizga mos taom", c: "from-emerald-500 to-teal-500" },
    { ...links[3], d: "Buyurtmangiz holatini kuzating", c: "from-sky-500 to-indigo-500" },
    { ...links[4], d: "Eng yaqin filialni toping", c: "from-amber-500 to-orange-500" },
  ];
  return (
    <section className="mx-auto mt-8 max-w-7xl px-4">
      <h2 className="mb-4 text-xl font-extrabold tracking-tight">Qiziqarli bo&apos;limlar</h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {cards.map((c, i) => (
          <motion.div key={c.href} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07, ease }} whileHover={{ y: -6 }} className="min-w-[13rem] md:min-w-0">
            <Link href={c.href} className={`group relative block h-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${c.c} p-5 text-white shadow-lg`}>
              <div className="text-4xl transition duration-500 group-hover:-rotate-12 group-hover:scale-125">{c.emoji}</div>
              <div className="mt-4 font-extrabold leading-tight">{c.label}</div>
              <div className="mt-1 text-xs font-medium opacity-80">{c.d}</div>
              <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white/15" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BannerRow({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section className="mx-auto mt-5 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {banners.map((b, i) => (
        <motion.a key={b.id} href="#cat-c1" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease }} whileHover={{ y: -6 }}
          className="group relative flex h-36 items-center justify-between overflow-hidden rounded-[1.5rem] p-6 text-white soft"
          style={{ background: `linear-gradient(120deg, ${b.from}, ${b.to})` }}>
          <div className="relative z-10 max-w-[70%]">
            <div className="text-3xl font-extrabold tracking-tight">{b.title}</div>
            <div className="mt-1 text-sm font-medium opacity-90">{b.subtitle}</div>
          </div>
          <div className="text-7xl drop-shadow-xl transition duration-500 group-hover:-rotate-12 group-hover:scale-125">{b.emoji}</div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
        </motion.a>
      ))}
    </section>
  );
}

function ProductCard({ p, i, qty, onAdd }: { p: Product; i: number; qty: number; onAdd: (d: number) => void }) {
  const disc = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const [broken, setBroken] = useState(false);
  return (
    <motion.article initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease }} whileHover={{ y: -4 }}
      className="group flex flex-col rounded-[1.5rem] bg-white p-2 ring-1 ring-black/[.04] transition-shadow soft hover:soft-lg">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-orange-50 to-rose-50">
        {p.image && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110" />
        ) : <div className="grid h-full place-items-center text-6xl">{p.emoji}</div>}
        {disc > 0 && <span className="glass absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-extrabold text-brand">-{disc}%</span>}
        <div className="absolute bottom-2.5 right-2.5">
          <AnimatePresence mode="wait" initial={false}>
            {qty === 0 ? (
              <motion.button key="add" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} whileTap={{ scale: 0.85 }} onClick={() => onAdd(1)} aria-label="Qo'shish"
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl font-bold shadow-lg transition hover:bg-ink hover:text-white">+</motion.button>
            ) : (
              <motion.div key="qty" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
                className="flex items-center rounded-full bg-ink p-1 text-white shadow-lg">
                <button onClick={() => onAdd(-1)} className="h-8 w-8 rounded-full text-lg font-bold transition hover:bg-white/15">−</button>
                <motion.span key={qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center text-sm font-bold">{qty}</motion.span>
                <button onClick={() => onAdd(1)} className="h-8 w-8 rounded-full text-lg font-bold transition hover:bg-white/15">+</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug sm:text-[15px]">{p.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-extrabold tracking-tight">{money(p.price)}</span>
          {disc > 0 && <span className="text-xs font-medium text-black/35 line-through">{money(p.oldPrice!)}</span>}
        </div>
      </div>
    </motion.article>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-md">
      <motion.div initial={{ scale: 0.92, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 16, opacity: 0 }} transition={{ duration: 0.35, ease }} onClick={(e) => e.stopPropagation()}
        className="soft-lg max-h-[90vh] w-full max-w-md overflow-auto rounded-[2rem] bg-white text-ink">
        {children}
      </motion.div>
    </motion.div>
  );
}

function CartDrawer({ open, onClose, lines, total, add, onCheckout }: { open: boolean; onClose: () => void; lines: Line[]; total: number; add: (id: string, d?: number) => void; onCheckout: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md">
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 32, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} className="soft-lg ml-auto flex h-full w-full max-w-md flex-col bg-[#f6f6f8] text-ink sm:m-3 sm:h-[calc(100%-1.5rem)] sm:rounded-[2rem]">
            <div className="flex items-center justify-between p-6 pb-3">
              <div><h2 className="text-2xl font-extrabold tracking-tight">Savat</h2><p className="text-sm text-black/45">{lines.reduce((s, l) => s + l.qty, 0)} ta mahsulot</p></div>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-black/5 transition hover:bg-black/5">✕</button>
            </div>
            <div className="flex-1 space-y-2.5 overflow-auto px-6 py-2">
              {lines.length === 0 && <p className="py-24 text-center font-medium text-black/40">Savat hozircha bo&apos;sh</p>}
              <AnimatePresence initial={false}>
                {lines.map(({ p, qty }) => (
                  <motion.div layout key={p.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, scale: 0.95 }} transition={{ duration: 0.3, ease }}
                    className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-black/[.04]">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-xl object-cover" />
                    ) : <span className="grid h-16 w-16 place-items-center text-3xl">{p.emoji}</span>}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{p.name}</div>
                      <div className="text-sm font-semibold text-black/50">{money(p.price * qty)}</div>
                    </div>
                    <div className="flex items-center rounded-full bg-black/5">
                      <button onClick={() => add(p.id, -1)} className="h-8 w-8 font-bold">−</button>
                      <span className="w-5 text-center text-sm font-bold">{qty}</span>
                      <button onClick={() => add(p.id, 1)} className="h-8 w-8 font-bold">+</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="p-6 pt-3">
              <div className="mb-4 flex items-center justify-between"><span className="font-semibold text-black/50">Jami</span><span className="text-2xl font-extrabold tracking-tight">{money(total)}</span></div>
              <button disabled={!lines.length} onClick={onCheckout} className="grad shine soft-lg w-full rounded-2xl py-4 font-bold text-white transition active:scale-[.98] disabled:opacity-40">Buyurtma berish</button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckoutModal({ open, onClose, lines, total, onDone }: { open: boolean; onClose: () => void; lines: Line[]; total: number; onDone: (r: { number: number; total: number }) => void }) {
  const [f, setF] = useState({ name: "", phone: "+998", address: "", comment: "" });
  const [promo, setPromo] = useState("");
  const [percent, setPercent] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const applyPromo = async (code: string) => {
    if (!code.trim()) { setPercent(0); setPromoMsg(""); return; }
    const r = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
    const d = await r.json();
    if (r.ok) { setPercent(d.percent); setPromo(d.code); setPromoMsg(`✓ ${d.percent}% chegirma qo'llandi`); }
    else { setPercent(0); setPromoMsg(d.error); }
  };
  useEffect(() => {
    if (!open) return;
    try { const c = localStorage.getItem("promo"); if (c) { setPromo(c); applyPromo(c); } } catch {}
  }, [open]);
  useEffect(() => {
    if (!open) return;
    fetch("/api/user").then((r) => r.json()).then((d) => {
      const u = d.user;
      if (u) setF((cur) => ({ name: cur.name || u.name, phone: cur.phone.length > 4 ? cur.phone : "+" + u.phone, address: cur.address || u.address, comment: cur.comment }));
    }).catch(() => {});
  }, [open]);

  const discount = Math.round((total * percent) / 100);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, promo: percent ? promo : "", items: lines.map((l) => ({ productId: l.p.id, qty: l.qty })) }) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error || "Xatolik");
    if (percent) { try { localStorage.removeItem("promo"); } catch {} setPercent(0); setPromo(""); setPromoMsg(""); }
    onDone(d);
  };
  const input = "w-full rounded-2xl bg-black/[.045] px-4 py-3.5 text-sm font-medium outline-none ring-1 ring-transparent transition placeholder:text-black/35 focus:bg-white focus:ring-brand/60";
  return (
    <AnimatePresence>
      {open && (
        <Overlay onClose={onClose}>
          <form onSubmit={submit} className="space-y-3 p-7">
            <h3 className="text-2xl font-extrabold tracking-tight">Buyurtmani tasdiqlash</h3>
            <p className="pb-2 text-sm text-black/45">Ma&apos;lumotlaringizni kiriting, operator siz bilan bog&apos;lanadi.</p>
            <input required className={input} placeholder="Ismingiz" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input required className={input} placeholder="Telefon" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <input required className={input} placeholder="Yetkazish manzili" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            <textarea className={input} rows={2} placeholder="Izoh (ixtiyoriy)" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
            <div>
              <div className="flex gap-2">
                <input className={`${input} uppercase`} placeholder="Promo-kod" value={promo} onChange={(e) => { setPromo(e.target.value); setPercent(0); setPromoMsg(""); }} />
                <button type="button" onClick={() => applyPromo(promo)} className="shrink-0 rounded-2xl bg-black/5 px-5 text-sm font-bold transition hover:bg-black/10">Qo&apos;llash</button>
              </div>
              {promoMsg && <p className={`mt-1.5 text-xs font-semibold ${percent ? "text-emerald-600" : "text-brand"}`}>{promoMsg}</p>}
              <Link href="/spin" className="mt-1 inline-block text-xs font-semibold text-black/40 hover:text-brand">🎡 Promo-kodingiz yo&apos;qmi? G&apos;ildirakni aylantiring</Link>
            </div>
            {err && <p className="text-sm font-medium text-brand">{err}</p>}
            <div className="space-y-1 pt-1">
              {discount > 0 && <div className="flex justify-between text-sm font-semibold text-emerald-600"><span>Chegirma</span><span>−{money(discount)}</span></div>}
              <div className="flex items-center justify-between"><span className="font-semibold text-black/50">Jami</span><span className="text-2xl font-extrabold tracking-tight">{money(total - discount)}</span></div>
            </div>
            <button disabled={busy} className="grad shine soft-lg w-full rounded-2xl py-4 font-bold text-white transition active:scale-[.98] disabled:opacity-60">{busy ? "Yuborilmoqda…" : "Tasdiqlash"}</button>
          </form>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
