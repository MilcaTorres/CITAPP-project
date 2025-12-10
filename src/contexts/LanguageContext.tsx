import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import es from "../locales/es.json";
import en from "../locales/en.json";

type Language = "es" | "en";

type Translations = typeof es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations: Record<Language, Translations> = {
  es,
  en,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to Spanish
    const stored = localStorage.getItem("citapp_language");
    return stored === "en" || stored === "es" ? stored : "es";
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("citapp_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "es" ? "en" : "es"));
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
