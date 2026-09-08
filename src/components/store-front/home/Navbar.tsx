"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { HeartIcon, Menu, X, Minus, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchSettings } from "@/services-api/settingsService";
import { Category, getCategoryTree } from "@/services-api/categoryService";
import { getWishlist } from "@/services-api/wishlistService";
import {
  deleteCartItem,
  fetchCart,
  updateCartItem,
} from "@/services-api/cartService";
import { getPublicBanners } from "@/services-api/bannerService";
import { useLanguage } from "@/providers/LanguageProvider";
import { getActiveCampaign, Campaign } from "@/services-api/campaignService";
import { getProductCampaignInfo } from "@/utils/campaign";
import { Product } from "@/@types/product.type";
import LanguageIcon from "../svg/LanguageIcon";
import SearchBar from "@/components/admin/common/SearchBar";
import CartIcon from "../svg/CartIcon";
import UserIcon from "../svg/svg/UsersIcon";
const fallbackSlides = [
  { id: "f1", image: "/images/bannerImage.png", alt: "Banner 1", link: "#" },
  { id: "f2", image: "/images/bannerImage2.jpeg", alt: "Banner 2", link: "#" },
  { id: "f3", image: "/images/bannerImage3.jpeg", alt: "Banner 3", link: "#" },
];

type CartItem = {
  id: string;
  image?: string | { url: string; alt_text?: string } | null;
  name?: string;
  variantInfo?:
    | Record<string, unknown>
    | { label?: string; value?: string; type?: string }[];
  price?: string | number;
  quantity: number;
};

interface CampaignApiResponse {
  data: { data: Campaign[] };
}

