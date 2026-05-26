import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
] as const;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    document.body.setAttribute("data-lang", code);
    document.documentElement.lang = code;
  };

  return (
    <div className="lang-switcher">
      <label className="sidebar-title">{t("sidebar.language")}</label>
      <select
        value={i18n.language?.slice(0, 2) ?? "ko"}
        onChange={(e) => handleChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
