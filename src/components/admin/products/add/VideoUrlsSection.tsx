import { useFormContext } from "react-hook-form";

export default function VideoUrlsSection() {
  const { watch, setValue } = useFormContext();
  const videoUrls: string[] = watch("video_urls") || [];
  const videoUrl = videoUrls[0] || "";

  const handleChange = (value: string) => {
    const trimmed = value.trim();
    setValue("video_urls", trimmed ? [trimmed] : [], {
      shouldDirty: true,
    });
  };

  return (
    <div className="bg-[#F9F9F9] rounded-lg p-4">
      <div className="flex gap-2 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M7.99967 13.6673C9.20614 13.6673 10.3631 13.5481 11.4353 13.3296C12.7745 13.0566 13.4442 12.9201 14.0553 12.1344C14.6663 11.3487 14.6663 10.4469 14.6663 8.64298V7.35832C14.6663 5.55447 14.6663 4.65256 14.0553 3.8669C13.4442 3.08124 12.7745 2.94474 11.4353 2.67173C10.3631 2.45316 9.20614 2.33398 7.99967 2.33398C6.79321 2.33398 5.63627 2.45316 4.56405 2.67173C3.22478 2.94474 2.55515 3.08124 1.94407 3.8669C1.33301 4.65256 1.33301 5.55447 1.33301 7.35832V8.64298C1.33301 10.4469 1.33301 11.3487 1.94407 12.1344C2.55515 12.9201 3.22478 13.0566 4.56405 13.3296C5.63627 13.5481 6.79321 13.6673 7.99967 13.6673Z"
            stroke="#A2A2A2"
          />
          <path
            d="M10.6414 8.20795C10.5425 8.61181 10.0161 8.90188 8.96327 9.48208C7.81813 10.113 7.2456 10.4285 6.78187 10.307C6.6248 10.2658 6.48013 10.1934 6.35866 10.0952C6 9.80528 6 9.20328 6 7.99935C6 6.79541 6 6.19343 6.35866 5.90347C6.48013 5.80525 6.6248 5.73287 6.78187 5.69171C7.2456 5.57015 7.81813 5.88565 8.96327 6.51663C10.0161 7.09681 10.5425 7.38688 10.6414 7.79075C10.6751 7.92821 10.6751 8.07048 10.6414 8.20795Z"
            stroke="#A2A2A2"
            strokeLinejoin="round"
          />
        </svg>
        <input
          value={videoUrl}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            handleChange(pasted);
          }}
          className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
          placeholder="Past YouTube Video Link (Optional)"
        />
        <span className="text-black font-lato text-sm font-normal flex items-center">
          YouTube
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M11.6134 15.614L15.0667 19.0673C15.1901 19.1909 15.3366 19.289 15.4979 19.3559C15.6592 19.4228 15.8321 19.4572 16.0067 19.4572C16.1813 19.4572 16.3542 19.4228 16.5155 19.3559C16.6768 19.289 16.8234 19.1909 16.9467 19.0673L20.4 15.614C21.2267 14.774 20.64 13.334 19.4534 13.334H12.56C11.36 13.334 10.7734 14.774 11.6134 15.614Z"
              fill="black"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
