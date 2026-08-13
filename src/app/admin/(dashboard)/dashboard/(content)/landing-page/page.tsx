"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  useAdminLandingPage,
  useSaveLandingPageMutation,
  useAllProductsForLP,
} from "@/hooks/useLandingPages";
import { uploadLandingPageMedia } from "@/services-api/landingPageService";
import { CreateLandingPageDto } from "../../../../../../@types/landing-page";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Plus,
  Trash2,
  Layout,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  Monitor,
  Star,
  Palette,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Link2,
  Play,
} from "lucide-react";
import ContentHead from "@/components/admin/content/ContentHead";
import ContentNavigation from "@/components/admin/content/ContentNavigation";

export default function LandingPagePage() {
  const lastLoadedId = useRef<string | null>(null);

  // 🚀 Helper to extract YouTube Video ID
  const getYoutubeId = (url: string | undefined | null) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // 🚀 Helper to get YouTube Thumbnail URL
  const getYoutubeThumbnail = (url: string | undefined | null) => {
    const videoId = getYoutubeId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;
  };

  // 🚀 URL RESOLVER: Resolves image paths from the backend
  const getImageUrl = useCallback((path: string | undefined | null) => {
    if (!path || path.trim() === "") return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;

    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8082/api/v1";

    const backendBaseUrl = rawApiUrl.replace(/\/api(\/v1)?\/?$/, "");

    const cleanPath = path.replace(/^\/+/, "");
    return `${backendBaseUrl}/${cleanPath}`;
  }, []);

  const getEmbedVideoUrl = useCallback((url: string | undefined | null) => {
    if (!url) return null;
    let videoId = "";

    if (url.includes("embed/")) {
      const parts = url.split("embed/");
      videoId = parts[1]?.split("?")[0] || "";
    } else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      videoId = parts[1]?.split("?")[0] || "";
    } else if (url.includes("watch?v=")) {
      const parts = url.split("watch?v=");
      videoId = parts[1]?.split("&")[0] || "";
    }

    if (videoId) {
      // Uses youtube-nocookie.com domain to bypass account/cookie restriction blocks
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&enablejsapi=1`;
    }

    return url;
  }, []);

  const { register, control, handleSubmit, watch, reset, setValue, trigger } =
    useForm<CreateLandingPageDto>({
      defaultValues: {
        productId: "",
        slug: "",
        title: "",
        headline: "",
        subHeadline: "",
        topImage: "",
        offers: [
          {
            title: "Free Shipping",
            subTitle: "On all orders over $50",
            icon: "",
          },
        ],
        productImages: ["", "", "", ""],
        features: [
          {
            title: "Premium Material",
            subTitle: "100% Organic & Durable",
            icon: "",
          },
        ],
        reviews: [
          {
            name: "Sarah Connor",
            quote: "Absolute game changer! Highly recommend.",
            rating: 0,
            image: "",
          },
        ],
        faqs: [
          {
            question: "How long does shipping take?",
            answer: "Standard delivery takes 3-5 business days.",
          },
        ],
        videoLink: "https://www.youtube.com/watch?v=JkaxUblCGz0",
        backgroundColor: "#ffffff",
        textColor: "#111827",
        buttonColor: "#2563eb",
      },
    });

  const liveData = watch();
  const { data: productList, isLoading: isLoadingProducts } =
    useAllProductsForLP();
  const { data: existingPageData } = useAdminLandingPage(liveData.productId);
  const { mutate: savePage, isPending: isSaving } =
    useSaveLandingPageMutation();

  const {
    fields: offerFields,
    append: appendOffer,
    remove: removeOffer,
  } = useFieldArray({ control, name: "offers" });
  const {
    fields: featFields,
    append: appendFeat,
    remove: removeFeat,
  } = useFieldArray({ control, name: "features" });
  const {
    fields: reviewFields,
    append: appendReview,
    remove: removeReview,
  } = useFieldArray({ control, name: "reviews" });
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({ control, name: "faqs" });

  useEffect(() => {
    if (
      existingPageData &&
      existingPageData.productId !== lastLoadedId.current
    ) {
      lastLoadedId.current = existingPageData.productId;
      reset(existingPageData);
    }
  }, [existingPageData, reset]);

  const onImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldPath: any,
  ) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const tId = toast.loading("Uploading image...");
    try {
      const urls = await uploadLandingPageMedia(files);
      if (urls && urls.length > 0) {
        setValue(fieldPath, urls[0], {
          shouldDirty: true,
          shouldValidate: true,
          shouldTouch: true,
        });
        await trigger(fieldPath);
        toast.success("Image uploaded!", { id: tId });
      }
    } catch (error) {
      toast.error("Upload failed", { id: tId });
    }
  };

  const onSubmit = (formData: CreateLandingPageDto) => {
    if (!formData.topImage) {
      toast.error("Please upload the Hero Image first!");
      return;
    }
    savePage(formData, {
      onSuccess: () => toast.success("Landing Page Published!"),
      onError: (err: any) => toast.error(err.message),
    });
  };

  // Selected product lookup from your product list
  const selectedProduct = (
    Array.isArray(productList) ? productList : (productList as any)?.data
  )?.find((p: any) => p.id === liveData.productId);

  if (isLoadingProducts)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  const embedVideoUrl = getEmbedVideoUrl(liveData.videoLink);

  return (
    <div className="bg-[#f4f6f9] min-h-screen text-slate-800">
      <ContentHead />
      <ContentNavigation />

      <div className="flex h-[calc(100vh-105px)] overflow-hidden">
        {/* ========================================================= */}
        {/* --- LEFT EDITOR: MODERN FORM DESIGN --- */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[58%] overflow-y-auto p-8 scrollbar-hide space-y-6 pb-40"
        >
          {/* PRODUCT & URL CONFIGURATION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Search size={14} /> Product & Page Setup
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search size={18} className="text-slate-400 ml-2" />
              <select
                {...register("productId", { required: true })}
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700"
              >
                <option value="">Select Target Product...</option>
                {(Array.isArray(productList)
                  ? productList
                  : (productList as any)?.data
                )?.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20">
                <span className="px-3 py-2.5 bg-slate-100 text-slate-500 text-xs font-bold border-r border-slate-200">
                  /lp/
                </span>
                <input
                  {...register("slug", { required: true })}
                  placeholder="custom-landing-slug"
                  className="flex-1 p-2.5 bg-transparent outline-none text-xs font-semibold"
                />
              </div>
              <input
                {...register("title")}
                placeholder="SEO Meta Title"
                className="bg-slate-50 rounded-xl border border-slate-200 p-2.5 outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* HERO SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Layout size={14} /> Hero Section
            </div>
            <div className="grid grid-cols-[1.2fr_1.8fr] gap-6 items-start">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl h-44 flex flex-col items-center justify-center bg-slate-50 relative group overflow-hidden">
                {liveData.topImage ? (
                  <img
                    src={getImageUrl(liveData.topImage)!}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Hero"
                  />
                ) : (
                  <ImageIcon className="text-slate-300" size={40} />
                )}
                <input
                  type="hidden"
                  {...register("topImage", { required: true })}
                />
                <label className="absolute bottom-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-3.5 py-1.5 rounded-lg font-bold cursor-pointer z-10 hover:bg-black transition shadow-md">
                  {liveData.topImage ? "Change Image" : "Upload Hero Image"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => onImageUpload(e, "topImage")}
                  />
                </label>
              </div>
              <div className="space-y-3">
                <textarea
                  {...register("headline", { required: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 h-20 resize-none"
                  placeholder="Main Headline (e.g., Transform Your Daily Routine)*"
                />
                <textarea
                  {...register("subHeadline")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 h-20 resize-none"
                  placeholder="Sub-headline / Short catchy summary..."
                />
              </div>
            </div>
          </div>

          {/* OFFERS / TRUST BAR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                <Sparkles size={14} /> Offers & Trust Highlights
              </div>
              <button
                type="button"
                onClick={() =>
                  appendOffer({ title: "", subTitle: "", icon: "" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-sm"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {offerFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <label className="h-10 w-10 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center cursor-pointer shrink-0 overflow-hidden hover:border-blue-400 transition">
                    {watch(`offers.${index}.icon`) ? (
                      <img
                        src={getImageUrl(watch(`offers.${index}.icon`))!}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon size={16} className="text-slate-400" />
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onImageUpload(e, `offers.${index}.icon`)}
                    />
                  </label>
                  <input
                    {...register(`offers.${index}.title`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Offer Title (e.g. Free Delivery)"
                  />
                  <input
                    {...register(`offers.${index}.subTitle`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Sub-text (e.g. On orders over $50)"
                  />
                  <button
                    type="button"
                    onClick={() => removeOffer(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* KEY FEATURES */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                <CheckCircle2 size={14} /> Key Features
              </div>
              <button
                type="button"
                onClick={() =>
                  appendFeat({ title: "", subTitle: "", icon: "" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-sm"
              >
                <Plus size={14} /> Add Feature
              </button>
            </div>
            <div className="space-y-3">
              {featFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <label className="h-10 w-10 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center cursor-pointer shrink-0 overflow-hidden hover:border-blue-400 transition">
                    {watch(`features.${index}.icon`) ? (
                      <img
                        src={getImageUrl(watch(`features.${index}.icon`))!}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon size={16} className="text-slate-400" />
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        onImageUpload(e, `features.${index}.icon`)
                      }
                    />
                  </label>
                  <input
                    {...register(`features.${index}.title`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Feature Name"
                  />
                  <input
                    {...register(`features.${index}.subTitle`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Short feature explanation"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeat(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SHOWCASE GALLERY */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <ImageIcon size={14} /> Showcase Gallery (4 Slots)
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center relative overflow-hidden group"
                >
                  {liveData.productImages?.[i] ? (
                    <img
                      src={getImageUrl(liveData.productImages[i])!}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Plus size={20} className="text-slate-300" />
                  )}
                  <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-white text-xs font-bold gap-1">
                    <Plus size={16} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onImageUpload(e, `productImages.${i}`)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEO SECTION WITH THUMBNAIL PREVIEW */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Video size={14} /> Product Video Section
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20">
              <Link2 size={16} className="text-slate-400 ml-1" />
              <input
                {...register("videoLink")}
                className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-700"
                placeholder="Paste YouTube Link (e.g. https://www.youtube.com/watch?v=5qVZVt5zCY8)"
              />
            </div>

            {/* 🚀 Bulletproof Thumbnail Preview */}
            {getYoutubeThumbnail(liveData.videoLink) ? (
              <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative group shadow-sm">
                <img
                  src={getYoutubeThumbnail(liveData.videoLink)!}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <a
                    href={liveData.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition hover:scale-110"
                  >
                    <Play size={20} className="fill-white ml-0.5" />
                  </a>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded">
                  YouTube Preview
                </span>
              </div>
            ) : liveData.videoLink ? (
              <p className="text-[10px] text-amber-600 font-medium">
                Please enter a valid YouTube video link.
              </p>
            ) : null}
          </div>

          {/* CUSTOMER REVIEWS (FIXED COLLISION) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                <Star size={14} /> Customer Reviews
              </div>
              <button
                type="button"
                onClick={() =>
                  appendReview({ name: "", quote: "", rating: 5, image: "" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-sm"
              >
                <Plus size={14} /> Add Review
              </button>
            </div>

            <div className="space-y-4">
              {reviewFields.map((f, i) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar Uploader */}
                      <label className="h-10 w-10 border border-dashed border-slate-300 rounded-full bg-white flex items-center justify-center cursor-pointer shrink-0 overflow-hidden hover:border-blue-400 transition">
                        {watch(`reviews.${i}.image`) ? (
                          <img
                            src={getImageUrl(watch(`reviews.${i}.image`))!}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-slate-400" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            onImageUpload(e, `reviews.${i}.image`)
                          }
                        />
                      </label>
                      <input
                        {...register(`reviews.${i}.name`)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Customer Name"
                      />
                    </div>
                    {/* Dedicated Delete Button Container preventing collision */}
                    <button
                      type="button"
                      onClick={() => removeReview(i)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    {...register(`reviews.${i}.quote`)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Customer testimonial quote..."
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQS (FIXED COLLISION) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
                <HelpCircle size={14} /> Frequently Asked Questions
              </div>
              <button
                type="button"
                onClick={() => appendFaq({ question: "", answer: "" })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-sm"
              >
                <Plus size={14} /> Add FAQ
              </button>
            </div>

            <div className="space-y-4">
              {faqFields.map((f, i) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      {...register(`faqs.${i}.question`)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Question (e.g., What is your return policy?)"
                    />
                    <button
                      type="button"
                      onClick={() => removeFaq(i)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    {...register(`faqs.${i}.answer`)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Provide a clear answer..."
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* THEME BRANDING */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Palette size={14} /> Color Theme Configuration
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Background
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                  <input
                    type="color"
                    {...register("backgroundColor")}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono font-semibold uppercase">
                    {liveData.backgroundColor}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Button Color
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                  <input
                    type="color"
                    {...register("buttonColor")}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono font-semibold uppercase">
                    {liveData.buttonColor}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Text Color
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50">
                  <input
                    type="color"
                    {...register("textColor")}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono font-semibold uppercase">
                    {liveData.textColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT FOOTER */}
          <div className="flex justify-between items-center py-6 border-t border-slate-200">
            <button
              type="button"
              className="font-bold text-slate-600 flex items-center gap-2 text-xs hover:text-slate-900 transition"
            >
              <FileText size={18} /> Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSaving || !liveData.productId}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              Publish Landing Page
            </button>
          </div>
        </form>

        {/* ========================================================= */}
        {/* --- RIGHT PREVIEW: LIVE VISUAL DEVICE --- */}
        {/* ========================================================= */}

        <div className="w-[42%] bg-slate-200 p-6 overflow-y-auto scrollbar-hide flex flex-col items-center">
          <div className="flex justify-between items-center w-full max-w-md mb-4 font-bold text-slate-700 text-sm shrink-0">
            Live Visual Preview <Monitor size={20} />
          </div>

          {/* 🚀 EXACT LAYOUT CONTAINER MATCHING STOREFRONT DESIGN */}
          <div
            className="w-full max-w-md h-[780px] bg-white shadow-2xl rounded-[2rem] border-[8px] border-slate-900 overflow-y-auto scrollbar-hide flex flex-col transition-all shrink-0"
            style={{
              backgroundColor: liveData.backgroundColor || "#ffffff",
              color: liveData.textColor || "#111827",
            }}
          >
            {/* 🚀 PIXEL-PERFECT HERO SECTION */}
            <div className="px-8 py-12 grid grid-cols-2 gap-6 items-center shrink-0">
              {/* Left Side Content Container */}
              <div className="flex flex-col items-center text-center space-y-4 max-w-xs mx-auto">
                {/* Headline with dynamic fallback & formatting */}
                <h1
                  className="text-2xl font-black tracking-tight leading-[1.15] text-slate-900"
                  style={{ color: liveData.textColor || "#0f172a" }}
                >
                  {liveData.headline ? (
                    liveData.headline.endsWith(".") ? (
                      liveData.headline
                    ) : (
                      `${liveData.headline}.`
                    )
                  ) : (
                    <>
                      Pre Workout
                      <br />
                      Supplements.
                    </>
                  )}
                </h1>

                {/* Subheadline / Short Description */}
                <p className="text-[9px] text-zinc-400 font-medium leading-relaxed max-w-[200px]">
                  {liveData.subHeadline ||
                    "Write here about your product short description."}
                </p>

                {/* Glow CTA Button */}
                <div className="pt-2">
                  <button
                    style={{
                      backgroundColor: liveData.buttonColor || "#38bdf8",
                      boxShadow: `0 10px 25px -5px ${liveData.buttonColor || "#38bdf8"}80`,
                    }}
                    className="px-7 py-2.5 rounded-full text-white font-extrabold text-[9px] uppercase tracking-[0.2em] transition-transform active:scale-95"
                  >
                    PURCHASE
                  </button>
                </div>
              </div>

              {/* Right Side Hero Image */}
              <div className="w-full aspect-[1.1/1] rounded-[1.5rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-100/80">
                {liveData.topImage ? (
                  <img
                    src={getImageUrl(liveData.topImage)!}
                    alt="Hero Product"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 text-xs font-semibold gap-1">
                    <span>Hero Image</span>
                    <span className="text-[8px] opacity-60">
                      (Select image in left panel)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 🚀 PIXEL-PERFECT TRUST BAR / OFFERS BANNER */}
            {liveData.offers && liveData.offers.length > 0 && (
              <div className="bg-[#f3f3f3] py-7 px-4 grid grid-cols-3 gap-3 items-center shrink-0">
                {liveData.offers.map((off, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center space-y-1 px-1"
                  >
                    {/* Icon Container */}
                    <div className="mb-0.5 flex items-center justify-center">
                      {off.icon ? (
                        <img
                          src={getImageUrl(off.icon)!}
                          className="w-5 h-5 object-contain"
                          alt={off.title || "Offer Icon"}
                        />
                      ) : (
                        <Sparkles
                          size={20}
                          style={{ color: liveData.buttonColor || "#38bdf8" }}
                          className="stroke-[1.75]"
                        />
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-[9px] font-black text-slate-900 leading-tight tracking-tight">
                      {off.title || "100% High Quality Product"}
                    </p>

                    {/* Subtitle */}
                    {off.subTitle && (
                      <p className="text-[6.5px] font-normal text-slate-500 leading-normal max-w-[130px]">
                        {off.subTitle}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 🚀 PIXEL-PERFECT PRODUCT SHOWCASE (2x2 GRID) */}
            <div className="px-8 py-10 text-center space-y-6 shrink-0">
              {/* Section Heading & Sub-description */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h2
                  className="text-lg font-black tracking-tight text-slate-900"
                  style={{ color: liveData.textColor || "#0f172a" }}
                >
                  Product Image
                </h2>
                <p className="text-[8px] text-slate-400 font-normal leading-relaxed">
                  Explore our high quality gallery photos and product angles.
                </p>
              </div>

              {/* 2x2 Photo Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-[1.08/1] bg-slate-100 rounded-[1.25rem] overflow-hidden shadow-xs border border-slate-100/80 transition-transform duration-300 hover:scale-[1.02]"
                  >
                    {liveData.productImages?.[i] ? (
                      <img
                        src={getImageUrl(liveData.productImages[i])!}
                        className="w-full h-full object-cover object-center"
                        alt={`Product Gallery ${i + 1}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                        <span className="text-[9px] font-bold">
                          Slot {i + 1}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 🚀 PIXEL-PERFECT "WHY TO USE SUPPLE" FEATURES SECTION */}
            <div className="px-6 py-10 text-center space-y-6 shrink-0 border-t border-slate-100">
              {/* Header & Subtitle */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h2
                  className="text-lg font-black tracking-tight text-slate-900"
                  style={{ color: liveData.textColor || "#0f172a" }}
                >
                  Why To Use Supple
                </h2>
                <p className="text-[8px] text-slate-400 font-normal leading-relaxed">
                  Explore our high quality gallery photos and product angles.
                </p>
              </div>

              {/* 3-Column Layout: Left Features | Center Product Image | Right Features */}
              <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-3 items-center">
                {/* LEFT COLUMN (Features 1-3) */}
                <div className="space-y-6">
                  {[0, 1, 2].map((idx) => {
                    const feat = liveData.features?.[idx];
                    const defaultTitles = [
                      "Feature One",
                      "Feature Two",
                      "Feature Three",
                    ];
                    const defaultSubs = [
                      "Lorem ipsum dolor sit amet consectetur. Molestie aenean enim.",
                      "Nisl vel porttitor feugiat ornare mollis ac. Dignissim amet feugiat.",
                      "Urna posuere egestas nunc et sit vel. Nam cursus interdum urna.",
                    ];

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-end gap-2 text-right"
                      >
                        {/* Text Box */}
                        <div className="space-y-0.5 max-w-[120px]">
                          <h3 className="text-[9px] font-extrabold text-slate-900 leading-tight">
                            {feat?.title || defaultTitles[idx]}
                          </h3>
                          <p className="text-[6.5px] text-slate-500 font-normal leading-snug">
                            {feat?.subTitle || defaultSubs[idx]}
                          </p>
                        </div>

                        {/* Icon */}
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                          {feat?.icon ? (
                            <img
                              src={getImageUrl(feat.icon)!}
                              className="w-5 h-5 object-contain"
                              alt=""
                            />
                          ) : (
                            <Sparkles
                              size={18}
                              style={{
                                color: liveData.buttonColor || "#38bdf8",
                              }}
                              className="stroke-[1.75]"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CENTER IMAGE */}
                <div className="aspect-[1/1.3] rounded-[1.25rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
                  {liveData.topImage || liveData.productImages?.[0] ? (
                    <img
                      src={
                        getImageUrl(
                          liveData.topImage || liveData.productImages?.[0],
                        )!
                      }
                      className="w-full h-full object-cover object-center"
                      alt="Featured Product"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                      <span className="text-[8px] font-bold">
                        Featured Image
                      </span>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN (Features 4-6) */}
                <div className="space-y-6">
                  {[3, 4, 5].map((idx) => {
                    const feat = liveData.features?.[idx];
                    const defaultTitles = [
                      "Feature Four",
                      "Feature Five",
                      "Feature Six",
                    ];
                    const defaultSubs = [
                      "Neque aliquam risus ut gravida commodo nec integer viverra.",
                      "In nulla laoreet amet platea feugiat purus at consequat orci.",
                      "Velit sed sem scelerisque gravida ornare enim. Venenatis pharetra.",
                    ];

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-start gap-2 text-left"
                      >
                        {/* Icon */}
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                          {feat?.icon ? (
                            <img
                              src={getImageUrl(feat.icon)!}
                              className="w-5 h-5 object-contain"
                              alt=""
                            />
                          ) : (
                            <Sparkles
                              size={18}
                              style={{
                                color: liveData.buttonColor || "#38bdf8",
                              }}
                              className="stroke-[1.75]"
                            />
                          )}
                        </div>

                        {/* Text Box */}
                        <div className="space-y-0.5 max-w-[120px]">
                          <h3 className="text-[9px] font-extrabold text-slate-900 leading-tight">
                            {feat?.title || defaultTitles[idx - 3]}
                          </h3>
                          <p className="text-[6.5px] text-slate-500 font-normal leading-snug">
                            {feat?.subTitle || defaultSubs[idx - 3]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 🚀 PIXEL-PERFECT CUSTOMER'S REVIEWS SECTION */}
            <div className="px-6 py-10 text-center space-y-6 shrink-0">
              {/* Header */}
              <h2
                className="text-lg font-black tracking-tight"
                style={{ color: liveData.textColor || "#0f172a" }}
              >
                Customer’s Reviews
              </h2>

              {/* Review Grid: Left Card | Right Product Showcase */}
              <div className="grid grid-cols-[1.2fr_1fr] gap-4 items-center relative max-w-md mx-auto">
                {/* LEFT TESTIMONIAL CARD */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.25rem] shadow-xl text-left space-y-3 relative z-10 border border-slate-100/60">
                  {/* Badge Top Left */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[7px]">
                      👍
                    </div>
                    <span className="text-[9px] font-black tracking-tight">
                      Testimonial
                    </span>
                  </div>

                  {/* Quote Body */}
                  <p className="text-[7.5px] text-slate-600 font-normal leading-relaxed relative z-10">
                    {liveData.reviews?.[0]?.quote ||
                      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit."}
                  </p>

                  {/* Footer Info & Watermark Quote */}
                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <h4 className="text-[9px] font-extrabold text-slate-900 leading-none">
                        {liveData.reviews?.[0]?.name || "Simon Árpád"}
                      </h4>
                      <span className="text-[6px] text-slate-400 font-medium leading-tight block mt-0.5">
                        Verified Customer
                      </span>
                    </div>

                    {/* Decorative Watermark Quote */}
                    <span className="text-6xl font-serif text-slate-200 leading-none -mb-1">
                      “
                    </span>
                  </div>
                </div>

                {/* RIGHT PRODUCT / CUSTOMER PHOTO WITH "NEXT >" FLOATING BADGE */}
                <div className="relative aspect-[3/4.2] rounded-[1.25rem] overflow-hidden shadow-lg bg-slate-100">
                  {liveData.reviews?.[0]?.image || liveData.topImage ? (
                    <img
                      src={
                        getImageUrl(
                          liveData.reviews?.[0]?.image || liveData.topImage,
                        )!
                      }
                      className="w-full h-full object-cover object-center"
                      alt="Customer Review Product"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-[8px]" />
                  )}

                  {/* Floating 'Next >' Button Overlay */}
                  <div className="absolute bottom-3 right-3 bg-black text-white text-[7px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <span>Next</span>
                    <span>›</span>
                  </div>
                </div>
              </div>

              {/* PAGINATION DOTS */}
              <div className="flex justify-center items-center gap-1.5 pt-1">
                <span
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ backgroundColor: liveData.buttonColor || "#38bdf8" }}
                />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
            </div>

            {/* 🚀 PIXEL-PERFECT FAQS SECTION */}
            <div className="px-6 py-10 text-center space-y-6 shrink-0">
              {/* Header & Subtitle */}
              <div className="space-y-1 max-w-sm mx-auto">
                <h2
                  className="text-lg font-black tracking-tight"
                  style={{ color: liveData.textColor || "#0f172a" }}
                >
                  FAQs
                </h2>
                <p className="text-[8px] text-slate-400 font-normal">
                  Frequently asked questions.
                </p>
              </div>

              {/* Accordion Cards Container */}
              <div className="space-y-2.5 max-w-sm mx-auto text-left">
                {(liveData.faqs && liveData.faqs.length > 0
                  ? liveData.faqs
                  : [
                      {
                        question: "How This Supplement Works?",
                        answer:
                          "Et nec ipsum tincidunt ut felis elementum proin eget dignissim egestas quis velit maecenas magnis. Etiam faucibus et ultrices sit aliquet ultrices.",
                      },
                      { question: "Is There Refund Policy?", answer: "" },
                      {
                        question: "How Can I Trust Your Supplements?",
                        answer: "",
                      },
                      {
                        question:
                          "Is There Any Side Effects Of This Supplement?",
                        answer: "",
                      },
                      {
                        question: "Is This Helpful To Gain Muscles?",
                        answer: "",
                      },
                    ]
                ).map((faq, i) => {
                  // First item shown open by default (or if answer exists)
                  const isOpen =
                    i === 0 ||
                    (liveData.faqs && liveData.faqs.length > 0 && faq.answer);

                  return (
                    <div
                      key={i}
                      className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-xl p-3.5 shadow-xs transition-all space-y-1.5"
                    >
                      {/* Header Row: Question + Toggle Icon */}
                      <div className="flex justify-between items-center gap-2 cursor-pointer">
                        <h3 className="text-[8.5px] font-extrabold text-slate-900 leading-snug">
                          {faq.question || "Frequently Asked Question Title?"}
                        </h3>
                        <span className="text-slate-500 font-bold text-xs shrink-0 select-none">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>

                      {/* Answer Body (When expanded/present) */}
                      {isOpen && faq.answer && (
                        <p className="text-[7px] text-slate-500 font-normal leading-relaxed pt-1 border-t border-slate-100">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🚀 PIXEL-PERFECT FULL WIDESCREEN VIDEO BANNER */}
            <div className="px-6 py-8 shrink-0">
              <div className="aspect-[2.1/1] w-full rounded-[1.25rem] overflow-hidden shadow-sm bg-slate-900 relative group border border-slate-100/60">
                {/* Video / Product Thumbnail Image */}
                {getYoutubeThumbnail(liveData.videoLink) ||
                liveData.topImage ||
                liveData.productImages?.[0] ? (
                  <img
                    src={
                      getYoutubeThumbnail(liveData.videoLink) ||
                      getImageUrl(
                        liveData.topImage || liveData.productImages?.[0],
                      )!
                    }
                    alt="Product Video Preview"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-[8px]" />
                )}

                {/* Subtle Dark Overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  {/* Black Circle with Cyan Triangle Play Icon */}
                  <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play
                      size={14}
                      style={{
                        color: liveData.buttonColor || "#38bdf8",
                        fill: "transparent",
                      }}
                      className="stroke-[2.5] ml-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 PIXEL-PERFECT "ORDER OUR PRODUCT" SECTION */}
            <div className="px-6 py-10 text-center space-y-6 shrink-0 pb-16">
              {/* Header & Subtitle */}
              <div className="space-y-1 max-w-sm mx-auto">
                <h2
                  className="text-lg font-black tracking-tight"
                  style={{ color: liveData.textColor || "#0f172a" }}
                >
                  Order Our Product
                </h2>
                <p className="text-[8px] text-slate-400 font-normal">
                  This is the only way to get this product in discount.
                </p>
              </div>

              {/* Main Order Grid */}
              <div className="grid grid-cols-2 gap-5 items-start text-left max-w-md mx-auto">
                {/* LEFT COLUMN: Main Image + 3 Thumbnails */}
                <div className="space-y-2.5">
                  {/* Main Image */}
                  <div className="aspect-[1/1.15] bg-slate-100 rounded-[1.25rem] overflow-hidden shadow-sm border border-slate-100/80">
                    {liveData.topImage || selectedProduct?.images?.[0] ? (
                      <img
                        src={
                          getImageUrl(
                            liveData.topImage || selectedProduct?.images?.[0],
                          )!
                        }
                        alt={selectedProduct?.name || "Product Image"}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-[8px]" />
                    )}
                  </div>

                  {/* 3 Thumbnails Row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => {
                      const imgPath =
                        liveData.productImages?.[i] ||
                        selectedProduct?.images?.[i];
                      return (
                        <div
                          key={i}
                          className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shadow-2xs"
                        >
                          {imgPath && (
                            <img
                              src={getImageUrl(imgPath)!}
                              alt={`Thumbnail ${i + 1}`}
                              className="w-full h-full object-cover object-center"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* RIGHT COLUMN: Product Meta, Pricing, Purchase & Tabs */}
                <div className="space-y-2.5 pt-1">
                  {/* Dynamic Star Rating (Mapped to avg_rating) */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => {
                      const rating = Number(
                        selectedProduct?.avg_rating ??
                          selectedProduct?.rating ??
                          5,
                      );
                      return (
                        <Star
                          key={i}
                          size={9}
                          fill={i < rating ? "currentColor" : "none"}
                          className={
                            i < rating
                              ? "border-none text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {selectedProduct?.name || liveData.title || (
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-200">
                        ⚠️ Select Target Product
                      </span>
                    )}
                  </h3>

                  {/* Price Row (Mapped to sell_price & regular_price) */}
                  <div className="flex items-center gap-2">
                    {selectedProduct?.sell_price !== undefined ||
                    selectedProduct?.price !== undefined ? (
                      <span
                        className="text-xs font-black"
                        style={{ color: liveData.buttonColor || "#38bdf8" }}
                      >
                        ৳{selectedProduct?.sell_price ?? selectedProduct?.price}
                      </span>
                    ) : (
                      <span className="text-xs font-black text-slate-400">
                        ৳ --.--
                      </span>
                    )}

                    {(selectedProduct?.regular_price ||
                      selectedProduct?.originalPrice) && (
                      <span className="text-[9px] text-slate-400 font-medium line-through">
                        ৳
                        {selectedProduct?.regular_price ??
                          selectedProduct?.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Short Summary Description (Mapped to short_description) */}
                  <p className="text-[7px] text-slate-500 font-normal leading-relaxed line-clamp-3">
                    {selectedProduct?.short_description ||
                      liveData.subHeadline || (
                        <span className="italic text-slate-400">
                          No product short description provided.
                        </span>
                      )}
                  </p>

                  {/* Purchase Button with Glow */}
                  <div className="pt-1">
                    <button
                      style={{
                        backgroundColor: liveData.buttonColor || "#38bdf8",
                        boxShadow: `0 8px 20px -4px ${liveData.buttonColor || "#38bdf8"}80`,
                      }}
                      className="px-6 py-2 rounded-full text-white font-extrabold text-[8px] uppercase tracking-[0.18em] transition-transform active:scale-95 cursor-pointer"
                    >
                      PURCHASE
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200/80 pt-2 my-1" />

                  {/* Tabs Header (Mapped to total_reviews) */}
                  <div className="flex items-center gap-3 text-[8.5px] font-bold">
                    <span
                      className="cursor-pointer"
                      style={{ color: liveData.buttonColor || "#38bdf8" }}
                    >
                      Description
                    </span>
                    <span className="text-slate-800 cursor-pointer">
                      Reviews (
                      {selectedProduct?.total_reviews ??
                        liveData.reviews?.length ??
                        0}
                      )
                    </span>
                  </div>

                  {/* Detailed Description */}
                  <p className="text-[6.5px] text-slate-500 font-normal leading-relaxed">
                    {selectedProduct?.description || (
                      <span className="italic text-slate-400">
                        Detailed product description will render automatically
                        when bound.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
