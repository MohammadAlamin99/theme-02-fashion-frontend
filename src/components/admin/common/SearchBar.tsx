"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { apiFetch } from "@/utils/api";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/@types/product.type";
import { SearchIcon } from "lucide-react";

interface SearchResponse {
  data: {
    data: Product[];
  };
}

export default function SearchBar({
  placeholder = "Search in Cart and Gets",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // ── Search Logic ───────────────────────────────────────────
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useQuery<Product[]>({
    queryKey: ["product-search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];
      const res = await apiFetch(
        `/products/search?page=1&limit=10&search=${debouncedSearch}`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const result: SearchResponse = await res.json();
      return result.data?.data || [];
    },
    enabled: debouncedSearch.length >= 2,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowPredictions(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowPredictions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-3">
        {/* Main Search Pill */}
        <div
          className="flex-1 flex items-center gap-3
          rounded-[233px] border border-white/30
          bg-[linear-gradient(0deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.11)_100%),linear-gradient(180deg,rgba(255,255,255,0.38)_-30.21%,rgba(171,164,164,0.38)_50%,rgba(255,255,255,0.38)_130.21%)] 
          shadow-[0_1px_14.9px_0_rgba(109,109,109,0.26)] px-4 md:px-6 py-2 md:py-2.5
          "
        >
          {/* Mic Icon */}
          {/* <button className="cursor-pointer shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 28 28"
              fill="none"
              className="md:w-[28px] md:h-[28px]"
            >
              <path
                d="M19.8346 8.16732V12.834C19.8346 16.0556 17.2229 18.6673 14.0013 18.6673C10.7796 18.6673 8.16797 16.0556 8.16797 12.834V8.16732C8.16797 4.94566 10.7796 2.33398 14.0013 2.33398C17.2229 2.33398 19.8346 4.94566 19.8346 8.16732Z"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M23.3346 12.834C23.3346 17.9887 19.156 22.1673 14.0013 22.1673M14.0013 22.1673C8.84664 22.1673 4.66797 17.9887 4.66797 12.834M14.0013 22.1673V25.6673M14.0013 25.6673H17.5013M14.0013 25.6673H10.5013"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button> */}
          <SearchIcon size={26} color="white"/>

          {/* Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowPredictions(true);
            }}
            onFocus={() => setShowPredictions(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder={placeholder}
            className="text-sm md:text-base bg-transparent outline-none border-none text-white placeholder:text-white/70 w-full h-full"
          />

          {/* Search Button Text */}
          <button
            onClick={handleSearch}
            className="cursor-pointer font-inter text-white text-sm md:text-base font-medium"
          >
            search
          </button>
        </div>

        {/* Camera Button */}
        {/* <button
          className="p-2 md:p-2.5 border border-white/30 cursor-pointer shrink-0
          rounded-full
          bg-[linear-gradient(0deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.11)_100%),linear-gradient(180deg,rgba(255,255,255,0.38)_-30.21%,rgba(171,164,164,0.38)_50%,rgba(255,255,255,0.38)_130.21%)] 
          shadow-[0_1px_14.9px_0_rgba(109,109,109,0.26)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            className="md:w-[32px] md:h-[32px]"
          >
            <path
              d="M16.9309 4.66602H15.0717C14.1189 4.66602 13.6425 4.66602 13.2153 4.81535C12.9544 4.90654 12.7092 5.03774 12.4886 5.20424C12.1274 5.4769 11.8631 5.87327 11.3346 6.66602C11.064 7.07204 10.665 7.67051 10.506 7.83763C10.1119 8.25171 9.59524 8.52823 9.03212 8.6264C8.80485 8.66602 8.56086 8.66602 8.07289 8.66602C6.76612 8.66602 6.11274 8.66602 5.57849 8.81724C4.24205 9.19556 3.19752 10.2401 2.8192 11.5765C2.66797 12.1108 2.66797 12.7642 2.66797 14.0709V19.3327C2.66797 23.1039 2.66797 24.9895 3.83954 26.1611C5.01112 27.3327 6.89674 27.3327 10.668 27.3327H21.3347C25.1059 27.3327 26.9915 27.3327 28.1631 26.1611C29.3347 24.9895 29.3347 23.1039 29.3347 19.3327V14.0709C29.3347 12.7642 29.3347 12.1108 29.1835 11.5765C28.8051 10.2401 27.7605 9.19556 26.4241 8.81724C25.8899 8.66602 25.2365 8.66602 23.9297 8.66602C23.4417 8.66602 23.1977 8.66602 22.9705 8.6264C22.4073 8.52823 21.8907 8.25171 21.4967 7.83763C21.3376 7.6705 20.9387 7.07203 20.668 6.66602C20.1395 5.87327 19.8752 5.4769 19.514 5.20424C19.2933 5.03774 19.0483 4.90654 18.7873 4.81535C18.3601 4.66602 17.8837 4.66602 16.9309 4.66602Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.3347 17.3333C21.3347 20.2788 18.9468 22.6667 16.0013 22.6667C13.0558 22.6667 10.668 20.2788 10.668 17.3333C10.668 14.3879 13.0558 12 16.0013 12C18.9468 12 21.3347 14.3879 21.3347 17.3333Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25.332 12.666V12.6793"
              stroke="white"
              strokeWidth="2.33"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button> */}
      </div>

      {/* Predictions Dropdown - Styled to match the dark glass theme */}
      {showPredictions && searchQuery.length >= 2 && (
        <div className="absolute top-[110%] left-0 w-full min-w-[280px] bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-2xl z-[9999] overflow-hidden max-h-[400px] overflow-y-auto backdrop-blur-md">
          {isLoading || isFetching ? (
            <div className="p-4 text-center text-sm text-white/50 animate-pulse">
              Searching...
            </div>
          ) : (searchResults || []).length === 0 ? (
            <div className="p-4 text-center text-sm text-white/40">
              No products found
            </div>
          ) : (
            (searchResults || []).map((product) => {
              const firstImg = product.images?.[0];
              const rawImg =
                typeof firstImg === "string" ? firstImg : firstImg?.url || "";
              const iconUrl = rawImg
                ? rawImg.startsWith("http")
                  ? rawImg
                  : `${backendBaseUrl}/${rawImg.replace(/^\/+/, "")}`
                : "/images/placeholder.svg";

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    router.push(`/product/${product.slug}`);
                    setShowPredictions(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                >
                  <div className="relative w-12 h-12 bg-white/5 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={iconUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-[#7CB640] font-bold text-xs mt-0.5">
                      BDT {product.sell_price}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
