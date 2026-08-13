import { useFormContext } from "react-hook-form";

export default function AddToggle ({ name }: { name: string }) {
  const { watch, setValue } = useFormContext();
  const checked = watch(name);
  return (
    <div
      className="flex items-center gap-2 select-none cursor-pointer"
      onClick={() => setValue(name, !checked)}
    >
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${checked ? "bg-[#1DA1F2]" : "bg-gray-200"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${checked ? "left-5" : "left-0.5"}`}
        />
      </div>
    </div>
  );
};