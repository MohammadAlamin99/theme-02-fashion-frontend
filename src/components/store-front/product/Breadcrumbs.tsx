import React from "react";
import { MdChevronRight } from "react-icons/md";

interface BreadcrumbProps {
  paths: string[];
  activePath: string;
}

export const Breadcrumbs: React.FC<BreadcrumbProps> = ({
  paths,
  activePath,
}) => {
  return (
    <nav className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap font-poppins pt-6">
      {paths.map((path, index) => (
        <React.Fragment key={index}>
          <span className="text-[#727272] text-base font-medium whitespace-nowrap">
            {path}
          </span>
          {/* Shrink the icon slightly on mobile to match the text */}
          <MdChevronRight className="text-[#727272] text-base flex-shrink-0" />
        </React.Fragment>
      ))}
      <span className="text-[#FF7050] text-base font-medium break-words min-w-0">
        {activePath}
      </span>
    </nav>
  );
};
