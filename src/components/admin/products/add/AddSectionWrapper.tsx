import { ChevronUp } from "lucide-react";
import { useState } from "react";

export default function AddSectionWrapper({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="bg-white rounded-lg px-4 py-5 mb-4 transition-all border border-gray-100">
      <div
        className="flex justify-between items-center mb-4 cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-[#003032] font-medium text-xl">{title}</h3>
        <ChevronUp
          size={24}
          color="black"
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
        />
      </div>
      {description && !isCollapsed && (
        <p className="text-sm text-[#A2A2A2] -mt-3 mb-5 leading-tight">
          {description}
        </p>
      )}
      <div className={isCollapsed ? "hidden" : "block"}>{children}</div>
    </div>
  );
}
