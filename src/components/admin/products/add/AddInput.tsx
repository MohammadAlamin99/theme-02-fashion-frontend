import { RegisterOptions, useFormContext } from "react-hook-form";

export default function Input({
  placeholder,
  icon: Icon,
  type = "text",
  name,
  options = {},
}: {
  placeholder?: string;
  icon?: React.ElementType;
  type?: string;
  name: string;
  options?: RegisterOptions;
}) {
  const { register } = useFormContext();
  return (
    <div className="relative w-full">
      <input
        type={type}
        placeholder={placeholder}
        {...register(name, options)}
        className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2] text-gray-800 border border-transparent focus:border-gray-200 focus:bg-white transition-all"
      />
      {Icon && (
        <Icon
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}
    </div>
  );
}
