import { cookies } from "next/headers";
import { createHmac } from "crypto";

const secret = () => process.env.ADMIN_PASSWORD || "admin123";
export const sign = () => createHmac("sha256", secret()).update("admin-session").digest("hex");

export async function isAdmin() {
  const c = await cookies();
  return c.get("admin")?.value === sign();
}
export const checkPassword = (p: string) => p === secret();
