import { User, Languages } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface HeaderProps {
  onProfileClick: () => void;
  className?: string;
}

export function Header({ onProfileClick, className = "" }: HeaderProps) {
  const { usuario } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header
      className={`bg-primary text-white px-8 py-4 flex justify-between items-center ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold">{t("header.appName")}</h1>
        <p className="text-sm text-gray-400">{t("header.appDescription")}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          title={language === "es" ? "Switch to English" : "Cambiar a Español"}
        >
          <Languages className="w-5 h-5" />
          <span className="text-sm font-medium">
            {language === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
          </span>
        </button>

        {usuario && (
          <button
            onClick={onProfileClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-sm">{t("header.myProfile")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
