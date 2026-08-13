import BannerSlider from "@/components/store-front/home/BannerSlider";
import BestSalesProducts from "@/components/store-front/home/BestSalesProducts";
import Blog from "@/components/store-front/home/Blog";
import Brands from "@/components/store-front/home/Brands";
import FeaturedCategory from "@/components/store-front/home/FeaturedCategory";
import Features from "@/components/store-front/home/Features";
import FlashSale from "@/components/store-front/home/FlashSale";
import PromotionDiscountProduct from "@/components/store-front/home/CampaignSection";
import NewArrivals from "@/components/store-front/home/NewArrivals";
import Suppliers from "@/components/store-front/home/Suppliers";
import Testimonials from "@/components/store-front/home/Testimonials";
import WeeklyBestSellerProduct from "@/components/store-front/home/WeeklyBestSellerProduct";
import { getHomeTags, HomeTagSection } from "@/services-api/tagService";

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
      <BannerSlider />
      <Features />
      <PromotionDiscountProduct />
      <FeaturedCategory />
      <NewArrivals tags={tags} />
      <BestSalesProducts tags={tags} />
      {activeFlashSale && <FlashSale flashSale={activeFlashSale} />}
      <Testimonials />
      <WeeklyBestSellerProduct tags={tags} />
      <Brands />
      <Suppliers />
      <Blog />
    </>
  );
}
