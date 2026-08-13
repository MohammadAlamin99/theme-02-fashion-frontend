import BlogBody from "@/components/store-front/blog/BlogBody";
import BlogHeader from "@/components/store-front/blog/BlogHeader";
import BlogHero from "@/components/store-front/blog/BlogHero";
import { getBlogBySlug } from "@/services-api/blogService";

export default async function BlogDetailsManagement({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const response = await getBlogBySlug(resolvedParams.slug);
  const blog = response?.data;

  if (!blog) return <div>Loading...</div>;

  return (
    <div>
      <BlogHero image={blog.featured_image} />
      <BlogHeader
        title={blog.title}
        author={blog.author?.name}
        date={blog.created_at}
      />
      <BlogBody
        content={blog.content}
        relatedProducts={blog.related_products}
      />
    </div>
  );
}
