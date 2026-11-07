import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Towarzystwa TFI",
  description: "Katalog licencjonowanych Towarzystw Funduszy Inwestycyjnych (TFI) zarejestrowanych w UKNF.",
};

export default function TfiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
