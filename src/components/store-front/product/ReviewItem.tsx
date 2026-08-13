import { FaStar } from "react-icons/fa";
import { HiBadgeCheck } from "react-icons/hi";
import Image from "next/image";

interface ReviewItemProps {
  name: string;
  avatar?: string | null;
  rating: number;
  comment: string;
  images: string[];
  is_verified: boolean;
  date?: string;
}

export default function ReviewItem({
  name,
  avatar,
  rating,
  comment,
  images,
  is_verified,
  date,
}: ReviewItemProps) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // --- Avatar Logic ---
  let finalAvatarUrl = "/images/user.png";

  if (avatar && avatar.trim() !== "") {
    finalAvatarUrl = avatar.startsWith("http")
      ? avatar
      : `${backendBaseUrl}/${avatar.replace(/^\/+/, "")}`;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start pb-8 border-b border-gray-100 last:border-0 last:pb-0">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 min-w-[220px]">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 relative">
          <Image
            src={finalAvatarUrl}
            alt={name || "user"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div>
          <h4 className="font-semibold text-base md:text-[18px] leading-tight text-black">
            {name || "Anonymous"}
          </h4>
          {is_verified && (
            <div className="flex items-center gap-1 text-[#8C8C8C] text-xs font-semibold mt-1">
              <HiBadgeCheck className="text-[#FF7050]" size={16} />
              <span>Verified Buyer</span>
            </div>
          )}
          {date && (
            <p className="text-gray-400 text-[10px] mt-1">
              {new Date(date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Comment & Images */}
      <div className="flex-1 space-y-4">
        <p className="text-base md:text-[18px] text-gray-700 leading-relaxed">
          {comment}
        </p>

        {/* Dynamic Image Gallery */}
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, index) => {
              if (!img) return null;
              const imageUrl = img.startsWith("http")
                ? img
                : `${backendBaseUrl}/${img.replace(/^\/+/, "")}`;
              return (
                <div
                  key={index}
                  className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 border"
                >
                  <Image
                    src={imageUrl}
                    alt={`Review attachment ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform cursor-pointer"
                    unoptimized
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
        <span className="md:text-[40px] text-[24px] font-bold text-[#FF7050]">
          {rating}.0
        </span>
        <div className="flex text-[#FFB800] text-lg gap-[2px]">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < rating ? "fill-current" : "text-gray-300"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
