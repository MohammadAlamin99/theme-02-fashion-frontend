"use client";
import PrinentIcon from '@/components/store-front/svg/svg/PrinentIcon';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
}

const Pagination2 = ({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1
}: PaginationProps) => {

    const getPageNumbers = () => {
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
            const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - i + 1).reverse();
            return [1, "...", ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = Array.from(
                { length: rightSiblingIndex - leftSiblingIndex + 1 },
                (_, i) => leftSiblingIndex + i
            );
            return [1, "...", ...middleRange, "...", totalPages];
        }
        return [];
    };

    const pages = getPageNumbers();

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 items-center justify-items-center md:justify-items-stretch gap-4 md:gap-0 px-5'>
            <button className="bg-[#F9F9F9] cursor-pointer px-3 py-2 flex items-center gap-2 rounded-[4px] w-fit md:justify-self-start whitespace-nowrap">
                <PrinentIcon />
                Print Multiple Order
            </button>

            <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-auto md:w-full md:col-start-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-2 py-2 bg-white border border-[#DCE4EC] rounded-[4px] text-[15px] font-medium text-black w-[36px] h-[36px] sm:w-auto justify-center transition-colors hover:bg-gray-50"
                >
                    <ArrowLeft color='#000' size={20} strokeWidth={1.5} />
                </button>

                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center max-w-full">
                    {pages.map((page, i) => (
                        <button
                            key={i}
                            disabled={page === "..."}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            className={`w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-[4px] text-[15px] font-medium flex items-center justify-center border transition-all ${page === currentPage
                                ? 'bg-[#DFF5FF] text-[#1E90FF] border-[#DFF5FF] font-semibold'
                                : page === '...'
                                    ? 'text-[#023337] bg-white border-[#D1D5DB] cursor-default'
                                    : 'text-[#023337] bg-white border-[#D1D5DB] cursor-pointer hover:border-[#1E90FF]'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 p-2 bg-white border border-[#DCE4EC] rounded-[4px] text-[15px] font-medium text-black w-[36px] h-[36px] sm:w-auto justify-center transition-colors hover:bg-gray-50"
                >
                    <ArrowRight color='#000' size={20} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
};

export default Pagination2;