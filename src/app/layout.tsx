import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wybieram Fundusze — Porównywarka i Rejestr Funduszy KNF",
  description:
    "Kompleksowa przeglądarka i porównywarka funduszy inwestycyjnych (FIO, SFIO, FIZ, ETF) oparta o oficjalne publiczne API Urzędu Komisji Nadzoru Finansowego (UKNF).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#030a16] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-300">
        {children}
      </body>
    </html>
  );
}
