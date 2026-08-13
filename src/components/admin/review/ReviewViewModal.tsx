import { Star, X } from "lucide-react";
import Image from "next/image";

function resolveImageUrl(img: string, fallback: string) {
  if (!img) return fallback;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  const cleanPath = img.startsWith("/") ? img : `/${img}`;
  return `${baseUrl}${cleanPath}`;
}

export default function ReviewViewModal({
  reviewItem,
  productName,
  productImage,
  FALLBACK_AVATAR,
  onClose,
}: {
  reviewItem: {
    id: string;
    name: string;
    star: number;
    comment: string;
    createdAt: string;
    status: string;
    image: string;
    rawImages: string[];
  };
  productName?: string;
  productImage?: string;
  FALLBACK_AVATAR: string;
  onClose: () => void;
}) {
  const images = reviewItem.rawImages || [];
  const heroUrl =
    images.length > 0
      ? resolveImageUrl(images[0], FALLBACK_AVATAR)
      : FALLBACK_AVATAR;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] relative font-poppins px-6 pb-6 pt-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Product info */}
        {(productName || productImage) && (
          <div className="flex items-center gap-2.5 bg-[#F9F9F9] rounded-[10px] p-2 mb-4 mt-1">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm text-black font-medium">Product</span>
              <span className="text-[13px] font-medium text-[#A2A2A2] truncate max-w-[260px]">
                {productName || "N/A"}
              </span>
            </div>
          </div>
        )}

        {/* Hero image */}
        <div className="relative w-full aspect-[16/10] rounded-[14px] overflow-hidden bg-gray-50 border border-gray-100 mb-3">
          <Image
            src={heroUrl}
            alt="Review image"
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
            }}
            unoptimized
          />
          {images.length > 1 && (
            <span className="absolute top-2.5 right-2.5 bg-black/65 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              +{images.length - 1} more
            </span>
          )}
        </div>

        {/* Thumbnail strip (view only, no remove button) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-100"
              >
                <Image
                  src={resolveImageUrl(img, FALLBACK_AVATAR)}
                  alt={`Review ${index}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-[#000000] block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={reviewItem.name}
              disabled
              className="w-full bg-[#F9F9F9] rounded-[10px] p-3 text-sm font-medium text-[#A2A2A2] opacity-80 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-[#000000] block">
                Review
              </label>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    fill={s <= reviewItem.star ? "#FFA500" : "transparent"}
                    className={
                      s <= reviewItem.star ? "text-[#FFA500]" : "text-gray-300"
                    }
                  />
                ))}
                <span className="text-xs text-gray-500 font-bold ml-1">
                  ({reviewItem.star}.0)
                </span>
              </div>
            </div>
            <div className="w-full bg-[#F9F9F9] rounded-[12px] p-3 text-sm text-[#A2A2A2] min-h-[100px]">
              {reviewItem.comment}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#000000] block mb-1.5">
              Date
            </label>
            <input
              type="text"
              value={reviewItem.createdAt}
              disabled
              className="w-full bg-[#F9F9F9] rounded-[10px] p-3 text-sm font-medium text-[#A2A2A2] opacity-80 outline-none cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
