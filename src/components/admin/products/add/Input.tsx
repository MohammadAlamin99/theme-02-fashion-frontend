// import React from "react";

// export const Input = ({
//   placeholder,
//   icon: Icon,
//   type = "text",
// }: {
//   placeholder?: string;
//   icon?: React.ElementType;
//   type?: string;
// }) => (
//   <div className="relative w-full">
//     <input
//       type={type}
//       placeholder={placeholder}
//       className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2] text-gray-700"
//     />
//     {Icon && (
//       <Icon
//         size={18}
//         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
//       />
//     )}
//   </div>
// );


import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  icon?: React.ElementType;
  type?: string;
}

// forwardRef ব্যবহার করা হয়েছে যাতে react-hook-form ইনপুটটিকে কন্ট্রোল করতে পারে
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, icon: Icon, type = "text", ...props }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref} // এটি অত্যন্ত গুরুত্বপূর্ণ
        type={type}
        placeholder={placeholder}
        {...props} // এখানে name, onChange, onBlur সব ডাটা চলে আসবে
        className="w-full bg-[#F9F9F9] rounded-lg px-4 py-3 text-sm outline-none placeholder:text-[#A2A2A2] text-gray-700 border border-transparent focus:border-gray-200"
      />
      {Icon && (
        <Icon
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}
    </div>
  )
);

Input.displayName = "Input";