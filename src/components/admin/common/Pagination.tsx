"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) => {
  const getPageNumbers = () => {
    if (!totalPages || totalPages <= 1) {
      return [1];
    }

    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - i + 1,
      ).reverse();
      return [1, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [1, "...", ...middleRange, "...", totalPages];
    }
    return [1];
  };

  const pages = getPageNumbers();

  // FIX: if there's only one page, don't render pagination controls at all.
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DCE4EC] rounded-lg text-[15px] font-medium text-black w-full sm:w-auto justify-center transition-colors hover:bg-gray-50"
      >
        <ArrowLeft size={15} /> Previous
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {pages.map((page, i) => (
          <button
            key={i}
            disabled={page === "..."}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`w-[36px] h-[36px] rounded-[4px] text-[15px] font-medium flex items-center justify-center border transition-all ${
              page === currentPage
                ? "bg-[#DFF5FF] text-[#1E90FF] border-[#DFF5FF] font-semibold"
                : page === "..."
                  ? "text-[#023337] bg-white border-[#D1D5DB]"
                  : "text-[#023337] bg-white border-[#D1D5DB] cursor-pointer hover:border-[#1E90FF]"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DCE4EC] rounded-lg text-[15px] font-medium text-black w-full sm:w-auto justify-center transition-colors hover:bg-gray-50"
      >
        Next <ArrowRight size={15} />
      </button>
    </div>
  );
};

export default Pagination;
