"use client";

import { useQuery } from "@tanstack/react-query";
import { relatedProduct } from "@/services-api/productService";
import RelatedProductCard, { ProductData } from "./RelatedProductCard";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const RelatedProducts = ({ productId }: { productId: string }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const limit = 4;
  const page = 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["related-products", productId, page, limit],
    queryFn: () => relatedProduct(productId, limit, page),
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-semibold font-poppins mb-4 px-1">
          {t.relatedProducts.title}
        </h3>

        <p className="text-sm text-[#727272] mb-3 px-1">
          {t.relatedProducts.loading}
        </p>

        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F2F2] animate-pulse"
            >
              <div className="w-[94px] h-[116px] rounded-xl bg-gray-300 shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold font-poppins text-black mb-4 px-1">
        {t.relatedProducts.title}
      </h3>
      <div className="bg-white rounded-2xl flex flex-col gap-y-3">
        {data.map((product: ProductData) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
