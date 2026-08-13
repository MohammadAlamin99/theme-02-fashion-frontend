import { UseMutationResult } from "@tanstack/react-query";
import { Star, Loader2, X, Plus } from "lucide-react";
import Image from "next/image";

export type ReviewStatus = string;

export interface ReviewUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
}

export interface ReviewProduct {
  id: string;
  name: string;
  images: string[];
  slug: string;
}

export interface Review {
  id: string;
  product_id?: string;
  user_id?: string;
  name: string;
  phone_number?: string;
  email?: string;
  rating?: number;
  comment: string;
  images?: string[];
  image?: string | null;
  status: ReviewStatus;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  user?: ReviewUser;
  product?: ReviewProduct;
}

export type ReviewItem = Review;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedReviews {
  meta: PaginationMeta;
  data: ReviewItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export type ReviewsResponse = ApiResponse<PaginatedReviews>;

// 🚀 FIXED: Interface now includes createdAt
export interface UpdateReviewVariables {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface CreateReviewPayload {
  product_id: string;
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  comment: string;
  images?: string[];
}

export default function ReviewModal({
  activeReviewItem,
  setIsEditModalOpen,
  setEditingReviewId,
  isUploadingImage,
  modalFileRef,
  handleModalImageReplacement,
  editRating,
  setEditRating,
  editComment,
  setEditComment,
  editDate, // 🚀 NEW PROP: Functional Date
  setEditDate, // 🚀 NEW PROP: Date Setter
  updateReviewMutation,
  modalImages,
  editingReviewId,
  removeImage,
}: {
  activeReviewItem: ReviewItem;
  FALLBACK_AVATAR: string;
  setIsEditModalOpen: (open: boolean) => void;
  setEditingReviewId: (id: string | null) => void;
  isUploadingImage: boolean;
  modalFileRef: React.RefObject<HTMLInputElement | null>;
  handleModalImageReplacement: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editRating: number;
  editComment: string;
  editDate: string; // 🚀 ADDED
  setEditDate: (date: string) => void; // 🚀 ADDED
  updateReviewMutation: UseMutationResult<
    ReviewsResponse,
    Error,
    UpdateReviewVariables,
    unknown
  >;
  setEditRating: (rating: number) => void;
  setEditComment: (comment: string) => void;
  modalImages: string[];
  editingReviewId: string | null;
  removeImage: (index: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] relative font-poppins px-6 pb-6 pt-10 animate-in fade-in zoom-in-95 duration-200 text-left">
        <button
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingReviewId(null);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer p-1"
        >
          <X size={20} />
        </button>

        {/* --- Image Selection Section --- */}
        <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto mb-6 p-1">
          {modalImages.map((img, index) => {
            const baseUrl =
              process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
              "http://localhost:8082";

            const cleanPath = img.startsWith("/") ? img : `/${img}`;
            const fullImageUrl =
              img.startsWith("http") || img.startsWith("data:")
                ? img
                : `${baseUrl}${cleanPath}`;

            return (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group"
              >
                <Image
                  src={fullImageUrl}
                  alt={`Review ${index}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            );
          })}

          {isUploadingImage && (
            <div className="aspect-square flex items-center justify-center bg-gray-50 border border-dashed border-amber-300 rounded-lg">
              <Loader2 className="animate-spin text-amber-500" size={20} />
            </div>
          )}

          <button
            type="button"
            onClick={() => modalFileRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-[#FFA500] hover:text-[#FFA500] transition-all cursor-pointer"
          >
            <Plus size={24} />
          </button>

          <input
            type="file"
            ref={modalFileRef}
            onChange={handleModalImageReplacement}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Name Field (Read Only) */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Reviewer Name
            </label>
            <input
              type="text"
              value={activeReviewItem.name}
              disabled
              className="w-full bg-[#F8F9FA] border border-gray-100 rounded-[10px] p-3 text-sm font-semibold text-[#4A5568] opacity-80 outline-none cursor-not-allowed"
            />
          </div>

          {/* Rating & Comment Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Review Rating
              </label>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= editRating ? "#FFA500" : "transparent"}
                    className={
                      s <= editRating
                        ? "text-[#FFA500] cursor-pointer"
                        : "text-gray-300 cursor-pointer"
                    }
                    onClick={() => setEditRating(s)}
                  />
                ))}
                <span className="text-xs text-gray-500 font-bold ml-1">
                  ({editRating}.0)
                </span>
              </div>
            </div>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="w-full border border-gray-200 rounded-[12px] p-3 text-sm text-[#1A202C] min-h-[100px] resize-none focus:border-[#FFA500] outline-none transition-all placeholder:text-gray-300"
              placeholder="Update the customer's feedback..."
            />
          </div>

          {/* 🚀 FIXED: Date Picker (Functional) */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
              Review Created Date
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-[10px] p-3 text-sm font-medium text-black outline-none focus:border-[#FFA500] transition-all cursor-pointer"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                updateReviewMutation.mutate({
                  id: editingReviewId!,
                  rating: editRating,
                  comment: editComment,
                  images: modalImages,
                  createdAt: editDate, // 🚀 Now sending the updated date
                });
              }}
              disabled={updateReviewMutation.isPending || isUploadingImage}
              className="bg-[#023337] text-white font-lato font-bold text-sm px-10 py-3 rounded-[12px] flex items-center gap-2 min-w-[160px] justify-center transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-lg shadow-gray-100"
            >
              {updateReviewMutation.isPending && (
                <Loader2 className="animate-spin" size={16} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
