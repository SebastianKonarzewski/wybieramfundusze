import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Porównywarka",
  description: "Porównaj opłaty, stopy zwrotu i profile ryzyka do 4 funduszy obok siebie.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
