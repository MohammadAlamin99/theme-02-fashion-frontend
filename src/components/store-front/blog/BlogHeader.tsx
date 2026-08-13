
"use client";
import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatDistanceToNow } from "date-fns";

const BlogHeader = ({
  title,
  author,
  date,
}: {
  title: string;
  author: string;
  date: string;
}) => {
    const { language } = useLanguage();
    const t = translations[language];
  return (
    <section className="w-full bg-white pt-10 pb-8 px-4 md:px-10">
      <div className="container mx-auto">
        <p className="text-[#8C8C8C] font-inter text-[14px] md:text-[16px] mb-4 font-medium">
          {author} - {date ? formatDistanceToNow(new Date(date)) : ""} {t.blog.ago}
        </p>
        <h1 className="text-[#000000] font-poppins text-[18px] md:text-[32px] lg:text-[36px] font-bold leading-[1.2] mb-8">
          {title}
        </h1>
        {/* <div className="flex flex-wrap items-center gap-6 md:gap-10 border-b border-[#F2F2F2] pb-8">
          <div className="flex items-center gap-2">
            <FaEye className="text-[#FF7050] text-lg" />
            <span className="text-[#585858] font-inter text-[14px] md:text-[15px] font-medium">
              {views} Viewed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaBookOpen className="text-[#FF7050] text-lg" />
            <span className="text-[#585858] font-inter text-[14px] md:text-[15px] font-medium">
              5 min read
            </span>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default BlogHeader;
