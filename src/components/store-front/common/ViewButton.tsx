"use client";

import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";

interface MainButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

const ViewButton: React.FC<MainButtonProps> = ({
  label,
  onClick,
  className = "",
}) => {
  const { language } = useLanguage();
const t = translations[language];
  return (
    <button
      onClick={onClick}
      className={`group relative cursor-pointer flex items-center gap-2 text-black transition-all duration-300 ease-in-out ${className}`}
    >
      <div className="relative pb-0.5">
        <span className="text-lg font-medium">{label ?? t.common.viewMore}</span>
        <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-black transition-all duration-300 ease-in-out group-hover:w-full" />
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="12"
        viewBox="0 0 21 12"
        fill="none"
      >
        <path
          d="M0.800781 5.09751C0.358441 5.09751 -0.000147462 5.4561 -0.000147462 5.89844C-0.000147462 6.34078 0.358441 6.69937 0.800781 6.69937V5.89844V5.09751ZM20.5894 6.46478C20.9022 6.152 20.9022 5.64488 20.5894 5.3321L15.4923 0.235016C15.1796 -0.0777659 14.6724 -0.0777659 14.3596 0.235016C14.0469 0.547798 14.0469 1.05492 14.3596 1.3677L18.8904 5.89844L14.3596 10.4292C14.0469 10.742 14.0469 11.2491 14.3596 11.5619C14.6724 11.8746 15.1796 11.8746 15.4923 11.5619L20.5894 6.46478ZM0.800781 5.89844V6.69937H20.0231V5.89844V5.09751H0.800781V5.89844Z"
          fill="#606060"
        />
      </svg>
    </button>
  );
};

export default ViewButton;
