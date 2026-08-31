
import Image from "next/image";

export default function BlogHero({ image }: { image: string }) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const blogImage = image.startsWith("http")
    ? image
    : `${backendBaseUrl}/${image.replace(/^\/+/, "")}`;

  return (
    <section className="max-w-[1720px] mx-auto">
      <div className="relative w-full h-[350px] md:h-[450px]">
        <Image
          src={blogImage}
          alt="Blog Banner"
          fill
          priority
          className="object-cover rounded-2xl"
          unoptimized
          sizes="100vw"
        />
      </div>
    </section>
  );
}
