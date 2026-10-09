"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { readCart } from "@/lib/cartStore";
import UserChip from "./UserChip";

export const links = [
  { href: "/aksiyalar", label: "Aksiyalar", emoji: "🔥" },
  { href: "/spin", label: "Omad g'ildiragi", emoji: "🎡" },
  { href: "/quiz", label: "Nima yeyman?", emoji: "🤔" },
  { href: "/track", label: "Kuzatish", emoji: "📦" },
  { href: "/filiallar", label: "Filiallar", emoji: "📍" },
];

export function SiteHeader() {
  const path = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const upd = () => setCount(Object.values(readCart()).reduce((s, n) => s + n, 0));
    upd();
    window.addEventListener("cart-change", upd);
    return () => window.removeEventListener("cart-change", upd);
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-lg shadow-lg shadow-brand/30">🌯</span>
          <span className="text-lg font-extrabold tracking-tight">Dood<span className="text-brand">Food</span></span>
        </Link>
        <nav className="no-scrollbar ml-4 hidden flex-1 gap-1 overflow-x-auto lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${path === l.href ? "text-white" : "text-black/55 hover:text-ink"}`}>
              {path === l.href && <motion.span layoutId="nav" className="absolute inset-0 rounded-full bg-ink" />}
              <span className="relative">{l.emoji} {l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2"><UserChip /><Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black">
          Menyu{count > 0 && <span className="ml-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2 py-0.5 text-xs">🛒 {count}</span>}
        </Link></div>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${path === l.href ? "bg-ink text-white" : "bg-white text-black/60 ring-1 ring-black/5"}`}>{l.emoji} {l.label}</Link>
        ))}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-10 text-sm text-black/50 sm:flex-row">
        <span className="text-base font-extrabold text-ink">Dood<span className="text-brand">Food</span></span>
        <span>Har kuni 10:00 — 23:00 · +998 71 200 00 00 · Toshkent</span>
      </div>
    </footer>
  );
}

export function PageTitle({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:pt-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div className="mb-3 inline-grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl shadow-lg ring-1 ring-black/5">{emoji}</div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-xl text-black/50">{sub}</p>
      </motion.div>
    </div>
  );
}
