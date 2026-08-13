import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";

export default function FilterHeader({ onReset }: { onReset: () => void }) {
    const { language } = useLanguage();
    const t = translations[language];
  return (
    <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-4">
    <h3 className="text-black md:text-[32px] text-xl font-medium">{t.filter.title}</h3>
      <button
        onClick={onReset}
        className="text-[#008CFF] md:text-[24px] text-lg font-medium hover:underline"
      >
        {t.filter.reset}
      </button>
    </div>
  );
}
