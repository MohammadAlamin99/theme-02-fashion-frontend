import BlogDetailsManagement from "./BlogDetailsManagement";

export default function page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div>
      <BlogDetailsManagement params={params} />
    </div>
  );
}
