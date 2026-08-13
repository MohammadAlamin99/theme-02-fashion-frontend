export const Toggle = ({
  label,
  checked = false,
  onChange,
  sideLabel,
}: {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  sideLabel?: string;
}) => (
  <div
    className="flex items-center gap-2 cursor-pointer select-none"
    onClick={(e) => {
      e.stopPropagation();
      onChange?.(!checked);
    }}
  >
    {sideLabel && (
      <span className="text-[11px] font-bold text-gray-500">{sideLabel}</span>
    )}
    <div
      className={`w-10 h-5 rounded-full relative transition-colors ${checked ? "bg-[#1DA1F2]" : "bg-gray-200"}`}
    >
      <div
        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${checked ? "right-1" : "left-1"}`}
      />
    </div>
    {label && (
      <span className="text-[11px] font-bold text-gray-500">{label}</span>
    )}
  </div>
);
