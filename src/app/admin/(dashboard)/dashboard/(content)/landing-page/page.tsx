"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray, Path } from "react-hook-form";
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
  ImageIcon as ImageIconLucide,
  Video,
  FileText,
  Monitor,
  Star,
  Palette,
  Sparkles,
  Play,
} from "lucide-react";
import ContentHead from "@/components/admin/content/ContentHead";
import ContentNavigation from "@/components/admin/content/ContentNavigation";
import ProductSearchSelect, {
  LandingPageProduct,
} from "@/components/admin/content/landing-page/Productsearchselect";
import Image from "next/image";
import CustomImageIcon from "./CustomImageIcon";

// Renamed on import to avoid clashing with the native browser ImageIcon-less
// name collision some bundlers warn about; keep JSX usage as <ImageIconLucide />.
const ImageIcon = ImageIconLucide;

/**
 * The product list hook's return shape isn't pinned down here (it lives in
 * useAllProductsForLP), so we normalize with a type guard instead of
 * reaching for `any`.
 */
function extractProductArray(source: unknown): LandingPageProduct[] {
  if (Array.isArray(source)) return source as LandingPageProduct[];
  if (
    source &&
    typeof source === "object" &&
    "data" in source &&
    Array.isArray((source as { data: unknown }).data)
  ) {
    return (source as { data: LandingPageProduct[] }).data;
  }
  return [];
}

