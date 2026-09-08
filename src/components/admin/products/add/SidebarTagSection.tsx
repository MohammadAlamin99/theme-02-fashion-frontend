// import { useState, useRef, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useFormContext } from "react-hook-form";
// import { apiFetch } from "@/utils/api";
// import { Label } from "./Label";

// interface TagItem {
//   id: string | number;
//   name: string;
// }

// interface TagsApiResponse {
//   data?: TagItem[] | { data?: TagItem[] };
// }

// export default function SidebarTagSection({
//   isEditMode,
// }: {
//   isEditMode: boolean;
// }) {
//   const { setValue, watch } = useFormContext();
//   const activeTags: string[] = watch("tag_ids") || [];

//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const { data: tagsResponse } = useQuery<TagItem[] | TagsApiResponse>({
//     queryKey: ["tags-list-upload-select"],
//     queryFn: async () => {
//       const res = await apiFetch("/tags");
//       return res.json();
//     },
//   });

//   const tagsList: TagItem[] = (() => {
//     if (!tagsResponse) return [];
//     if (Array.isArray(tagsResponse)) return tagsResponse;
//     if (Array.isArray(tagsResponse.data)) return tagsResponse.data;
//     if (
//       tagsResponse.data &&
//       "data" in tagsResponse.data &&
//       Array.isArray(tagsResponse.data.data)
//     ) {
//       return tagsResponse.data.data;
//     }
//     return [];
//   })();

//   const handleToggleTagSelection = (tagId: string | number) => {
//     const idStr = String(tagId);
//     const updatedTags = activeTags.includes(idStr)
//       ? activeTags.filter((id: string) => id !== idStr)
//       : [...activeTags, idStr];
//     setValue("tag_ids", updatedTags, {
//       shouldDirty: true,
//       shouldValidate: true,
//     });
//   };

//   // close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(e.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const selectedNames = tagsList
//     .filter((tag) => activeTags.includes(String(tag.id)))
//     .map((tag) => tag.name);

//   const triggerLabel =
//     selectedNames.length === 0
//       ? "Select Associated Tags"
//       : selectedNames.length === 1
//         ? selectedNames[0]
//         : `${selectedNames.length} tags selected`;

//   return (
//     <div className="bg-white rounded-[8px] p-5">
//       <h3 className="text-[#003032] font-medium text-base mb-4">
//         Tags Assignment
//       </h3>
//       <Label>Select Associated Tags</Label>

//       <div className="relative mt-1.5" ref={containerRef}>
//         {/* Dropdown trigger - your requested style */}
//         <button
//           type="button"
//           onClick={() => setIsOpen((prev) => !prev)}
//           className="w-full text-left bg-[#F9F9F9] text-gray-800 px-3 py-4 text-sm rounded-[8px] outline-none appearance-none cursor-pointer focus:bg-white pr-10 relative"
//         >
//           <span
//             className={
//               selectedNames.length === 0 ? "text-gray-500" : "text-gray-800"
//             }
//           >
//             {triggerLabel}
//           </span>

//           {/* Your icon */}
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="32"
//             height="32"
//             viewBox="0 0 32 32"
//             fill="none"
//             className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform`}
//           >
//             <path
//               d="M14.6134 15.614L18.0667 19.0673C18.1901 19.1909 18.3366 19.289 18.4979 19.3559C18.6592 19.4228 18.8321 19.4572 19.0067 19.4572C19.1813 19.4572 19.3542 19.4228 19.5155 19.3559C19.6768 19.289 19.8234 19.1909 19.9467 19.0673L23.4 15.614C24.2267 14.774 23.64 13.334 22.4534 13.334H15.56C14.36 13.334 13.7734 14.774 14.6134 15.614Z"
//               fill="#969696"
//             />
//           </svg>
//         </button>

//         {/* Dropdown panel */}
//         {/* {isOpen && (
//           <div className="absolute z-10 mt-2 w-full bg-white rounded-[8px] shadow-lg border border-gray-100 max-h-[200px] overflow-y-auto p-2.5 space-y-1.5">
//             {tagsList.map((tag) => {
//               const isSelected = activeTags.includes(String(tag.id));
//               return (
//                 <div
//                   key={tag.id}
//                   onClick={() => handleToggleTagSelection(tag.id)}
//                   className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-all border ${
//                     isSelected
//                       ? "bg-sky-100 text-sky-700 border-sky-300 font-semibold"
//                       : "hover:bg-gray-100 text-gray-600 border-transparent"
//                   }`}
//                 >
//                   <span>{tag.name}</span>
//                   {isSelected && (
//                     <span className="font-bold text-sky-600">✓</span>
//                   )}
//                 </div>
//               );
//             })}
//             {tagsList.length === 0 && (
//               <span className="text-[11px] text-gray-400 px-2 py-1 block">
//                 No tags found.
//               </span>
//             )}
//           </div>
//         )} */}

