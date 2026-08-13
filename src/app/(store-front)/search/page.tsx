"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import ProductCard from "@/components/store-front/common/ProductCard";

import { Product } from "@/@types/product.type";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: products, isLoading } = useQuery({
    queryKey: ["full-search", query],
    queryFn: async () => {
      const res = await apiFetch(
        `/products/search?page=1&limit=40&search=${query}`,
      );
      const result = await res.json();
      return result.data?.data || [];
    },
    enabled: !!query,
  });

  return (
    <div className="max-w-[1720px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        Search results for:{" "}
        <span className="text-[#FF7050]">&quot;{query}&quot;</span>
      </h1>

      {isLoading ? (
        <div>Loading products...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">
            No products found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
