import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Profile from "@/components/Profile";
import { getUser, publicUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil — DoodFood" };

export default async function Page() {
  const u = await getUser();
  if (!u) redirect("/login");
  return <Profile initial={publicUser(u)} />;
}
