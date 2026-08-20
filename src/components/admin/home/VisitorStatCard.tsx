interface VisitorStatProps {
    icon: React.ReactNode;
    label: string;
    subtext: string;
    value: string | number;
    colorClass: string;
    bgClass: string;
}
export default function VisitorStatCard({ icon, label, subtext, value, colorClass, bgClass }: VisitorStatProps) {
    return (
        <div className="flex items-center justify-between bg-white h-full rounded-[8px] p-[0_0_0_20px] overflow-hidden">
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <h3 className={`text-[14px] md:text-base font-medium ${colorClass}`}>{label}</h3>
                    <p className="text-xs text-black">{subtext}</p>
                </div>
            </div>
            <div className={`flex items-center justify-center w-[150px] h-[87px] rounded-[0px_8px_8px_20px] text-2xl font-medium text-black ${bgClass}`}>
                {value}
            </div>
        </div>
    );
}
