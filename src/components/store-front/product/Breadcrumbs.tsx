import React from "react";
import Link from "next/link";
import { MdChevronRight } from "react-icons/md";

interface BreadcrumbPath {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  paths: BreadcrumbPath[];
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
          <Link
            href={path.href}
            className="text-[#727272] text-base font-medium whitespace-nowrap hover:text-black hover:underline transition-colors"
          >
            {path.label}
          </Link>
          <MdChevronRight className="text-[#727272] text-base flex-shrink-0" />
        </React.Fragment>
      ))}
      <span className="text-[#000000] text-base font-medium break-words min-w-0">
        {activePath}
      </span>
    </nav>
  );
};
