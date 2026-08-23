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
  image: string;
  discount_value: string;
  is_free_delivery: boolean;
  end_date: string;
}

// 2. Define the possible API Response shapes
interface CampaignEnvelope {
  success: boolean;
  statusCode: number;
  message: string;
  data: Campaign[];
  timestamp: string;
}

interface NestedCampaignEnvelope {
  success: boolean;
  statusCode: number;
  message: string;
  data: CampaignEnvelope;
  timestamp: string;
}

type CampaignApiResponse =
  | CampaignEnvelope
  | NestedCampaignEnvelope
  | Campaign[];

// ---- Type guards & normalizer (declared BEFORE the component) ----

function isCampaignArray(res: CampaignApiResponse): res is Campaign[] {
  return Array.isArray(res);
}

function isNestedEnvelope(
  res: CampaignApiResponse,
): res is NestedCampaignEnvelope {
  return (
    !Array.isArray(res) &&
    typeof res === "object" &&
    res !== null &&
    "data" in res &&
    !Array.isArray((res as CampaignEnvelope).data)
  );
}

function extractCampaigns(res: CampaignApiResponse | undefined): Campaign[] {
  if (!res) return [];
  if (isCampaignArray(res)) return res;
  if (isNestedEnvelope(res)) return res.data.data ?? [];
  return (res as CampaignEnvelope).data ?? [];
}

// ---- Component ----

const CampaignSection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery<CampaignApiResponse>({
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

  const campaigns: Campaign[] = extractCampaigns(apiResponse);

  if (isError || campaigns.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white mt-10 mb-5 md:mt-20 md:mb-10 px-4 md:px-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 lg:gap-6 xl:gap-8 2xl:gap-[35px]">
          {campaigns.map((item: Campaign) => {
            const rowImage = item?.image || "";
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
                <div className="text-center">
                  <h2 className="font-poppins text-[12px] sm:text-[16px] md:text-[22px] lg:text-[28px] xl:text-[34px] 2xl:text-[40px] font-medium text-black leading-tight">
                    {item.name}
                  </h2>

                  <p className="mt-1 font-poppins text-[8px] sm:text-[10px] md:text-[13px] lg:text-[16px] xl:text-[20px] 2xl:text-[24px] font-normal text-black uppercase">
                    {t.promotion.minOff} {item.discount_value}
                    {t.promotion.off}
                  </p>
                </div>

                <div className="relative flex items-center justify-center my-3 md:my-5 w-full h-[100px] sm:h-[120px] md:h-[150px] lg:h-[170px] xl:h-[190px]">
                  <Image
                    src={iconUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <Link href={`/campaign/${item.slug}`}>
                  <button
                    className="
                    cursor-pointer
                    bg-[#D75300]
                    text-white
                    rounded-full
                    font-inter
                    font-medium
                    transition-all
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
