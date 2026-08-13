"use client";

import React, { useState, useRef } from "react";
import {
  MoreVertical,
  Star,
  Edit3,
  ShieldAlert,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/services-api/reviewService";
import { getAdminTokenAction } from "@/app/actions/auth";
import DataTable from "../common/DataTable";
import Pagination from "../common/Pagination";
import Image from "next/image";
import ReviewModal, { Review } from "./ReviewModal";
import toast from "react-hot-toast";
import ReviewViewModal from "./ReviewViewModal";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface ReviewItem {
  id: string;
  sl: number;
  image: string;
  name: string;
  star: number;
  status: string;
  comment: string;
  createdAt: string;
  rawDate: string; // For the date picker state
  productName: string;
  productImage: string;
  rawImages: string[];
  isEdited: boolean; // 🚀 Added to detect edits
  lastUpdated: string; // 🚀 Added for edit info
}

const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'><rect width='45' height='45' fill='%23F3F4F6'/><circle cx='22.5' cy='18' r='7' fill='%239CA3AF'/><path d='M10,38 C10,30 16,26 22.5,26 C29,26 35,30 35,38' fill='%239CA3AF'/></svg>";

export default function ReviewTable() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

  // Modal Controlled local states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [editDate, setEditDate] = useState<string>(""); // 🚀 State for editable date
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [viewingReviewId, setViewingReviewId] = useState<string | null>(null);

  const modalFileRef = useRef<HTMLInputElement | null>(null);
  const [forceBypass, setForceBypass] = useState<boolean>(false);

  const rPage = Number(searchParams.get("r_page")) || 1;
  const statusFilter = searchParams.get("status") || "";
  const cSearch = searchParams.get("c_search") || "";
  const rSort = searchParams.get("r_sort") || "desc";

  const { data: serverPayload } = useQuery({
    // 🚀 2. ADD rSort TO THE QUERY KEY
    queryKey: [
      "admin-reviews-list",
      rPage,
      statusFilter,
      cSearch,
      rSort,
      forceBypass,
    ],
    queryFn: async () => {
      // 🚀 3. PASS THE SORT TO THE API SERVICE
      const res = await reviewApi.getAll(
        rPage,
        5,
        statusFilter,
        cSearch,
        rSort, // Added this
        forceBypass,
      );
      if (forceBypass) setForceBypass(false);
      return res;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reviewApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Review status updated successfully");
      setForceBypass(true);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-customer-review-stats"],
      });
      setActiveMenuId(null);
      setActiveSubMenu(false);
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({
      id,
      rating,
      comment,
      images,
      createdAt,
    }: {
      id: string;
      rating: number;
      comment: string;
      images: string[];
      createdAt: string;
    }) => {
      return await reviewApi.updateDetails(
        id,
        rating,
        comment,
        images,
        createdAt,
      );
    },
    onSuccess: () => {
      toast.success("Review updated successfully");
      setForceBypass(true);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-list"] });
      setIsEditModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewApi.delete(id),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      setForceBypass(true);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-customer-review-stats"],
      });
      setActiveMenuId(null);
    },
  });

  const rawReviews =
    serverPayload?.data && Array.isArray(serverPayload.data.data)
      ? serverPayload.data.data
      : [];
  const meta = serverPayload?.data?.meta || { totalPages: 1 };

  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";
  const BACKEND_URL = baseApiUrl.replace("/api/v1", "");

  const reviewData: ReviewItem[] = rawReviews.map(
    (item: Review, index: number) => {
      // 🚀 CUSTOMER IDENTITY LOGIC: Prioritize registered user account info
      let customerAvatar = FALLBACK_AVATAR;
      const userAvatar = item.user?.avatar;

      if (userAvatar && userAvatar.trim() !== "") {
        customerAvatar =
          userAvatar.startsWith("http") || userAvatar.startsWith("data:")
            ? userAvatar
            : `${BACKEND_URL}${userAvatar.startsWith("/") ? userAvatar : `/${userAvatar}`}`;
      }

      const customerName = item.user?.name || item.name || "Customer User";

      // 🚀 EDIT DETECTION: Check if record was updated after creation
      const createdTime = new Date(
        item.created_at || item.createdAt || "",
      ).getTime();
      const updatedTime = new Date(item.updated_at || "").getTime();
      const isEdited = updatedTime - createdTime > 5000; // 5 second buffer

      let reviewImagesArray: string[] = [];
      if (item.images) {
        try {
          const parsed =
            typeof item.images === "string"
              ? JSON.parse(item.images)
              : item.images;
          reviewImagesArray = Array.isArray(parsed)
            ? parsed.filter(Boolean)
            : [];
        } catch (e) {}
      }

      let displayImg = "";
      if (reviewImagesArray.length > 0) {
        const targetImg = reviewImagesArray[0];
        displayImg = targetImg.startsWith("http")
          ? targetImg
          : `${BACKEND_URL}${targetImg.startsWith("/") ? targetImg : `/${targetImg}`}`;
      } else if (item.product?.images) {
        try {
          const pImgs =
            typeof item.product.images === "string"
              ? JSON.parse(item.product.images)
              : item.product.images;
          if (pImgs?.[0])
            displayImg = pImgs[0].startsWith("http")
              ? pImgs[0]
              : `${BACKEND_URL}${pImgs[0].startsWith("/") ? pImgs[0] : `/${pImgs[0]}`}`;
        } catch (e) {}
      }

      const rawDate = item.created_at || item.createdAt;
      return {
        id: item.id,
        sl: (rPage - 1) * 5 + index + 1,
        image: customerAvatar,
        name: customerName,
        star: item.rating || 5,
        status: item.status,
        comment: item.comment || "",
        createdAt: rawDate
          ? new Date(rawDate).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "N/A",
        rawDate: rawDate ? new Date(rawDate).toISOString().split("T")[0] : "",
        isEdited,
        lastUpdated: item.updated_at
          ? new Date(item.updated_at).toLocaleDateString("en-GB")
          : "",
        productName: item.product?.name || "Product Unit",
        productImage: displayImg,
        rawImages: reviewImagesArray,
      };
    },
  );

  const activeReviewItem = reviewData.find((r) => r.id === editingReviewId);
  const viewReviewItem = reviewData.find((r) => r.id === viewingReviewId);

  const openEditModal = (review: ReviewItem) => {
    setEditingReviewId(review.id);
    setEditRating(review.star);
    setEditComment(review.comment);
    setEditDate(review.rawDate); // 🚀 Load raw date for picker
    setModalImages(review.rawImages);
    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleModalImageReplacement = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingReviewId) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images", file));
      const token = await getAdminTokenAction();
      const res = await fetch(`${baseApiUrl}/reviews/upload-images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        body: formData,
      });
      const payload = await res.json();
      const newPaths = payload?.data?.data || [];
      setModalImages((prev) => [...prev, ...newPaths]);
      toast.success("Image uploaded!");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const columns: TableColumn<ReviewItem>[] = [
    {
      header: "SI",
      key: "sl",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {item.sl}
        </span>
      ),
    },
    {
      header: "Image",
      key: "image",
      render: (item) => (
        <div className="flex items-center">
          <Image
            src={item.image}
            alt={item.name}
            width={45}
            height={45}
            className="rounded-[8px] object-cover h-[45px] w-[45px] bg-gray-50 border border-gray-100"
            unoptimized
          />
        </div>
      ),
    },
    {
      header: "Name",
      key: "name",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-[15px] text-[#1D1A1A] font-medium truncate max-w-[150px]">
            {item.name}
          </span>
          {item.isEdited && (
            <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded w-fit mt-0.5 whitespace-nowrap">
              Edited by Admin ({item.lastUpdated})
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item) => (
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit text-[12px] font-medium ${item.status?.toUpperCase() === "APPROVED" ? "bg-[#C1FFBC] text-[#085E00]" : "bg-amber-100 text-amber-700"}`}
        >
          {item.status?.toUpperCase() === "APPROVED" ? "Approved" : "Pending"}
        </div>
      ),
    },
    {
      header: "Star",
      key: "star",
      render: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setViewingReviewId(item.id);
            setIsViewModalOpen(true);
          }}
          className="px-3 py-1 rounded-full text-[14px] font-semibold flex items-center justify-center gap-1 cursor-pointer hover:opacity-80 transition-opacity bg-[#DCEFFF] text-[#32B2FA]"
        >
          <span>{item.star}</span> <Star size={14} fill="currentColor" />
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (item) => (
        <div className="relative">
          <button
            onClick={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
            className="text-black p-1 transition-colors hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
          {activeMenuId === item.id && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-[12px] shadow-xl py-2 z-50 text-sm font-medium text-[#1E293B]">
              <button
                onClick={() => openEditModal(item)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 cursor-pointer"
              >
                <Edit3 size={16} className="text-gray-400" /> <span>Edit</span>
              </button>
              <div
                className="relative w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                onMouseEnter={() => setActiveSubMenu(true)}
                onMouseLeave={() => setActiveSubMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={16} className="text-gray-400" />{" "}
                  <span>Status</span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
                {activeSubMenu && (
                  <div className="absolute top-0 right-full mr-1 w-36 bg-white border border-gray-100 rounded-[10px] shadow-xl py-1 z-50">
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: item.id,
                          status: "APPROVED",
                        })
                      }
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 hover:text-emerald-600 cursor-pointer"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: item.id,
                          status: "PENDING",
                        })
                      }
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 hover:text-amber-600 cursor-pointer"
                    >
                      Draft
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this review?"))
                    deleteMutation.mutate(item.id);
                }}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-3 cursor-pointer"
              >
                <Trash2 size={16} /> <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white font-poppins relative">
      <DataTable
        data={reviewData}
        columns={columns}
        rowKey="id"
        gradiant={true}
      />
      <div className="py-5">
        <Pagination
          currentPage={rPage}
          totalPages={meta.totalPages}
          onPageChange={(p) => router.push(`${pathname}?r_page=${p}`)}
        />
      </div>

      {isEditModalOpen && activeReviewItem && (
        <ReviewModal
          activeReviewItem={activeReviewItem}
          setIsEditModalOpen={setIsEditModalOpen}
          setEditingReviewId={setEditingReviewId}
          isUploadingImage={isUploadingImage}
          modalFileRef={modalFileRef}
          handleModalImageReplacement={handleModalImageReplacement}
          editRating={editRating}
          setEditRating={setEditRating}
          editComment={editComment}
          setEditComment={setEditComment}
          editDate={editDate} // 🚀 Passed to Modal
          setEditDate={setEditDate} // 🚀 Passed to Modal
          updateReviewMutation={updateReviewMutation}
          modalImages={modalImages}
          editingReviewId={editingReviewId}
          removeImage={(idx) =>
            setModalImages((prev) => prev.filter((_, i) => i !== idx))
          }
          FALLBACK_AVATAR={FALLBACK_AVATAR}
        />
      )}

      {isViewModalOpen && viewReviewItem && (
        <ReviewViewModal
          reviewItem={viewReviewItem}
          productName={viewReviewItem.productName}
          productImage={viewReviewItem.productImage}
          FALLBACK_AVATAR={FALLBACK_AVATAR}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingReviewId(null);
          }}
        />
      )}
    </div>
  );
}
