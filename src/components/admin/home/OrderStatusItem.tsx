export default function OrderStatusItem({ icon, label, value, iconBg }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconBg: string;
}) {
    return (
        <div className="flex items-center justify-between bg-white p-3 rounded-[8px] min-w-[150px] flex-1">
            <div className="flex items-center gap-2">
                <div className={`p-2 rounded-[8px] ${iconBg}`}>
                    {icon}
                </div>
                <span className="text-[13px] font-medium text-gray-600">{label}</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{value}</span>
        </div>
    )
}