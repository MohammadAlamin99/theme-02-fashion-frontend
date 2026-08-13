import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";

export default function BlogComments() {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <section className="container mx-auto px-4 md:mt-20 mt-10 bg-[#FAFAFA] md:bg-transparent rounded-3xl md:mb-20 mb-10">
      <h3 className="text-black font-poppins text-2xl font-bold mb-2">
      {t.blogComments.title}
      </h3>
      <p className="text-[#8C8C8C] text-sm mb-8">
        {t.blogComments.subtitle}
      </p>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 ml-1">
            {t.blogComments.nickname}
          </label>
          <input
            type="text"
            placeholder={t.blogComments.nicknamePlaceholder}
            className="w-full bg-white border border-gray-200 p-4 rounded-xl outline-none focus:border-[#FF7050] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 ml-1">{t.blogComments.email}</label>
          <input
            type="email"
            placeholder={t.blogComments.emailPlaceholder}
            className="w-full bg-white border border-gray-200 p-4 rounded-xl outline-none focus:border-[#FF7050] transition-colors"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 ml-1">
            {t.blogComments.comment}
          </label>
          <textarea
            rows={5}
            placeholder={t.blogComments.commentPlaceholder}
            className="w-full bg-white border border-gray-200 p-4 rounded-xl outline-none focus:border-[#FF7050] transition-colors resize-none"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button className="bg-[#FF7050] text-white md:px-10 px-5 py-4 rounded-xl font-semibold shadow-orange-200 hover:opacity-90 transition-all">
            {t.blogComments.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
