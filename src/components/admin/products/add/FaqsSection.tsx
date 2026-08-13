import PrimaryButton from "../../common/PrimaryButton";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { SectionWrapper } from "./SectionWrapper";

export default function FaqsSection() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

  return (
    <SectionWrapper
      title="FAQs"
      description="Frequently asked questions shown on the product page."
    >
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={field.id} className="rounded-lg p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <input
                {...register(`faqs.${idx}.q`)}
                className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
                placeholder="Question"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-red-500 hover:text-red-700 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              {...register(`faqs.${idx}.a`)}
              className="w-full bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none resize-none min-h-[60px]"
              placeholder="Answer"
            />
          </div>
        ))}

        <PrimaryButton
          label="Add FAQ"
          onClick={() => append({ q: "", a: "" })}
          icon={<PluseIcon />}
        />
      </div>
    </SectionWrapper>
  );
}
