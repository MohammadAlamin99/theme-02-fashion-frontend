interface TabItemProps {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}

export default function TabItem({
  label,
  icon: Icon,
  isActive,
  onClick,
}: TabItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer font-poppins flex items-center justify-center gap-1.5 md:gap-2 px-3 sm:px-4 md:px-5 pb-2 transition-all duration-300 relative antialiased flex-1 sm:flex-initial min-w-max ${
        isActive
          ? "text-transparent bg-gradient-to-r from-[#38BDF8] to-[#1E90FF] bg-clip-text font-semibold"
          : "text-black font-medium"
      }`}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        className={`transition-colors duration-300 md:w-6 md:h-6 ${isActive ? "text-[#38BDF8]" : "text-black"}`}
      />
      <span className="text-sm md:text-base whitespace-nowrap font-poppins">
        {label}
      </span>

      <div
        className={`absolute bottom-0 left-0 w-full h-[2px] transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-[#38BDF8] to-[#1E90FF]"
            : "bg-transparent"
        }`}
      />
    </button>
  );
}