//         {isOpen && (
//           <div className="absolute z-20 mt-2 w-full bg-white rounded-[8px] shadow-lg border border-gray-100 max-h-[220px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
//             {tagsList.map((tag) => {
//               const isSelected = activeTags.includes(String(tag.id));
//               return (
//                 <div
//                   key={tag.id}
//                   onClick={() => handleToggleTagSelection(tag.id)}
//                   className="flex items-center gap-3 text-sm px-3 py-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
//                 >
//                   <span
//                     className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ${
//                       isSelected
//                         ? "bg-[#085E00] border-[#085E00]"
//                         : "bg-white border-gray-300"
//                     }`}
//                   >
//                     {isSelected && (
//                       <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
//                         <path
//                           d="M1 4L3.5 6.5L9 1"
//                           stroke="white"
//                           strokeWidth="1.6"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                     )}
//                   </span>
//                   <span
//                     className={
//                       isSelected ? "text-gray-900 font-medium" : "text-gray-600"
//                     }
//                   >
//                     {tag.name}
//                   </span>
//                 </div>
//               );
//             })}
//             {tagsList.length === 0 && (
//               <span className="text-[11px] text-gray-400 px-3 py-2 block">
//                 No tags found.
//               </span>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiFetch } from "@/utils/api";
import { Label } from "./Label";

interface TagItem {
  id: string | number;
  name: string;
}

interface TagsApiResponse {
  data?: TagItem[] | { data?: TagItem[] };
}

export default function SidebarTagSection({
  isEditMode,
}: {
  isEditMode: boolean;
}) {
  const { setValue, watch } = useFormContext();
  const activeTags: string[] = watch("tag_ids") || [];

  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { data: tagsResponse } = useQuery<TagItem[] | TagsApiResponse>({
    queryKey: ["tags-list-upload-select"],
    queryFn: async () => {
      const res = await apiFetch("/tags");
      return res.json();
    },
  });

  const tagsList: TagItem[] = (() => {
    if (!tagsResponse) return [];
    if (Array.isArray(tagsResponse)) return tagsResponse;
    if (Array.isArray(tagsResponse.data)) return tagsResponse.data;
    if (
      tagsResponse.data &&
      "data" in tagsResponse.data &&
      Array.isArray(tagsResponse.data.data)
    ) {
      return tagsResponse.data.data;
    }
    return [];
  })();

  const handleToggleTagSelection = (tagId: string | number) => {
    const idStr = String(tagId);
    const updatedTags = activeTags.includes(idStr)
      ? activeTags.filter((id: string) => id !== idStr)
      : [...activeTags, idStr];
    setValue("tag_ids", updatedTags, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // decide whether dropdown should open upward or downward
  const handleTriggerClick = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedDropdownHeight = 250; // approx max height of panel
      setOpenUpward(spaceBelow < estimatedDropdownHeight);
    }
    setIsOpen((prev) => !prev);
  };

  const selectedNames = tagsList
    .filter((tag) => activeTags.includes(String(tag.id)))
    .map((tag) => tag.name);

  const triggerLabel =
    selectedNames.length === 0
      ? "Select Associated Tags"
      : selectedNames.length === 1
        ? selectedNames[0]
        : `${selectedNames.length} tags selected`;

  return (
    <div className="bg-white rounded-[8px] p-5">
      <h3 className="text-[#003032] font-medium text-base mb-4">
        Tags Assignment
      </h3>
      <Label>Select Associated Tags</Label>

      <div className="relative mt-1.5" ref={containerRef}>
        {/* Dropdown trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleTriggerClick}
          className="w-full text-left bg-[#F9F9F9] text-gray-800 px-3 py-4 text-sm rounded-[8px] outline-none appearance-none cursor-pointer focus:bg-white pr-10 relative"
        >
          <span
            className={
              selectedNames.length === 0 ? "text-gray-500" : "text-gray-800"
            }
          >
            {triggerLabel}
          </span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform"
          >
            <path
              d="M14.6134 15.614L18.0667 19.0673C18.1901 19.1909 18.3366 19.289 18.4979 19.3559C18.6592 19.4228 18.8321 19.4572 19.0067 19.4572C19.1813 19.4572 19.3542 19.4228 19.5155 19.3559C19.6768 19.289 19.8234 19.1909 19.9467 19.0673L23.4 15.614C24.2267 14.774 23.64 13.334 22.4534 13.334H15.56C14.36 13.334 13.7734 14.774 14.6134 15.614Z"
              fill="#969696"
            />
          </svg>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            className={`absolute z-30 w-full bg-white rounded-[8px] shadow-lg border border-gray-100 max-h-[min(250px,40vh)] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
              openUpward ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {tagsList.map((tag) => {
              const isSelected = activeTags.includes(String(tag.id));
              return (
                <div
                  key={tag.id}
                  onClick={() => handleToggleTagSelection(tag.id)}
                  className="flex items-center gap-3 text-sm px-3 py-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#085E00] border-[#085E00]"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={
                      isSelected ? "text-gray-900 font-medium" : "text-gray-600"
                    }
                  >
                    {tag.name}
                  </span>
                </div>
              );
            })}
            {tagsList.length === 0 && (
              <span className="text-[11px] text-gray-400 px-3 py-2 block">
                No tags found.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
