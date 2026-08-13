export const Label = ({ children, required, subLabel }: { children: React.ReactNode, required?: boolean, subLabel?: string }) => (
    <div className="flex justify-between items-center mb-1.5">
        <label className="text-base font-normal text-black">
            {children} {required && <span className="text-[#E30000]">*</span>}
        </label>
        {subLabel && <span className="text-[10px] text-gray-400 font-medium">{subLabel}</span>}
    </div>
);
