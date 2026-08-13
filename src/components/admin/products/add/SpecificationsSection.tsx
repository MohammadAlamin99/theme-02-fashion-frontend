import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { SectionWrapper } from "./SectionWrapper";
import PrimaryButton from "../../common/PrimaryButton";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";

export default function SpecificationsSection() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });

  return (
    <SectionWrapper
      title="Specifications"
      description="Key/value technical spec rows (e.g. Origin: Bangladesh)."
    >
      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              {...register(`specifications.${idx}.type`)}
              className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
              placeholder="Type (e.g. Origin)"
            />
            <input
              {...register(`specifications.${idx}.desc`)}
              className="flex-[2] bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
              placeholder="Description (e.g. Bangladesh)"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-red-500 hover:text-red-700 shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <PrimaryButton
          label="Add Specification"
          onClick={() => append({ type: "", desc: "" })}
          icon={<PluseIcon />}
        />
      </div>
    </SectionWrapper>
  );
}