function extractImageUrl(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const inner = (val as Record<string, unknown>).url;
    if (typeof inner === "string") return inner;
    if (inner && typeof inner === "object") {
      const deepUrl = (inner as Record<string, unknown>).url;
      if (typeof deepUrl === "string") return deepUrl;
    }
  }
  return "";
}
export default function LandingPagePage() {
  const lastLoadedId = useRef<string | null>(null);

  // Extract YouTube video ID from a URL.
  const getYoutubeId = (url: string | undefined | null) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Get the YouTube thumbnail URL for a video link.
  const getYoutubeThumbnail = (url: string | undefined | null) => {
    const videoId = getYoutubeId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;
  };

  // Resolves relative image paths coming back from the backend.
  const getImageUrl = useCallback((val: unknown) => {
    let path = "";
    if (typeof val === "string") {
      path = val;
    } else if (val && typeof val === "object") {
      const inner = (val as Record<string, unknown>).url;
      if (typeof inner === "string") {
        path = inner;
      } else if (inner && typeof inner === "object") {
        path = (inner as Record<string, string>).url || "";
      }
    }
    if (!path || typeof path !== "string" || path.trim() === "") return null;
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
      videoId = url.split("embed/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0] || "";
    }

    if (videoId) {
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
    fieldPath: Path<CreateLandingPageDto>,
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
    } catch {
      toast.error("Upload failed", { id: tId });
    }
  };

  const onSubmit = (formData: CreateLandingPageDto) => {
    if (!formData.topImage) {
      toast.error("Please upload the Hero Image first!");
      return;
    }
    if (!formData.productId) {
      toast.error("Please select a product first!");
      return;
    }
    savePage(formData, {
      onSuccess: () => toast.success("Landing Page Published!"),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const productsArray = extractProductArray(productList);
  const selectedProduct = productsArray.find(
    (p) => p.id === liveData.productId,
  );

  if (isLoadingProducts)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  const embedVideoUrl = getEmbedVideoUrl(liveData.videoLink);

  return (
    <div className="bg-white min-h-screen text-slate-800 font-poppins">
      <ContentHead />
      <ContentNavigation />

      <div className="flex h-[calc(100vh-105px)] overflow-hidden">
        {/* ========================================================= */}
        {/* --- LEFT EDITOR --- */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[58%] overflow-y-auto scrollbar-hide space-y-6 pb-40 px-6"
        >
          {/* PRODUCT & URL CONFIGURATION */}
          <div className="bg-white pt-6 space-y-4">
            <SectionLabel text="Product" />
            <ProductSearchSelect
              selectedProduct={
                selectedProduct as LandingPageProduct | undefined
              }
              onSelect={(product) =>
                setValue("productId", product.id, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onClear={() =>
                setValue("productId", "", {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              resolveImageUrl={getImageUrl}
              placeholder="Search by product name..."
              hasError={!liveData.productId}
            />
            {/* Kept registered so RHF still validates/tracks productId */}
            <input
              type="hidden"
              {...register("productId", { required: true })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel text="Slug" />
                <div className="flex items-center bg-[#F9FAFB] rounded-lg border-[#E5E7EB] border">
                  <input
                    {...register("slug", { required: true })}
                    placeholder="custom-landing-slug"
                    className="flex-1 p-4 bg-transparent outline-none text-[#AEAEAE] text-sm font-normal"
                  />
                </div>
              </div>
              <div>
                <FieldLabel text="SEO Meta Title" />
                <input
                  {...register("title")}
                  placeholder="SEO Meta Title"
                  className="w-full p-4 text-[#AEAEAE] bg-[#F9FAFB] border-[#E5E7EB] rounded-lg outline-none text-sm font-normal border"
                />
              </div>
            </div>
          </div>

          {/* HERO SECTION */}
          <div className="bg-white space-y-4">
            <SectionHeader icon={<Layout size={14} />} text="Hero Section" />
            {/* <div className="grid grid-cols-[1.2fr_1.8fr] gap-6 items-start h-full">
              <div className="h-full">
                <FieldLabel text="Top Image" />
                <ImageUploadBox
                  imageUrl={getImageUrl(liveData.topImage)}
                  onChange={(e) => onImageUpload(e, "topImage")}
                  label={liveData.topImage ? "Change Image" : "Add Image"}
                />
                <input
                  type="hidden"
                  {...register("topImage", { required: true })}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <FieldLabel text="Headline Text*" />
                  <textarea
                    {...register("headline", { required: true })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg py-2.5 px-3 text-[15px] font-normal ocus:outline-none focus:ring-0 focus:border-transparent"
                    placeholder="Enter Text"
                  />
                </div>
                <div>
                  <FieldLabel text="Sub Headline Text*" />
                  <textarea
                    {...register("subHeadline")}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg py-2.5 px-3 text-[15px] font-normal ocus:outline-none focus:ring-0 focus:border-transparent"
                    placeholder="Enter Text"
                  />
                </div>
              </div>
            </div> */}

            <div className="grid grid-cols-[1.2fr_1.8fr] gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <FieldLabel text="Top Image" />

                <div className="flex-1">
                  <ImageUploadBox
                    imageUrl={getImageUrl(liveData.topImage)}
                    onChange={(e) => onImageUpload(e, "topImage")}
                    label={liveData.topImage ? "Change Image" : "Add Image"}
                  />
                </div>

                <input
                  type="hidden"
                  {...register("topImage", { required: true })}
                />
              </div>

              <div className="flex flex-col gap-4 h-full">
                <div className="">
                  <FieldLabel text="Headline Text*" />
                  <textarea
                    {...register("headline", { required: true })}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg py-2.5 px-3 text-[15px] font-normal focus:outline-none focus:ring-0 focus:border-transparent"
                    placeholder="Enter Text"
                  />
                </div>

                <div className="h-full">
                  <FieldLabel text="Sub Headline Text*" />
                  <textarea
                    {...register("subHeadline")}
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg py-2.5 px-3 text-[15px] font-normal focus:outline-none focus:ring-0 focus:border-transparent"
                    placeholder="Enter Text"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OFFERS / TRUST BAR */}
          {/* <div className="bg-white space-y-4">
            <SectionHeader
              icon={<Sparkles size={14} />}
              text="Offers & Trust Highlights"
              onAdd={() => appendOffer({ title: "", subTitle: "", icon: "" })}
              addLabel="Add More"
            />
            <div className="space-y-3">
              {offerFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg flex-wrap"
                >
                  <IconUploadSlot
                    imageUrl={getImageUrl(watch(`offers.${index}.icon`))}
                    onChange={(e) => onImageUpload(e, `offers.${index}.icon`)}
                  />
                  <input
                    {...register(`offers.${index}.title`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Offer Headline"
                  />
                  <input
                    {...register(`offers.${index}.subTitle`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Offer Sub Headline"
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
          </div> */}

          <div className="bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-lato text-[#023337]">
                Offer Section
              </h2>
            </div>

            {/* Offers List */}
            <div className="space-y-6">
              {offerFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-5 items-end font-lato"
                >
                  {/* Offer Headline Input */}
                  <div className="col-span-5">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Offer Headline
                    </label>
                    <input
                      {...register(`offers.${index}.title`)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 text-[15px] outline-none"
                      placeholder="Enter Text"
                    />
                  </div>

                  {/* Offer Sub Headline Input */}
                  <div className="col-span-5">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Offer Sub Headline
                    </label>
                    <input
                      {...register(`offers.${index}.subTitle`)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 text-[15px] outline-none"
                      placeholder="Enter Text"
                    />
                  </div>

                  {/* Icon Upload Slot */}
                  <div className="col-span-2 flex flex-col items-start">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Icon
                    </label>
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 cursor-pointer">
                        <IconUploadSlot
                          imageUrl={getImageUrl(watch(`offers.${index}.icon`))}
                          onChange={(e) =>
                            onImageUpload(e, `offers.${index}.icon`)
                          }
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeOffer(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() =>
                  appendOffer({ title: "", subTitle: "", icon: "" })
                }
                className="bg-[#FF9F1C] text-white text-sm font-semibold cursor-pointer py-2 px-4 rounded-lg"
              >
                Add More
              </button>
            </div>
          </div>

          {/* KEY FEATURES */}
          {/* <div className="bg-white space-y-4">
            <SectionHeader
              icon={<CheckCircle2 size={14} />}
              text="Key Features"
              onAdd={() => appendFeat({ title: "", subTitle: "", icon: "" })}
              addLabel="Add Feature"
            />
            <div className="space-y-3">
              {featFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex-wrap"
                >
                  <IconUploadSlot
                    imageUrl={getImageUrl(watch(`features.${index}.icon`))}
                    onChange={(e) => onImageUpload(e, `features.${index}.icon`)}
                  />
                  <input
                    {...register(`features.${index}.title`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Feature Name"
                  />
                  <input
                    {...register(`features.${index}.subTitle`)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500/20"
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
          </div> */}

          <div className="bg-white">
            {/* Header Section - প্রথম কোডের মতো ডিজাইন */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-lato text-[#023337]">
                Key Features
              </h2>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {featFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-5 items-end font-lato"
                >
                  {/* Feature Title Input */}
                  <div className="col-span-5">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Feature Name
                    </label>
                    <input
                      {...register(`features.${index}.title`)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 text-[15px] outline-none focus:border-[#FF9F1C] transition"
                      placeholder="Enter Text"
                    />
                  </div>

                  {/* Feature Sub Title Input */}
                  <div className="col-span-5">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Short feature explanation
                    </label>
                    <input
                      {...register(`features.${index}.subTitle`)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 text-[15px] outline-none focus:border-[#FF9F1C] transition"
                      placeholder="Enter Text"
                    />
                  </div>

                  {/* Icon & Delete Button Section */}
                  <div className="col-span-2 flex flex-col items-start">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Icon
                    </label>
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 cursor-pointer">
                        <IconUploadSlot
                          imageUrl={getImageUrl(
                            watch(`features.${index}.icon`),
                          )}
                          onChange={(e) =>
                            onImageUpload(e, `features.${index}.icon`)
                          }
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeFeat(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() =>
                  appendFeat({ title: "", subTitle: "", icon: "" })
                }
                className="bg-[#FF9F1C] text-white text-sm font-semibold cursor-pointer py-2.5 px-6 rounded-lg hover:bg-[#e68a17] transition"
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* SHOWCASE GALLERY */}
          <div className="bg-white space-y-4">
            <SectionHeader
              icon={<ImageIcon size={14} />}
              text={`Product Image (${liveData.productImages?.filter(Boolean).length ?? 0}/4)`}
            />
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
                      alt={`Product ${i + 1}`}
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
            <p className="text-[10px] text-slate-400">
              Note: Use images with a 1:1.6 aspect ratio (855×1386 pixels.)
            </p>
          </div>

          {/* VIDEO SECTION */}
          <div className="bg-white space-y-4 font-lato">
            <SectionHeader icon={<Video size={14} />} text="Video Section" />
            <div>
              <FieldLabel text="Video Link" />
              <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                {/* <Link2 size={16} className="text-slate-400 ml-1" /> */}
                <input
                  {...register("videoLink")}
                  className="flex-1 bg-transparent outline-none text-[15px] font-semibold text-slate-700"
                  placeholder="Paste YouTube Link"
                />
              </div>
            </div>

            {getYoutubeThumbnail(liveData.videoLink) ? (
              <div className="mt-1 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative group shadow-sm">
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

          {/* CUSTOMER REVIEWS */}
          {/* <div className="bg-white space-y-4">
            <SectionHeader
              icon={<Star size={14} />}
              text="Customer Reviews"
              onAdd={() =>
                appendReview({ name: "", quote: "", rating: 5, image: "" })
              }
              addLabel="Add More"
            />
            <div className="space-y-4">
              {reviewFields.map((f, i) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <label className="h-10 w-10 border border-dashed border-slate-300 rounded-full bg-white flex items-center justify-center cursor-pointer shrink-0 overflow-hidden hover:border-orange-400 transition">
                        {watch(`reviews.${i}.image`) ? (
                          <img
                            src={getImageUrl(watch(`reviews.${i}.image`))!}
                            className="w-full h-full object-cover"
                            alt="Reviewer"
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
                      <input
                        type="number"
                        min={0}
                        max={5}
                        {...register(`reviews.${i}.rating`, {
                          valueAsNumber: true,
                        })}
                        className="w-14 bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none text-center focus:ring-2 focus:ring-blue-500/20"
                        placeholder="5"
                      />
                    </div>
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
          </div> */}

          <div className="bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-lato text-[#023337]">
                Customer Reviews
              </h2>
            </div>

            {/* Reviews List */}
            <div className="space-y-8">
              {reviewFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-5 items-start font-lato p-5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]"
                >
                  {/* Customer Image Slot */}
                  <div className="col-span-2 flex flex-col items-start">
                    <label className="block text-[15px] font-bold text-[#023337] mb-2">
                      Photo
                    </label>
                    <div className="w-full">
                      <IconUploadSlot
                        imageUrl={getImageUrl(watch(`reviews.${index}.image`))}
                        onChange={(e) =>
                          onImageUpload(e, `reviews.${index}.image`)
                        }
                      />
                    </div>
                  </div>

                  {/* Name and Rating Section */}
                  <div className="col-span-9 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Customer Name */}
                      <div>
                        <label className="block text-[15px] font-bold text-[#023337] mb-2">
                          Customer Name
                        </label>
                        <input
                          {...register(`reviews.${index}.name`)}
                          className="w-full bg-white border border-[#E5E7EB] rounded-lg p-3 text-[15px] outline-none focus:border-[#FF9F1C]"
                          placeholder="Enter customer name"
                        />
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-[15px] font-bold text-[#023337] mb-2">
                          Rating (0-5)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={0.1}
                          {...register(`reviews.${index}.rating`, {
                            valueAsNumber: true,
                          })}
                          className="w-full bg-white border border-[#E5E7EB] rounded-lg p-3 text-[15px] outline-none focus:border-[#FF9F1C]"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    {/* Quote / Testimonial */}
                    <div>
                      <label className="block text-[15px] font-bold text-[#023337] mb-2">
                        Customer Quote
                      </label>
                      <textarea
                        {...register(`reviews.${index}.quote`)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-lg p-3 text-[15px] outline-none focus:border-[#FF9F1C] resize-none"
                        placeholder="Enter customer testimonial..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 flex justify-end pt-9">
                    <button
                      type="button"
                      onClick={() => removeReview(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() =>
                  appendReview({ name: "", quote: "", rating: 5, image: "" })
                }
                className="bg-[#FF9F1C] text-white text-sm font-semibold cursor-pointer py-2.5 px-6 rounded-lg hover:bg-[#e68a17] transition"
              >
                Add Review
              </button>
            </div>
          </div>

          {/* FAQS */}
          {/* <div className="bg-white space-y-4">
            <SectionHeader
              icon={<HelpCircle size={14} />}
              text="Frequently Asked Questions"
              onAdd={() => appendFaq({ question: "", answer: "" })}
              addLabel="Add More"
            />
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
          </div> */}

          <div className="bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-lato text-[#023337]">
                Frequently Asked Questions
              </h2>
            </div>

            {/* FAQ List */}
            <div className="space-y-6">
              {faqFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] font-lato relative group"
                >
                  {/* Delete Button - Top Right */}
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Question Input */}
                    <div className="pr-12">
                      {" "}
                      {/* Space for delete button */}
                      <label className="block text-[15px] font-bold text-[#023337] mb-2">
                        Question
                      </label>
                      <input
                        {...register(`faqs.${index}.question`)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-lg p-4 text-[15px] outline-none focus:border-[#FF9F1C] transition"
                        placeholder="e.g., What is your return policy?"
                      />
                    </div>

                    {/* Answer Input */}
                    <div>
                      <label className="block text-[15px] font-bold text-[#023337] mb-2">
                        Answer
                      </label>
                      <textarea
                        {...register(`faqs.${index}.answer`)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-lg p-4 text-[15px] outline-none focus:border-[#FF9F1C] transition resize-none"
                        placeholder="Provide a clear answer..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => appendFaq({ question: "", answer: "" })}
                className="bg-[#FF9F1C] text-white text-sm font-semibold cursor-pointer py-2.5 px-6 rounded-lg hover:bg-[#e68a17] transition"
              >
                Add FAQ
              </button>
            </div>
          </div>

          {/* THEME BRANDING */}
          <div className="bg-white space-y-4">
            <SectionHeader icon={<Palette size={14} />} text="Theme Section" />
            <div className="grid grid-cols-3 gap-6">
              <ColorField
                label="Background Colour"
                value={liveData.backgroundColor}
                registerProps={register("backgroundColor")}
              />
              <ColorField
                label="Button Colour"
                value={liveData.buttonColor}
                registerProps={register("buttonColor")}
              />
              <ColorField
                label="Text Colour"
                value={liveData.textColor}
                registerProps={register("textColor")}
              />
            </div>
          </div>

          {/* SUBMIT FOOTER */}
          <div className="flex justify-between items-center py-6 border-t border-slate-200">
            <button
              type="button"
              className="font-medium text-slate-600 flex items-center gap-2 text-sm hover:text-slate-900 transition bg-gray-200 p-4 rounded-lg cursor-pointer"
            >
              <FileText size={18} /> Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSaving || !liveData.productId}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-3.5 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
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
        {/* --- RIGHT PREVIEW --- */}
        {/* ========================================================= */}
        <div className="w-[42%] bg-white rounded-lg p-6 overflow-y-auto scrollbar-hide flex flex-col items-center">
          <div className="flex justify-between items-center w-full max-w-md mb-4 font-bold text-slate-700 text-sm shrink-0">
            Live Visual Preview <Monitor size={20} />
          </div>

          <div
            className="w-full max-w-md h-[780px] bg-white rounded-xl border-5 border-[#F9F9F9] overflow-y-auto scrollbar-hide flex flex-col transition-all shrink-0"
            style={{
              backgroundColor: liveData.backgroundColor || "#ffffff",
              color: liveData.textColor || "#111827",
            }}
          >
            <div className="px-8 py-12 grid grid-cols-2 gap-6 items-center shrink-0">
              <div className="flex flex-col items-center text-center space-y-4 max-w-xs mx-auto">
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
                <p className="text-[9px] text-zinc-400 font-medium leading-relaxed max-w-[200px]">
                  {liveData.subHeadline ||
                    "Write here about your product short description."}
                </p>
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

            {liveData.offers && liveData.offers.length > 0 && (
              <div className="bg-[#f3f3f3] py-7 px-4 grid grid-cols-3 gap-3 items-center shrink-0">
                {liveData.offers.map((off, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center space-y-1 px-1"
                  >
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
                    <p className="text-[9px] font-black text-slate-900 leading-tight tracking-tight">
                      {off.title || "100% High Quality Product"}
                    </p>
                    {off.subTitle && (
                      <p className="text-[6.5px] font-normal text-slate-500 leading-normal max-w-[130px]">
                        {off.subTitle}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="px-8 py-10 text-center space-y-6 shrink-0">
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

            <div className="px-6 py-10 text-center space-y-6 shrink-0 border-t border-slate-100">
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

              <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-3 items-center">
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
                        <div className="space-y-0.5 max-w-[120px]">
                          <h3 className="text-[9px] font-extrabold text-slate-900 leading-tight">
                            {feat?.title || defaultTitles[idx]}
                          </h3>
                          <p className="text-[6.5px] text-slate-500 font-normal leading-snug">
                            {feat?.subTitle || defaultSubs[idx]}
                          </p>
                        </div>
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

            <div className="px-6 py-10 text-center space-y-6 shrink-0">
              <h2
                className="text-lg font-black tracking-tight"
                style={{ color: liveData.textColor || "#0f172a" }}
              >
                Customer&rsquo;s Reviews
              </h2>

              <div className="grid grid-cols-[1.2fr_1fr] gap-4 items-center relative max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.25rem] shadow-xl text-left space-y-3 relative z-10 border border-slate-100/60">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[7px]">
                      👍
                    </div>
                    <span className="text-[9px] font-black tracking-tight">
                      Testimonial
                    </span>
                  </div>
                  <p className="text-[7.5px] text-slate-600 font-normal leading-relaxed relative z-10">
                    {liveData.reviews?.[0]?.quote ||
                      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit."}
                  </p>
                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <h4 className="text-[9px] font-extrabold text-slate-900 leading-none">
                        {liveData.reviews?.[0]?.name || "Simon Árpád"}
                      </h4>
                      <span className="text-[6px] text-slate-400 font-medium leading-tight block mt-0.5">
                        Verified Customer
                      </span>
                    </div>
                    <span className="text-6xl font-serif text-slate-200 leading-none -mb-1">
                      &ldquo;
                    </span>
                  </div>
                </div>

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
                  <div className="absolute bottom-3 right-3 bg-black text-white text-[7px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <span>Next</span>
                    <span>›</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center gap-1.5 pt-1">
                <span
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ backgroundColor: liveData.buttonColor || "#38bdf8" }}
                />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="px-6 py-10 text-center space-y-6 shrink-0">
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
                  const isOpen =
                    i === 0 ||
                    (liveData.faqs &&
                      liveData.faqs.length > 0 &&
                      Boolean(faq.answer));
                  return (
                    <div
                      key={i}
                      className="bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-xl p-3.5 shadow-xs transition-all space-y-1.5"
                    >
                      <div className="flex justify-between items-center gap-2 cursor-pointer">
                        <h3 className="text-[8.5px] font-extrabold text-slate-900 leading-snug">
                          {faq.question || "Frequently Asked Question Title?"}
                        </h3>
                        <span className="text-slate-500 font-bold text-xs shrink-0 select-none">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
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

            <div className="px-6 py-8 shrink-0">
              <div className="aspect-[2.1/1] w-full rounded-[1.25rem] overflow-hidden shadow-sm bg-slate-900 relative group border border-slate-100/60">
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
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
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

            <div className="px-6 py-10 text-center space-y-6 shrink-0 pb-16">
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

              <div className="grid grid-cols-2 gap-5 items-start text-left max-w-md mx-auto">
                <div className="space-y-2.5">
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
                <div className="space-y-2.5 pt-1">
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

                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {selectedProduct?.name || liveData.title || (
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-200">
                        ⚠️ Select Target Product
                      </span>
                    )}
                  </h3>

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

                  <p className="text-[7px] text-slate-500 font-normal leading-relaxed line-clamp-3">
                    {selectedProduct?.short_description ||
                      liveData.subHeadline || (
                        <span className="italic text-slate-400">
                          No product short description provided.
                        </span>
                      )}
                  </p>

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

                  <div className="border-t border-slate-200/80 pt-2 my-1" />

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

/* ---------------------------------------------------------------------- */
/* Small presentational helpers                                          */
/* ---------------------------------------------------------------------- */

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[15px] font-bold font-lato text-[#023337]">{text}</p>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <label className="block text-[15px] font-bold text-[#023337] font-lato mb-1.5">
      {text}
    </label>
  );
}

function SectionHeader({
  text,
  onAdd,
  addLabel,
}: {
  icon: React.ReactNode;
  text: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex justify-between items-center pb-3">
      <div className="flex items-center gap-2 text-lg font-lato font-bold text-[#023337]">
        {text}
      </div>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition shadow-sm"
        >
          <Plus size={14} /> {addLabel ?? "Add More"}
        </button>
      )}
    </div>
  );
}

// function ImageUploadBox({
//   imageUrl,
//   onChange,
//   label,
// }: {
//   imageUrl: string | null;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   label: string;
// }) {
//   return (
//     <div className="h-full">
//       <div className="border border-[#E5E7EB] gap-4 rounded-lg h-52 flex flex-col items-center justify-center bg-slate-50">
//         {imageUrl ? (
//           <Image
//             width={400}
//             height={400}
//             src={imageUrl}
//             className="inset-0 w-full h-full object-cover"
//             alt="Upload preview"
//             unoptimized
//           />
//         ) : (
//           <CustomImageIcon />
//         )}
//         <p className="text-[10px] text-[#A2A2A2] font-lato">
//           Note: Use images with a 1:1.6 aspect ratio (855×1386 pixels.)
//         </p>
//         <label className="bg-[#FF9F1C] text-white text-[14px] px-4 py-2 rounded-lg font-bold cursor-pointer z-10">
//           {label}
//           <input type="file" className="hidden" onChange={onChange} />
//         </label>
//       </div>
//     </div>
//   );
// }

function ImageUploadBox({
  imageUrl,
  onChange,
  label,
}: {
  imageUrl: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) {
  return (
    <div className="h-full">
      <div className="relative overflow-hidden border border-[#E5E7EB] gap-4 rounded-lg h-52 flex flex-col items-center justify-center bg-slate-50">
        {imageUrl ? (
          <Image
            width={400}
            height={400}
            src={imageUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Upload preview"
            unoptimized
          />
        ) : (
          <CustomImageIcon />
        )}
        <p className="relative z-10 text-[10px] text-[#A2A2A2] font-lato">
          Note: Use images with a 1:1.6 aspect ratio (855×1386 pixels.)
        </p>
        <label className="relative z-10 bg-[#FF9F1C] text-white text-[14px] px-4 py-2 rounded-lg font-bold cursor-pointer">
          {label}
          <input type="file" className="hidden" onChange={onChange} />
        </label>
      </div>
    </div>
  );
}

function IconUploadSlot({
  imageUrl,
  onChange,
}: {
  imageUrl: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="h-14 w-14 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] flex items-center justify-center cursor-pointer shrink-0">
      {imageUrl ? (
        <Image
          src={imageUrl}
          className="w-full h-full object-contain p-1"
          alt="Icon"
          width={64}
          height={64}
          unoptimized
        />
      ) : (
        <ImageIcon size={16} className="text-slate-400" />
      )}
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  );
}

function ColorField({
  label,
  value,
  registerProps,
}: {
  label: string;
  value: string | undefined;
  registerProps: ReturnType<
    ReturnType<typeof useForm<CreateLandingPageDto>>["register"]
  >;
}) {
  return (
    <div className="space-y-1.5 font-lato">
      <label className="text-[15px] font-bold text-[#023337]">{label}</label>
      <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg p-1.5 bg-[#F9FAFB] mt-2">
        <input
          type="color"
          {...registerProps}
          className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
        />
        <span className="text-xs font-mono font-semibold uppercase">
          {value}
        </span>
      </div>
    </div>
  );
}
