import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { LocaleProvider } from "@/lib/i18n";
import { AccessibilityProvider } from "@/lib/accessibility";
import { CookieBanner } from "@/components/CookieBanner";
import { PrivacyModal } from "@/components/PrivacyModal";

export const metadata: Metadata = {
  title: "Wybieram Fundusze — Porównywarka i Rejestr Funduszy KNF",
  description:
    "Kompleksowa przeglądarka i porównywarka funduszy inwestycyjnych (FIO, SFIO, FIZ, ETF) oparta o oficjalne publiczne API Urzędu Komisji Nadzoru Finansowego (UKNF).",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme_mode');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#030a16] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-300">
        <ThemeProvider>
          <LocaleProvider>
            <AccessibilityProvider>
              {children}
              <CookieBanner />
              <PrivacyModal />
            </AccessibilityProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
