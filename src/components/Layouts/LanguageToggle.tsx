import { Languages } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
      title={language === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
      </span>
    </button>
  );
}
