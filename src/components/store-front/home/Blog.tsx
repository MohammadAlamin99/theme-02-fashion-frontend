
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ViewButton from "../common/ViewButton";
import { getBlogs } from "@/services-api/blogService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const Blog: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const router = useRouter();

  // 1. TanStack Query fetching
  const { data: blogResponse, isLoading } = useQuery({
    queryKey: ["public-blogs", 1, 4],
    queryFn: () => getBlogs(1, 4),
  });

  const backendBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
      "http://localhost:8082",
    [],
  );

  // 2. Data processing (Images and Dates)
  const processedBlogs = useMemo(() => {
    const rawBlogs = blogResponse?.data?.data;
    if (!Array.isArray(rawBlogs)) return [];

    return rawBlogs.map((blog) => {
      // Image Processing
      const img = blog.featured_image || "";
      const usableImage = img.startsWith("http")
        ? img
        : `${backendBaseUrl}/${img.replace(/^\/+/, "")}`;

      // Date Formatting (Example: 2026-01-10 -> 10th Jan 2026)
      const dateObj = new Date(blog.created_at);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("en-US", { month: "long" });
      const year = dateObj.getFullYear();

      const st = (n: number) => {
        if (n > 3 && n < 21) return "th";
        switch (n % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      return {
        ...blog,
        displayImage: usableImage,
        displayDate: `${day}${st(day)} ${month} ${year}`,
      };
    });
  }, [blogResponse, backendBaseUrl]);

  if (isLoading || processedBlogs.length === 0) return null;

  return (
    <section className="font-poppins md:pb-20 pb-10 px-6">
      <div className="max-w-[1720px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-medium text-black">
            {t.blog.title}
          </h2>
          <ViewButton onClick={() => router.push("/blog")} />
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {processedBlogs.map((blog) => (
            <div
              key={blog.id}
              className="group cursor-pointer"
              onClick={() => router.push(`/blog/${blog.slug}`)}
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 mb-4 overflow-hidden rounded-[20px] bg-gray-100">
                <Image
                  src={blog.displayImage || "/images/placeholder.svg"}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-black mb-3 leading-tight line-clamp-2">
                {blog.title}
              </h3>

              {/* Footer: Date & Read More */}
              <div className="flex justify-between items-center flex-wrap gap-3">
                <span className="text-sm md:text-lg text-[#5E5E5E] font-normal">
                  {blog.displayDate}
                </span>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="flex items-center gap-1 text-[12px] font-normal text-[#5E5E5E] hover:text-black transition-colors border-b border-gray-400 hover:border-black"
                >
                  {t.blog.readMore}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="12"
                    viewBox="0 0 21 12"
                    fill="none"
                  >
                    <path
                      d="M0.800781 5.09751C0.358441 5.09751 -0.000147462 5.4561 -0.000147462 5.89844C-0.000147462 6.34078 0.358441 6.69937 0.800781 6.69937V5.89844V5.09751ZM20.5894 6.46478C20.9022 6.152 20.9022 5.64488 20.5894 5.3321L15.4923 0.235016C15.1796 -0.0777659 14.6724 -0.0777659 14.3596 0.235016C14.0469 0.547798 14.0469 1.05492 14.3596 1.3677L18.8904 5.89844L14.3596 10.4292C14.0469 10.742 14.0469 11.2491 14.3596 11.5619C14.6724 11.8746 15.1796 11.8746 15.4923 11.5619L20.5894 6.46478ZM0.800781 5.89844V6.69937H20.0231V5.89844V5.09751H0.800781V5.89844Z"
                      fill="currentColor"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
