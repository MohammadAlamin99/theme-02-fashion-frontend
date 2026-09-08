import Blog from "@/components/store-front/home/Blog";
import Brands from "@/components/store-front/home/Brands";
import FeaturedCategory from "@/components/store-front/home/FeaturedCategory";
import FlashSale from "@/components/store-front/home/FlashSale";
import PromotionDiscountProduct from "@/components/store-front/home/CampaignSection";
import NewArrivals from "@/components/store-front/home/NewArrivals";
import WeeklyBestSellerProduct from "@/components/store-front/home/WeeklyBestSellerProduct";
import StorefrontPopupBanner from "@/components/store-front/home/StorefrontPopupBanner";
import { getHomeTags, HomeTagSection } from "@/services-api/tagService";
import BestSalesProducts from "@/components/store-front/home/BestSalesProducts";

export const revalidate = 60;
export default async function Page() {
  const tags = await getHomeTags();

  const flashSaleArray = Array.isArray(tags)
    ? tags.filter(
        (tag: HomeTagSection) => tag.is_flash_sale === true && tag.end_date,
      )
    : [];
  const activeFlashSale = flashSaleArray[0];
  return (
    <>
      <StorefrontPopupBanner />
      {/* <BannerSlider /> */}
      {/* <Features /> */}
      <FeaturedCategory />
      <PromotionDiscountProduct />
      <NewArrivals tags={tags} />
      <BestSalesProducts tags={tags} />
      {activeFlashSale && <FlashSale flashSale={activeFlashSale} />}
      {/* <Testimonials /> */}
      <WeeklyBestSellerProduct tags={tags} />
      <Brands />
      <Blog />
    </>
  );
}
