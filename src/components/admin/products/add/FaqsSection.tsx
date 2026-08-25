/* eslint-disable @typescript-eslint/no-explicit-any */
// import PrimaryButton from "../../common/PrimaryButton";
// import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
// import { useFieldArray, useFormContext } from "react-hook-form";
// import { Trash2 } from "lucide-react";
// import { SectionWrapper } from "./SectionWrapper";

// export default function FaqsSection() {
//   const { control, register } = useFormContext();
//   const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

//   return (
//     <SectionWrapper
//       title="FAQs"
//       description="Frequently asked questions shown on the product page."
//     >
//       <div className="space-y-4">
//         {fields.map((field, idx) => (
//           <div key={field.id} className="rounded-lg p-3 space-y-2">
//             <div className="flex gap-2 items-center">
//               <input
//                 {...register(`faqs.${idx}.q`)}
//                 className="flex-1 bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none"
//                 placeholder="Question"
//               />
//               <button
//                 type="button"
//                 onClick={() => remove(idx)}
//                 className="text-red-500 hover:text-red-700 shrink-0"
//               >
//                 <Trash2 size={16} />
//               </button>
//             </div>
//             <textarea
//               {...register(`faqs.${idx}.a`)}
//               className="w-full bg-[#F9F9F9] px-2.5 py-4 text-xs rounded outline-none resize-none min-h-[60px]"
//               placeholder="Answer"
//             />
//           </div>
//         ))}

//         <PrimaryButton
//           label="Add FAQ"
//           onClick={() => append({ q: "", a: "" })}
//           icon={<PluseIcon />}
//         />
//       </div>
//     </SectionWrapper>
//   );
// }

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionWrapper } from "./SectionWrapper";

function SortableFaqRow({
  field,
  idx,
  register,
  remove,
}: {
  field: { id: string };
  idx: number;
  register: any;
  remove: (idx: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl p-4">
      <div className="flex gap-4">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 mt-8"
        >
          <GripVertical size={20} />
        </button>

        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Question
            </label>
            <input
              {...register(`faqs.${idx}.q`)}
              className="w-full bg-[#F9F9F9] px-3 py-3 text-sm rounded-lg outline-none"
              placeholder="e.g. What is the warranty period?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              Answer
            </label>
            <textarea
              {...register(`faqs.${idx}.a`)}
              className="w-full bg-[#F9F9F9] px-3 py-3 text-sm rounded-lg outline-none resize-none min-h-[80px]"
              placeholder="e.g. This product comes with a 1 year warranty."
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => remove(idx)}
          className="shrink-0 mt-8 flex items-center justify-center rounded-lg bg-[#FEF5F5] w-10 h-10 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
              stroke="#DA0000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.9994 15L9 9M9.00064 15L15 9"
              stroke="#DA0000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function FaqsSection() {
  const { control, register } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "faqs",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    move(oldIndex, newIndex);
  }

  return (
    <SectionWrapper
      title="FAQs"
      description="Frequently asked questions shown on the product page."
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <SortableFaqRow
                key={field.id}
                field={field}
                idx={idx}
                register={register}
                remove={remove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => append({ q: "", a: "" })}
        className="mt-3 flex items-center gap-2 bg-[#F5F5F5] px-4 py-3 rounded-lg text-sm font-medium"
      >
        <span className="border border-black rounded-full">
          <Plus size={16} />
        </span>
        Add FAQ
      </button>
    </SectionWrapper>
  );
}
