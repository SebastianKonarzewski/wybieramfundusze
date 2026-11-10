import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { LocaleProvider } from "@/lib/i18n";
import { AccessibilityProvider } from "@/lib/accessibility";
import { ToastProvider } from "@/components/ToastContext";
import { CompareProvider } from "@/components/CompareContext";
import { PortfolioProvider } from "@/components/PortfolioContext";
import { PortfolioToast } from "@/components/PortfolioToast";
import { BackToTop } from "@/components/BackToTop";
import { CookieBanner } from "@/components/CookieBanner";
import { PrivacyModal } from "@/components/PrivacyModal";

export const metadata: Metadata = {
  title: {
    default: "Wybieram Fundusze",
    template: "%s | Wybieram Fundusze",
  },
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
            __html: `(function(){try{var t=localStorage.getItem('theme_mode');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}var a=localStorage.getItem('a11y_preferences');if(a){var p=JSON.parse(a);if(p.reducedMotion)document.documentElement.classList.add('reduced-motion');if(p.highContrast)document.documentElement.classList.add('high-contrast');if(p.fontSize&&p.fontSize!=='normal')document.documentElement.classList.add('text-scale-'+p.fontSize);}else if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('reduced-motion');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#030a16] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-300">
        <ThemeProvider>
          <LocaleProvider>
            <AccessibilityProvider>
              <ToastProvider>
                <CompareProvider>
                  <PortfolioProvider>
                    {children}
                    <PortfolioToast />
                    <BackToTop />
                    <CookieBanner />
                    <PrivacyModal />
                  </PortfolioProvider>
                </CompareProvider>
              </ToastProvider>
            </AccessibilityProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
