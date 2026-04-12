import { useLanguage } from "@/contexts/LanguageContext";

const langs = [
  { code: "uz" as const, label: "UZ" },
  { code: "ru" as const, label: "RU" },
  { code: "en" as const, label: "EN" },
];

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 glass rounded-full px-1 py-1">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
            lang === l.code
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
