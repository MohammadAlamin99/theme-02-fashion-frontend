"use client";
import { useFormContext, Controller } from "react-hook-form";
import TiptapEditor from "./TiptapEditor";

export const RichTextSection = ({
  title,
  placeholder,
  name,
}: {
  title: string;
  placeholder: string;
  name: string;
}) => {
  const { control } = useFormContext();

  return (
    <div className="mb-8">
      <h3 className="text-[22px] font-bold text-black mb-4 font-lato">
        {title}
      </h3>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TiptapEditor
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
};
