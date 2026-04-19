import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relais — Accompagner les fins de suivi",
  description:
    "Relais aide les thérapeutes indépendants à recueillir les retours de leurs patients en fin de suivi, de façon neutre et bienveillante.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
