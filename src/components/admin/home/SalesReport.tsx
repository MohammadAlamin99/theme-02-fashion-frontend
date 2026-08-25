"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services-api/dashboardService";
import Pagination from "../common/Pagination";
import Image from "next/image";

interface SalesReportRow {
  name: string;
  image: string;
  totalOrder: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  returned: number;
}

const LIMIT = 4;

const baseStorageUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:8082";

const getImgUrl = (rawImg: string | { url: string } | null | undefined) => {
  if (!rawImg) return "/images/products/product.png";

  const imgStr = typeof rawImg === "string" ? rawImg : rawImg?.url || "";

  return imgStr.startsWith("http")
    ? imgStr
    : `${baseStorageUrl}/${imgStr.replace(/^\/+/, "")}`;
};

export default function SalesReport() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["sales-report-table", page],
    queryFn: () => dashboardApi.getSellReport({ page, limit: LIMIT }),
  });

  const rows: SalesReportRow[] = data?.data || data || [];
  const totalPages = data?.meta?.lastPage || 1;

  return (
    <div className="bg-white rounded-[8px] font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-[16px] md:text-lg font-bold text-[#23272E] font-lato">
          Sells Report
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-6">
        <table className="w-full text-left">
          <thead className="bg-[#F3F6FF]">
            <tr className="text-[13px] font-normal font-lato text-[#6A717F] uppercase tracking-wide">
              <th className="py-5 px-4 rounded-l-[8px] w-12">No.</th>
              <th className="py-5 px-4">Product</th>
              <th className="py-5 px-4 text-center">Total Order</th>
              <th className="py-5 px-4 text-center">Confirmed</th>
              <th className="py-5 px-4 text-center">Shipped</th>
              <th className="py-5 px-4 text-center">Delivered</th>
              <th className="py-3 px-4 rounded-r-[8px] text-center">
                Returned
              </th>
            </tr>
          </thead>
          <tbody className="">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-6 bg-gray-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100" />
                        <div className="h-4 w-32 bg-gray-100 rounded" />
                      </div>
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-4 px-4 text-center">
                        <div className="h-4 w-8 bg-gray-100 rounded mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((item, idx) => {
                  const rowNumber = (page - 1) * LIMIT + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="text-sm hover:bg-[#F8FBFF] transition-colors text-[15px] text-[#023337] font-lato"
                    >
                      <td className="py-4 px-4 text-[#6A717F] font-medium text-[13px]">
                        {rowNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Image
                            width={46}
                            height={46}
                            src={getImgUrl(item.image)}
                            alt={item.name}
                            className="w-[46px] h-[46px] rounded-lg border object-cover"
                            unoptimized
                          />
                          <span className="font-semibold text-[#0F2D37] text-[14px] truncate max-w-[200px]">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.totalOrder ?? 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.confirmed ?? 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.shipped ?? 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.delivered ?? 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.returned ?? 0}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        <div className="py-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Empty State */}
        {!isLoading && rows.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            No sales data found.
          </div>
        )}
      </div>
    </div>
  );
}
