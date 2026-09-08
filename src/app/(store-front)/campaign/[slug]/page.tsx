"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FaChevronRight, FaTag, FaClock } from "react-icons/fa";
import { fetchCampaignByIdOrSlug } from "@/services-api/campaignService";
import {ProductCard} from "@/components/store-front/common/ProductCard";
import { Product } from "@/@types/product.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface CampaignDetailsData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  banner_url?: string | null;
  discount_value?: string | number;
  min_order_amount?: string | number;
  is_free_delivery?: boolean;
  status?: string;
  products?: Product[];
  campaign_products?: { product_id: string; product?: Product }[];
}

interface CampaignApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CampaignDetailsData;
}

export default function SingleCampaignPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { language } = useLanguage();
  const t = translations[language];

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery<CampaignApiResponse>({
    queryKey: ["campaign-details", slug],
    queryFn: async () => {
      const res = await fetchCampaignByIdOrSlug(slug);
      return res as unknown as CampaignApiResponse;
    },
    enabled: !!slug,
  });

  const rawCampaign = (apiResponse as unknown as CampaignApiResponse)?.data?.id
    ? (apiResponse as unknown as CampaignApiResponse).data
    : (apiResponse as unknown as CampaignApiResponse)?.data ||
      (apiResponse as unknown as CampaignApiResponse);
  const campaign = rawCampaign as unknown as CampaignDetailsData | undefined;

  const rawProducts: Product[] = (
    (campaign?.products && campaign.products.length > 0
      ? campaign.products
      : campaign?.campaign_products
          ?.map((cp: { product?: Product }) => cp.product || cp)
          .filter(Boolean)) || []
  ).filter((p): p is Product => Boolean(p));

  const products: Product[] = rawProducts.map((p) => {
    const discountVal = campaign?.discount_value
      ? Number(campaign.discount_value)
      : 0;

    if (!p.campaign_discount && discountVal > 0) {
      const sellPrice = parseFloat(String(p.sell_price)) || 0;
      const calculatedFinal = Math.round(sellPrice * (1 - discountVal / 100));
      return {
        ...p,
        campaign_discount: {
          discount_value: discountVal,
          campaign_name: campaign?.name,
          campaign_id: campaign?.id,
          is_free_delivery: campaign?.is_free_delivery,
        } as Product["campaign_discount"],
        final_price: p.final_price ?? calculatedFinal,
      };
    }
    return p;
  });

  // Helper to format image URL
  const getImageUrl = (rawUrl?: string | null): string => {
    if (!rawUrl || rawUrl.trim().length <= 1) return "/images/placeholder.svg";
    return rawUrl.startsWith("http") || rawUrl.startsWith("/images/")
      ? rawUrl
      : `${backendBaseUrl}/${rawUrl.replace(/^\/+/, "")}`;
  };

  // Helper to format end date
  const formatDate = (dateStr?: string): string | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(
        (language as string) === "bn" ? "bn-BD" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );
    } catch {
      return null;
    }
  };

  return (
    <div className="px-4 md:px-10 mb-20 font-poppins">
      <div className="max-w-[1720px] mx-auto">
        {/*  Breadcrumbs */}
        <nav className="py-4 font-poppins font-medium text-sm md:text-base flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="text-[#727272] hover:text-[#7CB640] transition-colors"
          >
            Home
          </Link>
          <FaChevronRight color="#7CB640" size={13} />
          <span className="text-[#727272]">Campaigns</span>
          <FaChevronRight color="#7CB640" size={13} />
          <span className="text-[#7CB640] truncate max-w-[200px] md:max-w-none">
            {campaign?.name || "Loading..."}
          </span>
        </nav>

        {/*  Loading Skeleton */}
        {isLoading && (
          <div className="space-y-8 animate-pulse">
            <div className="w-full h-[220px] md:h-[320px] bg-gray-200 rounded-[24px] md:rounded-[36px]" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-[340px] bg-gray-100 rounded-[16px]" />
              ))}
            </div>
          </div>
        )}

        {/*  Error / Not Found  */}
        {(isError || (!isLoading && !campaign)) && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#FAFAFA] rounded-[24px] border border-[#E3E3E3] my-8">
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Campaign Not Found
            </h2>
            <p className="font-poppins text-gray-500 text-sm md:text-base mb-6 max-w-md">
              The requested campaign might have expired or does not exist.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#7CB640] text-white font-poppins font-medium rounded-full hover:bg-[#e66345] transition-all"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/*  Campaign Content  */}
        {!isLoading && campaign && (
          <>
            {/* Hero Header Card */}
            <div
              className="relative overflow-hidden rounded-lg p-5 sm:p-8 md:p-12 mb-10 h-[200px]"
              style={{
                backgroundImage: `url("${getImageUrl(campaign.banner_url)}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-10 my-auto h-full">
                {/* Text & Badges */}
                <div className="md:flex-1 text-center lg:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    {campaign.discount_value !== undefined &&
                      campaign.discount_value !== null && (
                        <span className="inline-flex items-center gap-1.5 bg-[#7CB640] text-white text-xs md:text-sm font-poppins font-semibold px-3 py-1 rounded-lg">
                          <FaTag size={12} />
                          Up to {campaign.discount_value}% OFF
                        </span>
                      )}
                  </div>

                  <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-semibold text-black leading-tight">
                    {campaign.name}
                  </h1>

                  {campaign.description && (
                    <p className="font-poppins text-gray-600 text-sm md:text-base max-w-2xl">
                      {campaign.description}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-gray-600 font-poppins">
                    {campaign.end_date && formatDate(campaign.end_date) && (
                      <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-gray-200">
                        <FaClock className="text-[#7CB640]" />
                        <span>Valid till: </span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(campaign.end_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Products Section Header */}
            <div className="flex items-center justify-between mb-6 pb-3">
              <h2 className="font-poppins text-xl md:text-2xl font-medium text-black flex items-center gap-2">
                <span>Campaign Products</span>
                <span className="bg-[#7CB640]/10 text-[#7CB640] text-xs md:text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              </h2>
            </div>
            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAFAFA] rounded-[20px] border border-gray-200">
                <p className="font-poppins text-gray-500 text-base md:text-lg">
                  No products are currently available in this campaign.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
