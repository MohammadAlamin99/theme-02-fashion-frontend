
interface StatCardProps {
    title: string;
    val: string;
    sub: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconBgColor?: string;
    textColor: string;
    bgColor: string;
}
export const StatCard = ({ title, val, sub, icon: Icon, textColor, bgColor, iconBgColor = "bg-white" }: StatCardProps) => {
    return (
        <div className={`${bgColor} rounded-[8px] p-4 flex justify-between items-end`}>
            <div>
                <p className="text-base font-medium font-poppins text-[#000000] mb-1">{title}</p>
                <h2 className="text-[24px] font-medium font-poppins text-[#000000] mb-0.5">{val}</h2>
                <p className="text-[12px] font-medium font-poppins text-[#979797]">{sub}</p>
            </div>
            <div className={`${iconBgColor} p-2.5 rounded-[8px] flex items-center justify-center`}>
                <Icon size={22} className={textColor} />
            </div>
        </div>
    );
};