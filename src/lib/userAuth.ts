import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readDB } from "./db";
import type { User } from "./types";

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
const mac = (id: string) => createHmac("sha256", secret()).update("user:" + id).digest("hex");

export const makeToken = (id: string) => `${id}.${mac(id)}`;

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex"), b = scryptSync(pw, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function normalizePhone(p: string) {
  const d = String(p || "").replace(/\D/g, "");
  return d.length === 9 ? "998" + d : d;
}

export async function getUser(): Promise<User | null> {
  const t = (await cookies()).get("user")?.value;
  if (!t) return null;
  const [id, sig] = t.split(".");
  if (!id || sig !== mac(id)) return null;
  return ((await readDB()).users ?? []).find((u) => u.id === id) ?? null;
}

export const publicUser = (u: User) => ({ id: u.id, name: u.name, phone: u.phone, address: u.address, createdAt: u.createdAt });

export const cookieOpts = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };
