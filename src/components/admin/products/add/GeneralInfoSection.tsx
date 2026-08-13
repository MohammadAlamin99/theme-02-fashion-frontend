import { uploadProductMedia } from "@/services-api/productService";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { SectionWrapper } from "./SectionWrapper";
import { Label } from "./Label";
import { Toggle } from "./Toggle";
import Image from "next/image";
import { Loader2, Trash2 } from "lucide-react";
import IamgeIcon from "@/components/store-front/svg/svg/IamgeIcon";
import RichTextEditor from "./Richtexteditor";

export default function GeneralInfoSection({
  images,
  setImages,
  uploading,
  setUploading,
}: {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}) {
  const { register, setValue, watch, control } = useFormContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const autoSlug = watch("autoSlug");
  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const paths = await uploadProductMedia(files);
      if (paths.length > 0) {
        setImages((prev: string[]) => [...prev, ...paths]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Asset Sync Rejection: ${err.message}`);
      } else {
        toast.error(`Asset Sync Rejection: Something went wrong`);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <SectionWrapper title="General Information">
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-end mb-1">
            <Label required>Item Name</Label>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setValue("autoSlug", !autoSlug)}
            >
              <span className="text-xs text-gray-400">Auto Slug</span>
              <Toggle
                checked={!!autoSlug}
                onChange={(val) => setValue("autoSlug", val)}
              />
            </div>
          </div>
          <input
            {...register("name", {
              required: true,
              onChange: (e) => {
                if (autoSlug) {
                  const computed = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  setValue("slug", computed);
                }
              },
            })}
            className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2]"
            placeholder="Ex: Samsung Galaxy S23 Ultra"
          />
        </div>

        <div>
          <Label required>Slug</Label>
          <input
            {...register("slug")}
            disabled={autoSlug}
            className="w-full bg-[#F9F9F9] rounded-[8px] px-4 py-3 text-sm outline-none text-gray-500 disabled:opacity-60"
            placeholder="samsung-galaxy-s23-ultra"
          />
        </div>

        <div>
          <Label required>Media</Label>
          <div className="bg-[#F9F9F9] rounded-[8px] p-6 text-center relative flex flex-col items-center justify-center min-h-[160px]">
            {images.length > 0 && (
              <div className="flex flex-row flex-wrap items-center justify-center gap-3 mb-4">
                {images.map((src: string, i: number) => {
                  const cleanImg = src.trim();
                  const finalSrc = cleanImg.startsWith("http")
                    ? cleanImg
                    : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`;

                  return (
                    <div
                      key={i}
                      className="relative group w-20 h-20 rounded border border-gray-200 overflow-hidden bg-white shadow-xs shrink-0"
                    >
                      <Image
                        unoptimized
                        width={100}
                        height={100}
                        src={finalSrc}
                        className="w-full h-full object-cover"
                        alt={`image ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages(
                            images.filter(
                              (_: string, idx: number) => idx !== i,
                            ),
                          )
                        }
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer flex flex-col items-center select-none"
            >
              <IamgeIcon size="48" color="#999" />
              <span className="text-[#A2A2A2] text-base font-normal">
                Drag image here or click to add.
              </span>
              <span className="max-w-[300px] text-xs text-[#A2A2A2] mt-2 font-normal">
                Recommended formats: JPG, PNG. Max size: 4MB. Use 1:1 aspect
                ratio (1080×1080 px).
              </span>
              <button className="cursor-pointer text-sm font-lato font-semibold px-4 py-2 bg-[#FF9F1C] rounded-sm text-white mt-3">
                Add Image
              </button>
            </div>
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              onChange={handleUpload}
              accept="image/*"
              multiple
              disabled={uploading}
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-[8px]">
                <Loader2 className="animate-spin text-orange-500" size={24} />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Short Description</Label>
          <textarea
            {...register("short_description")}
            className="w-full bg-[#F9FAFB] rounded-[8px] px-4 py-3 text-sm min-h-[80px] outline-none text-gray-800 resize-none"
            placeholder="Summary highlights..."
          />
        </div>

        <div>
          <Label required>Product Description</Label>
          <Controller
            name="description"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Ex: Description"
              />
            )}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
