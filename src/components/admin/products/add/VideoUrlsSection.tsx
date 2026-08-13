import { useState } from "react";
import { useFormContext } from "react-hook-form";
import PrimaryButton from "../../common/PrimaryButton";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import { Trash2 } from "lucide-react";
import { SectionWrapper } from "./SectionWrapper";

export default function VideoUrlsSection() {
  const { watch, setValue } = useFormContext();
  const videoUrls: string[] = watch("video_urls") || [];
  const [draftUrl, setDraftUrl] = useState("");

  const handleAddUrl = () => {
    if (!draftUrl.trim()) return;
    setValue("video_urls", [...videoUrls, draftUrl.trim()]);
    setDraftUrl("");
  };

  const handleRemoveUrl = (idx: number) => {
    setValue(
      "video_urls",
      videoUrls.filter((_, i) => i !== idx),
    );
  };

  return (
    <SectionWrapper
      title="Video URLs"
      description="YouTube or other hosted video links for this product."
    >
      <div className="space-y-3">
        {videoUrls.map((url, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              value={url}
              readOnly
              className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none text-gray-600"
            />
            <button
              type="button"
              onClick={() => handleRemoveUrl(idx)}
              className="text-red-500 hover:text-red-700 shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <div className="flex gap-2 items-center">
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <PrimaryButton
            label="Add Video URL"
            onClick={handleAddUrl}
            icon={<PluseIcon />}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}