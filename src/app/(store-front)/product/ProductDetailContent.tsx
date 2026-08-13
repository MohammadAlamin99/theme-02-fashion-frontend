"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/services-api/productService";
import { Breadcrumbs } from "@/components/store-front/product/Breadcrumbs";
import { ProductGallery } from "@/components/store-front/product/ProductGallery";
import { ProductInfo } from "@/components/store-front/product/ProductInfo";
import ProductDetailsTabs from "@/components/store-front/product/Productdetailstabs";
import RecentlyViewed from "@/components/store-front/common/RecentViewSection";
import Link from "next/link";

interface Props {
  slug: string;
}

export default function ProductDetailContent({ slug }: Props) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The requested product could not be loaded or does not exist.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-[#FF7050] text-white rounded-xl font-medium transition-all hover:bg-[#e05b3d] shadow-sm"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const imagesList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["/images/placeholder.svg"];

  const galleryItems = imagesList.map((img) => ({
    type: "image" as const,
    src: img,
  }));

  const videoItems =
    product.video_urls?.map((v) => ({
      type: "video" as const,
      src: imagesList[0],
      videoId: v,
    })) || [];

  const allMedia = [...videoItems, ...galleryItems];

  return (
    <div className="w-full bg-white pb-20">
      <div className="max-w-[1720px] mx-auto px-4">
        <Breadcrumbs paths={["Home", "Products"]} activePath={product.name} />

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-[40px] xl:gap-[72px] mt-4">
          <div>
            <ProductGallery items={allMedia} />
          </div>
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        <ProductDetailsTabs product={product} />

        <div className="pt-8 md:pt-16">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
}
