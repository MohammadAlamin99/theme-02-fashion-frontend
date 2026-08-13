interface ToggleSwitchProps {
  active: boolean;
  onClick?: () => void; // Adding the '?' makes it optional
}

export const ToggleSwitch = ({ active, onClick }: ToggleSwitchProps) => (
  <div
    onClick={onClick} // This will only trigger if onClick is provided
    className={`w-11 h-5 rounded-full relative transition-all cursor-pointer ${
      active ? "bg-[#1DA1F2]" : "bg-[#D9D9D9]"
    }`}
  >
    <div
      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
        active ? "right-1" : "left-1"
      }`}
    />
  </div>
);