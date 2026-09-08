import { Category } from "@/@types/filter.type";
import Image from "next/image";
import Link from "next/link";
export default function CategoryCard({ category }: { category: Category }) {
  const categoryLink = category.slug
    ? `/category/${category.slug}`
    : "/category";

  return (
    <Link href={categoryLink}>
      <div className="relative overflow-hidden rounded-sm cursor-pointer group w-full">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#f2f2f2] group">
          <Image
            src={category.image || "/images/placeholder.svg"} // ফলব্যাক ইমেজ সহ
            alt={category.label}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* Label overlay — matches Figma: absolute bottom, frosted glass */}
        <div
          className="absolute bottom-0 right-0 left-0 flex flex-col justify-center items-center border border-[#EFEFEF]/20"
          style={{
            height: "53px",
            padding: "10px 20px",
            background: "rgba(239, 239, 239, 0.20)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <span
            className="font-inter font-bold text-[11px] sm:text-[13px] text-black text-center leading-tight select-none uppercase"
            style={{ letterSpacing: "0.12em" }}
          >
            {category.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
