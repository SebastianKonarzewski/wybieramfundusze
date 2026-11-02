import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-base text-slate-100">
                Wybieram<span className="text-emerald-400">Fundusze</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Niezależna platforma analityczna i porównywarka funduszy inwestycyjnych, ułatwiająca analizę kosztów, poziomów ryzyka SRI oraz historycznych wyników na polskim rynku kapitałowym.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3">
              Oficjalne źródła danych UKNF
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://wybieramfundusze-api.knf.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  wybieramfundusze-api.knf.gov.pl
                </a>
              </li>
              <li>
                <a
                  href="https://wybieramfundusze.knf.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Portal UKNF „Wybieram Fundusze”
                </a>
              </li>
              <li>
                <a
                  href="https://wybieramfundusze-api.knf.gov.pl/documentation.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Dokumentacja techniczna API v1.0
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Nota prawna i regulamin
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prezentowane dane pochodzą z publicznych rejestrów Urzędu Komisji Nadzoru Finansowego (UKNF). Serwis ma charakter czysto informacyjny i edukacyjny. Informacje te nie stanowią porady inwestycyjnej ani oferty w rozumieniu Kodeksu cywilnego.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} WybieramFundusze. Dane źródłowe: Urząd Komisji Nadzoru Finansowego.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-200">
              Katalog
            </Link>
            <Link href="/porownywarka" className="hover:text-slate-200">
              Porównywarka
            </Link>
            <Link href="/tfi" className="hover:text-slate-200">
              Towarzystwa Funduszy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

