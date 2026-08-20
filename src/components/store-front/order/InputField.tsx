import React from "react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  required?: boolean;
  type?: string;
  error?: boolean;
  isTextArea?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  name,
  value,
  onChange,
  required,
  type = "text",
  error,
  isTextArea = false,
}) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-[#727272] font-semibold text-lg font-poppins">
      {label} {required && <span className="text-[#7CB640]">*</span>}
    </label>
    {isTextArea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-[#F9F9F9] px-6 py-5 rounded-[12px] outline-none text-sm border transition-all min-h-[100px] font-poppins ${
          error ? "border-[#7CB640]" : "border-transparent"
        } focus:border-[#7CB640]`}
      />
    ) : (
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`bg-[#F9F9F9] px-6 py-5 rounded-[12px] outline-none text-base text-normal border transition-all font-poppins ${
          error ? "border-[#7CB640]" : "border-transparent"
        } focus:border-[#7CB640]`}
      />
    )}
  </div>
);

export default InputField;
