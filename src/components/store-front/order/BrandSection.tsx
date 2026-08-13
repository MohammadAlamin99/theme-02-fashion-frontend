"use client";

import Image from "next/image";

const BrandSection = () => {
  const brandLogos = [
    "/images/store-front/brand/b2.png",
    "/images/store-front/brand/b6.png",
    "/images/store-front/brand/b4.png",
    "/images/store-front/brand/b5.png",
    "/images/store-front/brand/b6.png",
    "/images/store-front/brand/b3.png",
    "/images/store-front/brand/b2.png",
    "/images/store-front/brand/b4.png",
    "/images/store-front/brand/b5.png",
    "/images/store-front/brand/b6.png",
  ];
  const loopLogos = [...brandLogos, ...brandLogos];

  return (
    <>
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scrollRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .brands-track-left {
          display: flex;
          width: max-content;
          animation: scrollLeft 40s linear infinite;
        }

        .brands-track-right {
          display: flex;
          width: max-content;
          animation: scrollRight 40s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .brands-track-left,
          .brands-track-right {
            animation: none;
          }
        }
      `}</style>

      <section className="w-full md:py-20 py-10 px-4 md:px-10 bg-white overflow-hidden">
        <div className="max-w-[1720px] mx-auto">
          <div className="relative flex flex-col gap-2">
            {/* LEFT GRADIENT FADE */}
            <div
              className="absolute left-0 top-0 h-full w-[80px] md:w-[180px] z-20 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* RIGHT GRADIENT FADE */}
            <div
              className="absolute right-0 top-0 h-full w-[80px] md:w-[180px] z-20 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to left, #fff 0%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* ROW 1 — scrolls left */}
            <div className="overflow-hidden w-full">
              <div className="brands-track-left">
                {loopLogos.map((logo, index) => (
                  <div
                    key={`row1-${index}`}
                    className="flex items-center justify-center shrink-0 mx-6 md:mx-10"
                  >
                    <div className="relative w-[140px] md:w-[180px] lg:w-[200px] h-[70px] md:h-[90px] lg:h-[100px] grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                      <Image
                        src={logo}
                        alt={`brand-${index}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BrandSection;
