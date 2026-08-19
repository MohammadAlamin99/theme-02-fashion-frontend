"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, Loader2, X, Package } from "lucide-react";
import { Product } from "@/@types/product.type";
import { searchProducts } from "@/services-api/productService";

export interface LandingPageProduct extends Product {
  sell_price: string;
  regular_price: string;
  originalPrice?: number;
  avg_rating: number;
  rating: number;
  short_description?: string;
  total_reviews: number;
  images: string[] | undefined;
}

interface ProductSearchSelectProps {
  selectedProduct?: LandingPageProduct;
  onSelect: (product: LandingPageProduct) => void;
  onClear: () => void;
  resolveImageUrl: (path: string | undefined | null) => string | null;
  placeholder?: string;
  hasError?: boolean;
}

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export default function ProductSearchSelect({
  selectedProduct,
  onSelect,
  onClear,
  resolveImageUrl,
  placeholder = "Product Name",
}: ProductSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LandingPageProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close the predictions dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = useCallback(async (term: string) => {
    if (term.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    try {
      const products = await searchProducts(term);
      setResults(
        Array.isArray(products) ? (products as LandingPageProduct[]) : [],
      );
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  };

  const handleSearchNow = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(query);
  };

  const handlePick = (product: LandingPageProduct) => {
    onSelect(product);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
  };

  const handleClear = () => {
    onClear();
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const displayImage =
    resolveImageUrl(selectedProduct?.images?.[0] ?? null) ?? undefined;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-3 bg-[#F2F2F2] rounded-lg p-4 transition-all`}
      >
        <Search size={18} className="text-black" />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm font-normal text-[#A2A2A2] min-w-0"
        />
        {isSearching && (
          <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />
        )}
        <button
          type="button"
          onClick={handleSearchNow}
          className="font-poppins text-sm text-black text-normal cursor-pointer pr-2"
        >
          Search
        </button>
      </div>

      {/* Currently selected product chip */}
      {selectedProduct && (
        <div className="flex items-center gap-2 mt-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 w-fit max-w-full">
          <div className="h-6 w-6 rounded overflow-hidden bg-white border border-blue-100 shrink-0 flex items-center justify-center">
            {displayImage ? (
              <img
                src={displayImage}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={12} className="text-blue-300" />
            )}
          </div>
          <span className="text-xs font-semibold text-blue-700 truncate max-w-[220px]">
            {selectedProduct.name}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-400 hover:text-red-500 transition shrink-0"
            aria-label="Clear selected product"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Predictions dropdown */}
      {isOpen && query.trim().length >= MIN_QUERY_LENGTH && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-xs text-slate-400 text-center">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((product) => {
              const thumb = resolveImageUrl(product.images?.[0] ?? null);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handlePick(product)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 transition text-left border-b border-slate-50 last:border-b-0"
                >
                  <div className="h-9 w-9 rounded-md overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={14} className="text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {product.name}
                    </p>
                    {(product.sell_price ?? product.price) !== undefined && (
                      <p className="text-[10px] text-slate-400">
                        ৳{product.sell_price ?? product.price}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          ) : hasSearched ? (
            <div className="p-3 text-xs text-slate-400 text-center">
              No products found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-3 text-xs text-slate-400 text-center">
              Keep typing to search products
            </div>
          )}
        </div>
      )}
    </div>
  );
}
