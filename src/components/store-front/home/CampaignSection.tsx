"use client";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getActiveCampaign } from "@/services-api/campaignService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

// 1. Define the Campaign Interface based on your JSON
interface Campaign {
  id: string;
  name: string;
  slug: string;
  banner_url: string;
  discount_value: string;
  is_free_delivery: boolean;
  end_date: string;
}

// 2. Define the API Response Interface
interface CampaignResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Campaign[];
  timestamp: string;
}

const CampaignSection = () => {
  const { language } = useLanguage();
  const t = translations[language];
  // 3. Apply the type to useQuery
  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery<CampaignResponse>({
    queryKey: ["activeCampaigns"],
    queryFn: () => getActiveCampaign(),
  });

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  if (isLoading) {
    return (
      <div className="w-full py-10 text-center">{t.promotion.loading}</div>
    );
  }

  if (isError || !apiResponse?.success) {
    return null; // Or show an error message
  }

  const campaigns = apiResponse.data || [];

  return (
    <section className="w-full bg-white pb-[40px] md:pb-[80px] px-4 md:px-10">
      <div className="max-w-[1720px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 lg:gap-6 xl:gap-8 2xl:gap-[35px]">
          {campaigns.map((item: Campaign) => {
            const rowImage = item?.banner_url || "";
            const isValidImg = rowImage.trim().length > 1;
            const iconUrl = isValidImg
              ? rowImage.startsWith("http") || rowImage.startsWith("/images/")
                ? rowImage
                : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`
              : "/images/placeholder.svg";
            return (
              <div
                key={item.id}
                className="
                flex flex-col items-center justify-center
                bg-[#FAFAFA]
                border border-[#E3E3E3]
                rounded-[18px] md:rounded-[28px] lg:rounded-[36px] 2xl:rounded-[51px]
                py-4 sm:py-5 md:py-6 lg:py-8 xl:py-10
                px-2 sm:px-3 md:px-5 lg:px-6 xl:px-10 2xl:px-[50px]
                transition-transform duration-300 hover:shadow-md
                h-auto lg:h-[320px] xl:h-[360px] 2xl:h-[413px]
              "
              >
                {/* Title */}
                <div className="text-center">
                  <h2 className="font-poppins text-[12px] sm:text-[16px] md:text-[22px] lg:text-[28px] xl:text-[34px] 2xl:text-[40px] font-medium text-black leading-tight">
                    {item.name}
                  </h2>

                  <p className="mt-1 font-poppins text-[8px] sm:text-[10px] md:text-[13px] lg:text-[16px] xl:text-[20px] 2xl:text-[24px] font-normal text-black uppercase">
                    {t.promotion.minOff} {item.discount_value}
                    {t.promotion.off}
                  </p>
                </div>

                {/* Image */}
                <div className="relative flex items-center justify-center my-3 md:my-5 w-full h-[55px] sm:h-[75px] md:h-[100px] lg:h-[120px] xl:h-[150px] 2xl:h-[180px]">
                  <Image
                    // Logic to handle empty banner_url or relative paths
                    src={iconUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Button */}
                <Link href={`/campaign/${item.slug}`}>
                  <button
                    className="
                    cursor-pointer
                    bg-[#FF7050]
                    text-white
                    rounded-full
                    font-inter
                    font-medium
                    transition-all
                    hover:bg-[#e66345]
                    active:scale-95
                    text-[8px]
                    sm:text-[10px]
                    md:text-[13px]
                    lg:text-[15px]
                    xl:text-[17px]
                    2xl:text-[20px]
                    px-3
                    sm:px-4
                    md:px-5
                    lg:px-6
                    xl:px-7
                    2xl:px-8
                    py-1.5
                    sm:py-2
                    md:py-2.5
                    lg:py-3
                  "
                  >
                    {t.promotion.shopNow}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CampaignSection;
