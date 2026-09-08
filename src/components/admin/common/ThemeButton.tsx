import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ViewMoreProps {
  href?: string;
  text?: string;
  className?: string;
  onClick?: () => void;
}

export default function ThemeButton({
  href = "#",
  text = "View More",
  className = "",
  onClick,
}: ViewMoreProps) {
  const commonClasses = `cursor-pointer italic font-inter font-semibold text-lg md:text-[22px] text-[#3F3F3F] flex items-center gap-1.5 hover:gap-3 transition-all duration-300 group ${className}`;

  return (
    <div className="flex justify-center mt-6">
      {onClick ? (
        <button onClick={onClick} className={commonClasses}>
          {text}
          <ChevronRight
            size={24}
            className="text-black group-hover:translate-x-1 transition-transform duration-300"
            strokeWidth={2.5}
          />
        </button>
      ) : (
        <Link href={href} className={commonClasses}>
          {text}
          <ChevronRight
            size={24}
            className="text-black group-hover:translate-x-1 transition-transform duration-300"
            strokeWidth={2.5}
          />
        </Link>
      )}
    </div>
  );
}
