
import Image from "next/image";

export default function BlogHero({ image }: { image: string }) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const blogImage = image.startsWith("http")
    ? image
    : `${backendBaseUrl}/${image.replace(/^\/+/, "")}`;

  return (
    <section className="w-full">
      <div className="relative w-full h-[300px] md:h-[500px] lg:h-[724px]">
        <Image
          src={blogImage}
          alt="Blog Banner"
          fill
          priority
          className="object-cover"
          unoptimized
          sizes="100vw"
        />
      </div>
    </section>
  );
}
