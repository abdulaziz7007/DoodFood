import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoodFood — tez va mazali yetkazib berish",
  description: "Lavash, shaurma, burger, pitsa va boshqa mazali taomlar. Uyingizgacha yetkazib beramiz.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
