import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfel",
  description: "Buduj własny portfel funduszy, testuj historyczne stopy zwrotu i analizuj wpływ opłat.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
