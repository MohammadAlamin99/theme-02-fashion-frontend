import React from "react";

export default function HeadingText({ text }: { text: string }) {
  return (
    <div>
      <h2 className="font-inter font-extrabold text-[26px] sm:text-[30px] md:text-4xl text-center text-[#3F3F3F] mb-7 letter-spacing-[1.6px] italic">
        {text}
      </h2>
    </div>
  );
}
