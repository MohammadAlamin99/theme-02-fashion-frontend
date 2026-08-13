import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiFetch } from "@/utils/api";
import { Label } from "./Label";

export default function SidebarTagSection({ isEditMode }: { isEditMode: boolean }) {
  const { setValue, watch } = useFormContext();
  const activeTags = watch("tag_ids") || [];

  const { data: tagsResponse } = useQuery({
    queryKey: ["tags-list-upload-select"],
    queryFn: async () => {
      const res = await apiFetch("/tags");
      return res.json();
    },
  });

  const tagsList = (() => {
    if (Array.isArray(tagsResponse)) return tagsResponse;
    if (tagsResponse?.data && Array.isArray(tagsResponse.data))
      return tagsResponse.data;
    if (tagsResponse?.data?.data && Array.isArray(tagsResponse.data.data))
      return tagsResponse.data.data;
    return [];
  })();

  const handleToggleTagSelection = (tagId: any) => {
    const idStr = String(tagId);
    const updatedTags = activeTags.includes(idStr)
      ? activeTags.filter((id: string) => id !== idStr)
      : [...activeTags, idStr];
    setValue("tag_ids", updatedTags, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
      <h3 className="text-[#003032] font-medium text-base mb-4">
        Tags Assignment
      </h3>
      <Label>Select Associated Tags</Label>
      <div className="max-h-[200px] overflow-y-auto border border-gray-100 p-2.5 rounded-[6px] space-y-1.5 bg-[#F9FAFB]">
        {tagsList.map((tag: any) => {
          const isSelected = activeTags.includes(String(tag.id));
          return (
            <div
              key={tag.id}
              onClick={() => handleToggleTagSelection(tag.id)}
              className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-all border ${
                isSelected
                  ? "bg-sky-100 text-sky-700 border-sky-300 font-semibold"
                  : "hover:bg-gray-100 text-gray-600 border-transparent"
              }`}
            >
              <span>{tag.name}</span>
              {isSelected && <span className="font-bold text-sky-600">✓</span>}
            </div>
          );
        })}
        {tagsList.length === 0 && (
          <span className="text-[11px] text-gray-400">No tags found.</span>
        )}
      </div>
    </div>
  );
}
