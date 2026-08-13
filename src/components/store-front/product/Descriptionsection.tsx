import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";

interface DescriptionProps {
  content: string | null;
}

const DescriptionSection = ({ content }: DescriptionProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  if (!content)
    return <p className="text-[#727272]">{t.description.noDescription}</p>;

  return (
    <div className="w-full font-poppins">
      <div
        className="
          prose prose-sm sm:prose-base max-w-none
          prose-ul:list-disc prose-ul:list-inside
          prose-ol:list-decimal prose-ol:list-inside

          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:block
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:block
          [&_li]:mb-1 [&_li]:text-[#4A4A4A]

          prose-p:text-[#4A4A4A] prose-p:mb-4
          prose-headings:text-black prose-headings:font-bold
        "
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default DescriptionSection;