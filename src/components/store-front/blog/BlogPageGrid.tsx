
"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "@/services-api/blogService";

interface Author {
  name: string;
  avatar: string;
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  created_at: string;
  author: Author;
}

const BlogPageGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs", currentPage],
    queryFn: () => getBlogs(currentPage, 12),
  });

  const posts: BlogItem[] = (data?.data?.data as unknown as BlogItem[]) || [];
  const meta = data?.data?.meta;

  // Helper to format date into 
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24 && diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInHours === 0) return "Just now";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading)
    return <div className="w-full py-20 text-center">Loading Grid...</div>;
  if (isError) return null;

  return (
    <section className="w-full pt-10 px-4 md:px-10 bg-white font-inter mb-10">
      <div className="max-w-[1720px] mx-auto">
        {/* Main Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {posts.map((item) => {
            // Construct dynamic image URL
            const imageUrl = item.featured_image?.startsWith("http")
              ? item.featured_image
              : `${backendBaseUrl}${item.featured_image}`;

            return (
              <div
                key={item.id}
                className="flex flex-col group cursor-pointer"
                onClick={() => router.push(`/blog/${item.slug}`)}
              >
                {/* Image with Rounded Corners */}
                <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden mb-5 bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </div>

                {/* Metadata */}
                <p className="text-[#8C8C8C] text-[13px] font-medium mb-3">
                  {item.author.name} - {formatTimeAgo(item.created_at)}
                </p>

                {/* Title */}
                <h3 className="text-black text-[18px] md:text-[20px] font-bold leading-[1.4] line-clamp-2 hover:text-[#FF7050] transition-colors">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* --- Dynamic Pagination --- */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-20 mb-10">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                    currentPage === pageNum
                      ? "bg-[#FF7050] text-white"
                      : "bg-[#FDF1EE] text-[#727272] hover:bg-[#FF7050] hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPageGrid;
