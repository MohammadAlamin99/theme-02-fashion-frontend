import RecentlyViewed from "@/components/store-front/common/RecentViewSection";
import BrandSection from "@/components/store-front/order/BrandSection";
import MainCheakoutSection from "@/components/store-front/order/MainCheakoutSection";

export default function page() {
  return (
    <div>
      <MainCheakoutSection />
      <div className="md:mt-10 mt-5">
        <RecentlyViewed />
      </div>
      <BrandSection />
    </div>
  );
}
