import BlogBanner from "@/components/store-front/blog/BlogBanner";
import BlogPageGrid from "@/components/store-front/blog/BlogPageGrid";
import BlogPosts from "@/components/store-front/blog/BlogPosts";

export default function page() {
  return (
    <div>
      <BlogBanner />
      <BlogPosts />
      <BlogPageGrid />
    </div>
  );
}