export default function Header({
  showSlider = true,
}: {
  showSlider?: boolean;
}) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [current, setCurrent] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // banner data fetch
  const { data: bannersData = [] } = useQuery({
    queryKey: ["public-banners"],
    queryFn: getPublicBanners,
    staleTime: 1000 * 60 * 10,
  });

  // convert into slide this banner
  const dynamicSlides = bannersData.flatMap((banner) =>
    (banner.image_url || []).map((imgUrl, imgIndex) => ({
      id: `${banner.id}-${imgIndex}`,
      image: imgUrl.startsWith("http")
        ? imgUrl
        : `${backendBaseUrl}/${imgUrl.replace(/^\/+/, "")}`,
      alt: banner.meta_title || "Banner",
      link: banner.link_url || "#",
    })),
  );

  const finalSlides = dynamicSlides.length > 0 ? dynamicSlides : fallbackSlides;

  // slider logic
  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % finalSlides.length);
    }, 4500);
  };

  useEffect(() => {
    if (showSlider && finalSlides.length > 1) {
      startInterval();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [finalSlides.length, showSlider]);

  const goTo = (index: number) => {
    setCurrent(index);
    startInterval();
  };
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [scrolled, menuOpen]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Settings, Cart, Wishlist
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const info = settings?.data || settings;
  const rawLogo = info?.header_logo || "";
  const logoUrl = rawLogo
    ? rawLogo.startsWith("http")
      ? rawLogo
      : `${backendBaseUrl}/${rawLogo.replace(/^\/+/, "")}`
    : "/images/logo.svg";

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories-tree"],
    queryFn: getCategoryTree,
    staleTime: 1000 * 60 * 30,
  });

  const user = useAuthStore((state) => state.user);
  const isStoreReady = useAuthStore((state) => state._hasHydrated);

  const [guestId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    let id = localStorage.getItem("guestId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guestId", id);
    }
    return id;
  });

  const { data: wishlistData = [] } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: getWishlist,
    enabled: isStoreReady,
  });

  const { data: cartData } = useQuery({
    queryKey: ["cart", user?.id, guestId],
    queryFn: () => fetchCart(user ? null : guestId),
    enabled: isStoreReady && (!!user || !!guestId),
  });

  const { data: activeCampaignsData } = useQuery({
    queryKey: ["activeCampaigns"],
    queryFn: getActiveCampaign,
  });

  const activeCampaigns = Array.isArray(activeCampaignsData?.data)
    ? activeCampaignsData.data
    : Array.isArray(activeCampaignsData)
      ? activeCampaignsData
      : (activeCampaignsData as unknown as CampaignApiResponse)?.data?.data ||
        [];

  const rawCartItems = (cartData?.items || []) as (CartItem & {
    product?: Product;
    productId?: string;
  })[];

  const cartItems = rawCartItems.map((item) => {
    const prod = item.product || (item as unknown as Product);
    const pId =
      item.productId ||
      (item as unknown as { product_id: string }).product_id ||
      prod?.id ||
      item.id;
    const sellPrice =
      prod?.sell_price ||
      (item as unknown as { sell_price: number }).sell_price ||
      item.price ||
      0;

    const campaignInfo = getProductCampaignInfo(
      {
        id: pId,
        slug: prod?.slug,
        sell_price: sellPrice,
        price: item.price,
        campaign_discount: prod?.campaign_discount,
        final_price: prod?.final_price,
      },
      sellPrice,
      activeCampaigns,
    );

    const effectivePrice =
      campaignInfo.finalPrice > 0
        ? campaignInfo.finalPrice
        : Number(item.price || 0);

    return { ...item, price: effectivePrice || item.price };
  });

  const subTotal = cartItems.reduce((acc, item) => {
    const p = Number(item.price || 0);
    return acc + p * (item.quantity || 1);
  }, 0);

  const { mutate: updateQty } = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      updateCartItem(id, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const { mutate: removeItem } = useMutation({
    mutationFn: (id: string) => deleteCartItem(id),
    onSuccess: () => {
      toast.success("Item removed");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const avatarUrl =
    isStoreReady && user?.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${backendBaseUrl}/${user.avatar.replace(/^\/+/, "")}`
      : null;

  const handleProfileNav = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isStoreReady || !user) {
      router.push("/signin");
      return;
    }
    router.push(user.role === "ADMIN" ? "/settings/profile" : "/profile");
  };

  const handleWishlistClick = () => {
    if (!isStoreReady || !user) {
      router.push("/signin");
      return;
    }
    router.push("/profile/wishlist");
  };

  const mobileLinks = [
    { id: "home", name: "Home", slug: "" },
    ...categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  ];
  const isHomePage = pathname === "/";

  // fixed calcualate for homme only home page
  const isFixed = isHomePage || scrolled;
  return (
    <div className="relative bg-[#0a0a0a] font-inter overflow-x-hidden">
      {/* STICKY HEADER */}
      <header
        ref={headerRef}
        className={`${isFixed ? "fixed top-0 left-0 right-0" : "relative"} z-[205] transition-all duration-500 ${
          scrolled || !isHomePage
            ? "bg-[#0a0a0a]/90 backdrop-blur-md shadow-[0_2px_32px_rgba(0,0,0,0.6)] py-3"
            : "bg-gradient-to-b from-black/70 to-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-10 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <div
              className="rounded-[40px] px-3 py-1.5 md:px-4 md:py-2 border border-white/30
              bg-[linear-gradient(0deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.11)_100%),linear-gradient(180deg,rgba(255,255,255,0.38)_-30.21%,rgba(171,164,164,0.38)_50%,rgba(255,255,255,0.38)_130.21%)] 
              shadow-[0_1px_14.9px_0_rgba(109,109,109,0.26)]"
            >
              <Image
                src={logoUrl}
                alt="Logo"
                width={0}
                height={0}
                sizes="100vw"
                unoptimized
                className="w-[100px] md:w-[130px] h-auto object-contain"
                priority
              />
            </div>
          </Link>

          <div className="hidden lg:block flex-1 max-w-md">
            <SearchBar />
          </div>

          <div
            className="flex items-center gap-2 md:gap-4 px-3 py-2 md:px-6 md:py-2.5 rounded-[233px] border border-white/30
            bg-[linear-gradient(0deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.11)_100%),linear-gradient(180deg,rgba(255,255,255,0.38)_-30.21%,rgba(171,164,164,0.38)_50%,rgba(255,255,255,0.38)_130.21%)] 
            shadow-[0_1px_14.9px_0_rgba(109,109,109,0.26)]"
          >
            {/* Language toggle */}
            <div ref={langRef} className="relative">
              <button
                className="flex items-center gap-1 text-white/70 scale-90 md:scale-100 cursor-pointer"
                onClick={() => setLangOpen((p) => !p)}
              >
                <LanguageIcon />
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  {language === "BAN" ? "বাং" : "EN"}
                </span>
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-28 bg-[#0a0a0a] border border-white/10 rounded-md shadow-xl z-[9999] overflow-hidden">
                  <button
                    onClick={() => {
                      setLanguage("BAN");
                      setLangOpen(false);
                    }}
                    className={`w-full cursor-pointer text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${language === "BAN" ? "bg-white/10 font-semibold" : ""}`}
                  >
                    বাংলা
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("ENG");
                      setLangOpen(false);
                    }}
                    className={`w-full cursor-pointer text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${language === "ENG" ? "bg-white/10 font-semibold" : ""}`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className="relative text-white/70 scale-90 md:scale-100 hidden sm:block cursor-pointer"
            >
              <HeartIcon size={20} />
              {wishlistData.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {wishlistData.length > 9 ? "9+" : wishlistData.length}
                </span>
              )}
            </button>

            {/* User */}
            <button
              onClick={handleProfileNav}
              className="relative text-white/70 scale-90 md:scale-100 cursor-pointer"
            >
              {avatarUrl ? (
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="User"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <UserIcon />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/70 scale-90 md:scale-100 cursor-pointer"
            >
              <CartIcon />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </span>
              )}
            </button>

            <button
              className="lg:hidden text-white/80 ml-1 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 bg-[#0a0a0a]/95 backdrop-blur-lg ${menuOpen ? "max-h-[500px]" : "max-h-0"}`}
        >
          <div className="p-4 flex flex-col gap-2">
            <div className="mb-4">
              <SearchBar />
            </div>
            {mobileLinks.map((item) => (
              <Link
                key={item.id}
                href={item.slug ? `/category/${item.slug}` : "/"}
                className="text-white/70 hover:text-amber-400 py-3 px-2 text-sm tracking-widest uppercase border-b border-white/5 cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* DYNAMIC BANNER SLIDER */}
      {!isHomePage && isFixed && <div style={{ height: headerHeight }} />}
      {showSlider && pathname === "/" && (
        <section className="relative w-full h-[60vh] md:h-screen overflow-hidden">
          {finalSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100" : "opacity-0"}`}
            >
              <Link
                href={slide.link || "#"}
                className={
                  slide.link !== "#" ? "cursor-pointer" : "cursor-default"
                }
              >
                <Image
                  fill
                  src={slide.image}
                  alt={slide.alt}
                  priority={index === 0}
                  unoptimized
                  className="object-cover object-center"
                />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}

          {/* Indicators / Dots */}
          {finalSlides.length > 1 && (
            <>
              <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                {finalSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`transition-all duration-500 rounded-full cursor-pointer ${i === current ? "w-4 h-4 md:w-5 md:h-5 bg-white shadow-lg" : "w-3 h-3 md:w-4 md:h-4 bg-white/30"}`}
                  />
                ))}
              </div>

              <div className="absolute bottom-6 md:bottom-10 right-6 md:right-8 z-20 text-white/40 text-[10px] md:text-xs tracking-[0.25em] font-light">
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(finalSlides.length).padStart(2, "0")}
              </div>
            </>
          )}
        </section>
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] md:w-[400px] bg-white z-[210] transform transition-transform duration-500 shadow-2xl font-inter ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Your Cart ({cartItems.length})
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {cartItems.length > 0 ? (
              <div className="flex flex-col gap-5">
                {cartItems.map((item) => {
                  const rawImg = item.image;
                  const imageValue =
                    typeof rawImg === "string" ? rawImg : rawImg?.url || "";
                  const usableImg = imageValue
                    ? imageValue.startsWith("http")
                      ? imageValue
                      : `${backendBaseUrl}/${imageValue.replace(/^\/+/, "")}`
                    : "/images/placeholder.svg";
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-gray-50 pb-4"
                    >
                      <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <Image
                          src={usableImg}
                          alt={item.name || "Product Image"}
                          fill
                          unoptimized
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                            {item.name}
                          </h4>
                          {Array.isArray(item.variantInfo) &&
                            item.variantInfo.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.variantInfo.map((variant, idx) => {
                                  const v = variant as {
                                    label?: string;
                                    value?: string;
                                  };
                                  return (
                                    <span
                                      key={idx}
                                      className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200"
                                    >
                                      {v.label ?? "Variant"} : {v.value ?? "-"}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          <p className="text-[#000000] font-bold text-sm mt-1">
                            TK {item.price}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md">
                            <button
                              onClick={() =>
                                item.quantity > 1 &&
                                updateQty({
                                  id: item.id,
                                  qty: item.quantity - 1,
                                })
                              }
                              className="p-1 px-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQty({
                                  id: item.id,
                                  qty: item.quantity + 1,
                                })
                              }
                              className="p-1 px-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                <CartIcon />
                <p className="text-lg">Your cart is empty</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-[#000000] text-white px-8 py-3 rounded-[8px] font-medium hover:bg-[#6ba536] cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">
                  TK {subTotal}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/order");
                }}
                className="w-full bg-[#000000] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Checkout Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {(isCartOpen || menuOpen) && (
        <div
          className="fixed inset-0 bg-black/60 z-[200]"
          onClick={() => {
            setIsCartOpen(false);
            setMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
