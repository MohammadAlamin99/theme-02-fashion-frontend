"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "../common/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  old_price: number;
  discount_tag: string | null;
  rating: string;
  review_count: number;
  stock_status: string;
  quantity_left: number;
}

interface TagSection {
  id: string;
  title: string;
  slug: string;
  products: Product[];
}

interface NewArrivalsProps {
  tags: TagSection[];
}

const NewArrivals = ({ tags }: NewArrivalsProps) => {
  // Select the first tag object from the array without any filtering
  const section = tags?.[0];

  // Return null if data is missing or if the product list is empty
  if (!section || !section.products || section.products.length === 0) {
    return null;
  }

  // Map backend product data to match the format required by ProductCard component
  const formattedProducts = section.products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sell_price: product.price.toString(),
    regular_price: product.old_price > 0 ? product.old_price.toString() : "0",
    images: product.image ? [product.image] : ["/images/placeholder.svg"],
    avg_rating: product.rating,
    total_reviews: product.review_count,
    quantity: product.quantity_left,
    discount_tag: product.discount_tag,
  }));

  return (
    <section className="w-full bg-[#F9F9F9] py-8 px-4 md:px-10 overflow-hidden">
      <div className="max-w-[1710px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          {/* Render the title dynamically from the first tag section */}
          <h2 className="text-black font-poppins text-[24px] md:text-[32px] font-semibold leading-normal">
            {section.title}
          </h2>

          <div className="flex items-center gap-4">
            <button className="new-prev cursor-pointer w-10 h-10 rounded-full border border-black flex items-center justify-center bg-white text-black transition-colors duration-200 [&.swiper-button-disabled]:border-[#E2E2E2] [&.swiper-button-disabled]:text-[#E2E2E2] [&.swiper-button-disabled]:cursor-not-allowed">
              <FaChevronLeft className="text-xl" />
            </button>
            <button className="new-next cursor-pointer w-10 h-10 rounded-full border border-black flex items-center justify-center bg-white text-black transition-colors duration-200 [&.swiper-button-disabled]:border-[#E2E2E2] [&.swiper-button-disabled]:text-[#E2E2E2] [&.swiper-button-disabled]:cursor-not-allowed">
              <FaChevronRight className="text-xl" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          spaceBetween={12}
          slidesPerView={2}
          navigation={{
            prevEl: ".new-prev",
            nextEl: ".new-next",
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 25 },
            1280: { slidesPerView: 4, spaceBetween: 30 },
            1536: { slidesPerView: 5, spaceBetween: 35 },
          }}
          className="product-slider"
        >
          {formattedProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default NewArrivals;
