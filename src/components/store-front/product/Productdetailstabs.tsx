"use client";
import { useState } from "react";
import SpecificationSection from "./Specificationsection";
import DescriptionSection from "./Descriptionsection";
import FAQsSection from "./Faqssection";
import ReviewSection from "./Reviewsection";
import RelatedProducts from "./Relatedproducts";
import { Product } from "@/@types/product.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

type TabType = "Specification" | "Description" | "FAQs" | "Review";

interface Props {
  product: Product;
}

const ProductDetailsTabs = ({ product }: Props) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<TabType>("Description");

  const isThirdPartyProduct = product.slug
    ?.toLowerCase()
    .startsWith("mohasagor");

  const tabs: { label: string; id: TabType; count?: number }[] = [
    { label: t.productDetails.description, id: "Description" },
    { label: t.productDetails.specification, id: "Specification" },
    { label: t.productDetails.faqs, id: "FAQs" },
    ...(!isThirdPartyProduct
      ? [
          {
            label: t.productDetails.review,
            id: "Review" as TabType,
            count: product.total_reviews,
          },
        ]
      : []),
  ];

  return (
    <section className="w-full font-poppins md:pt-20 pt-10">
      <div className="max-w-[1720px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          <div className="w-full flex-1 min-w-0">
            <div className="bg-[#F9F9F9] rounded-[16px] px-4 md:px-[48px] pt-[22px] flex items-center overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-[16px] text-sm md:text-[20px] mr-8 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "text-[#FF7050] font-semibold"
                      : "text-[#848484]"
                  }`}
                >
                  {tab.label} {tab.count !== undefined && ` (${tab.count})`}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#FF7050]" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-[#F8F8F8] rounded-[16px] py-6 px-4 md:py-8 md:px-[67px] mt-6">
              {activeTab === "Description" && (
                <DescriptionSection content={product.description} />
              )}
              {activeTab === "Specification" && (
                <SpecificationSection specs={product?.specifications} />
              )}
              {activeTab === "FAQs" && <FAQsSection faqs={product.faqs} />}

              {activeTab === "Review" && (
                <ReviewSection productId={product.id} />
              )}
            </div>
          </div>

          <aside className="w-full xl:w-[320px] shrink-0">
            <RelatedProducts productId={product.id} />
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsTabs;
