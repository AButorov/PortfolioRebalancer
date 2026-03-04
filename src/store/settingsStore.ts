import { create } from "zustand";
import type { Lang, Translations } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

type Theme = "light" | "dark";
export type PriceMode = "previousClose" | "lastTrade";

interface SettingsState {
  theme: Theme;
  lang: Lang;
  t: Translations;
  priceMode: PriceMode;
  toggleTheme: () => void;
  toggleLang: () => void;
  setPriceMode: (mode: PriceMode) => void;
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const savedTheme =
  (localStorage.getItem("pr-theme") as Theme | null) ?? "light";
const savedLang = (localStorage.getItem("pr-lang") as Lang | null) ?? "ru";
const savedPriceMode =
  (localStorage.getItem("pr-price-mode") as PriceMode | null) ??
  "previousClose";

applyTheme(savedTheme);

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: savedTheme,
  lang: savedLang,
  t: translations[savedLang],
  priceMode: savedPriceMode,

  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem("pr-theme", next);
      return { theme: next };
    }),

  toggleLang: () =>
    set((s) => {
      const next: Lang = s.lang === "ru" ? "en" : "ru";
      localStorage.setItem("pr-lang", next);
      return { lang: next, t: translations[next] };
    }),

  setPriceMode: (mode) => {
    localStorage.setItem("pr-price-mode", mode);
    set({ priceMode: mode });
  },
}));
