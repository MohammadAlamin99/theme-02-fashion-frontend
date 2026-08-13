'use client';
import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

export interface RelatedProduct {
  id: string;
  name: string;
  images: string[];
  sell_price: string;
}

interface BlogBodyProps {
  content: string;
  relatedProducts?: RelatedProduct[];
}

export default function BlogBody({ content, relatedProducts }: BlogBodyProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  return (
    <section className="container mx-auto px-4 font-inter pb-20">
      {/* 1. Main Body Text (Dynamic HTML) */}

      <div className="mb-10">
        <div
          className="blog-rich-text prose prose-lg max-w-none 
               prose-p:text-[#585858] 
               prose-headings:text-black 
               prose-headings:font-bold 
               prose-h1:text-4xl 
               prose-h2:text-3xl
               prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* 2. Side by Side Related Products (Dynamic) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h4 className="text-black font-bold text-xl mb-6 uppercase tracking-wide">
           {t.relatedProducts.title}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {relatedProducts.map((product: RelatedProduct) => {
              const imageUrl = product.images[0].startsWith("http")
                ? product.images[0]
                : `${backendBaseUrl}/${product.images[0].replace(/^\/+/, "")}`;

              return (
                <div key={product.id} className="space-y-3">
                  <div className="relative h-[250px] md:h-[400px] rounded-xl overflow-hidden border border-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <p className="text-start font-medium text-gray-700">
                    {product.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
