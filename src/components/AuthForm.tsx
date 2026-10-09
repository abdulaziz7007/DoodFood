"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const reg = mode === "register";
  const [f, setF] = useState({ name: "", phone: "+998", password: "", address: "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch(`/api/user/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error || "Xatolik");
    router.push("/profile");
    router.refresh();
  };

  const input = "w-full rounded-2xl bg-black/[.045] px-4 py-3.5 font-medium outline-none ring-1 ring-transparent transition placeholder:text-black/35 focus:bg-white focus:ring-brand/60";
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-white/10" />
        <Link href="/" className="relative text-2xl font-extrabold tracking-tight">🌯 DoodFood</Link>
        <div className="relative">
          <motion.div animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 5 }} className="text-[9rem] leading-none drop-shadow-2xl">🌯</motion.div>
          <h2 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight">{reg ? "Bizga qo'shiling va bonus oling" : "Qaytganingizdan xursandmiz!"}</h2>
          <ul className="mt-6 space-y-2 font-medium text-white/85">
            <li>✓ Buyurtmalar tarixi va qayta buyurtma</li>
            <li>✓ Manzil avtomatik to&apos;ldiriladi</li>
            <li>✓ Sodiqlik darajasi va maxsus promo-kodlar</li>
          </ul>
        </div>
        <div className="relative text-sm text-white/70">© DoodFood</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-sm space-y-4">
          <Link href="/" className="text-sm font-semibold text-black/40 hover:text-ink lg:hidden">← Saytga qaytish</Link>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{reg ? "Ro'yxatdan o'tish" : "Kirish"}</h1>
            <p className="mt-1 text-black/50">{reg ? "Hisob yarating — 1 daqiqa vaqt oladi." : "Telefon raqamingiz va parolingizni kiriting."}</p>
          </div>

          <AnimatePresence initial={false}>
            {reg && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <input required className={input} placeholder="Ismingiz" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </motion.div>
            )}
          </AnimatePresence>
          <input required className={input} placeholder="Telefon (+998 90 123 45 67)" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <div className="relative">
            <input required minLength={6} type={show ? "text" : "password"} className={input} placeholder="Parol (kamida 6 belgi)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-black/40 hover:text-ink">{show ? "Yashirish" : "Ko'rsatish"}</button>
          </div>
          {reg && <input className={input} placeholder="Yetkazish manzili (ixtiyoriy)" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />}

          <AnimatePresence>
            {err && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: [-8, 8, -4, 4, 0] }} exit={{ opacity: 0 }} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{err}</motion.p>}
          </AnimatePresence>

          <button disabled={busy} className="shine w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-4 font-bold text-white shadow-xl shadow-rose-500/25 transition active:scale-[.98] disabled:opacity-60">{busy ? "Kuting…" : reg ? "Ro'yxatdan o'tish" : "Kirish"}</button>
          <p className="text-center text-sm text-black/50">
            {reg ? "Hisobingiz bormi? " : "Hisobingiz yo'qmi? "}
            <Link href={reg ? "/login" : "/register"} className="font-bold text-brand hover:underline">{reg ? "Kirish" : "Ro'yxatdan o'tish"}</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
