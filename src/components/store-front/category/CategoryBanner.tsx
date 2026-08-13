interface CategoryBannerProps {
  categoryName?: string | null;
  description?: string | null;
  bannerImage?: string | null;
}

export default function CategoryBanner({
  categoryName,
  description,
  bannerImage,
}: CategoryBannerProps) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";
  const rowImage = bannerImage || "";
  const Banner = rowImage.startsWith("http")
    ? rowImage
    : rowImage
    ? `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`
    : "";

  return (
    <div
      className="w-full h-[180px] md:h-[220px] rounded-2xl relative overflow-hidden
    flex items-center px-8 md:px-16 bg-cover bg-center bg-[#FF7050]"
      style={{
        backgroundImage: Banner
          ? `url(${Banner})`
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="z-10 text-white">
        <h1 className="text-3xl md:text-5xl font-semibold mb-2 font-poppins">
          {categoryName}
        </h1>
        <p className="text-[#B1B1B1] font-medium text-xl font-poppins mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
