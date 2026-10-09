import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kirish — DoodFood" };

export default async function Page() {
  if (await getUser()) redirect("/profile");
  return <AuthForm mode="login" />;
}
