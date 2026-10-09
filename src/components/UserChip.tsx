"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function UserChip() {
  const [name, setName] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then((d) => setName(d.user?.name ?? null)).catch(() => setName(null));
  }, []);
  if (name === undefined) return <span className="h-10 w-10" />;
  if (!name) return <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-black/60 ring-1 ring-black/10 transition hover:bg-black/5 hover:text-ink">Kirish</Link>;
  return (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <Link href="/profile" title={name} className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-sm font-extrabold text-white shadow-lg shadow-rose-500/30 transition hover:scale-110">
        {name.trim()[0]?.toUpperCase()}
      </Link>
    </motion.div>
  );
}
