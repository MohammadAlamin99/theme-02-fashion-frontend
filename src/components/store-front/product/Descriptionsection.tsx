import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";

interface DescriptionProps {
  content?: string | null;
}

const DescriptionSection = ({ content }: DescriptionProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  if (!content)
    return <p className="text-[#727272]">{t.description.noDescription}</p>;

  return (
    <div className="w-full font-poppins">
      <div
        className="prose prose-sm sm:prose-base max-w-none
          prose-p:text-[#4A4A4A] prose-p:leading-relaxed prose-p:mb-3
          prose-headings:text-black prose-headings:font-bold
          prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-3
          prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-3
          prose-li:text-[#4A4A4A] prose-li:mb-1
          prose-strong:text-black
          prose-a:text-blue-600 prose-a:underline
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-500
          prose-img:rounded-lg prose-img:mx-auto
        "
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default DescriptionSection;
