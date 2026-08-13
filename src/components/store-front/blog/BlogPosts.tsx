"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "@/services-api/blogService";

interface Author {
  name: string;
  avatar: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  meta_description: string;
  created_at: string;
  author: Author;
}

const BlogPosts = () => {
  const router = useRouter();

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // Fetch Blogs using TanStack Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs", 1, 10],
    queryFn: () => getBlogs(1, 10),
  });

  const posts: Blog[] = (data?.data?.data as unknown as Blog[]) || [];

  // Logic to calculate read time
  const getReadTime = (htmlContent: string): string => {
    const wordsPerMinute = 200;
    const text = htmlContent?.replace(/<[^>]*>/g, "") || "";
    const wordCount = text.split(/\s+/).length;
    const time = Math.ceil(wordCount / wordsPerMinute);
    return `${time} min read`;
  };

  // Logic to format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24 && diffInHours > 0) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading)
    return <div className="w-full py-20 text-center">Loading...</div>;
  if (isError) return null;

  return (
    <section className="w-full py-10 px-4 md:px-10 bg-white">
      <div className="max-w-[1720px] mx-auto">
        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col bg-white rounded-[24px] overflow-hidden border border-transparent hover:border-[#F2F2F2] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] cursor-pointer"
              onClick={() => router.push(`/blog/${post.slug}`)}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-[24px]">
                <Image
                  src={
                    post.featured_image?.startsWith("http")
                      ? post.featured_image
                      : `${backendBaseUrl}${post.featured_image}`
                  }
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>

              {/* Content Container */}
              <div className="flex flex-col p-4 md:p-6">
                {/* Meta Data */}
                <div className="flex flex-wrap justify-between mb-3 items-center">
                  <div className="flex flex-wrap gap-2">
                    <div className="relative w-6 h-6 rounded-full">
                      <Image
                        src={
                          post.author.avatar?.startsWith("http")
                            ? post.author.avatar
                            : `${backendBaseUrl}${post.author.avatar}`
                        }
                        alt={post.title}
                        fill
                        className="object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                    <p className="text-[#8C8C8C] font-inter text-[14px] font-medium">
                      {post.author.name} - {formatDate(post.created_at)}
                    </p>
                  </div>
                  <p className="text-[#8C8C8C] font-inter text-[14px] font-medium">
                    {getReadTime(post.content)}
                  </p>
                </div>
                {/* Title */}
                <h3 className="text-black font-poppins text-[18px] md:text-[22px] font-semibold leading-[1.4] mb-4 hover:text-[#FF7050] transition-colors cursor-pointer line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt (Dynamic from meta_description) */}
                <p className="text-[#585858] font-inter text-[14px] md:text-[15px] leading-relaxed line-clamp-2">
                  {post.meta_description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPosts;
