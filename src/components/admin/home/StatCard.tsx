export default function StatCard({ label, value, icon }
    : { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 rounded-xl bg-[#F9F9F9] flex items-center justify-between">
            <div>
                <p className="text-2xl font-medium text-black mb-1 leading-none">{value}</p>
                <p className="text-sm font-medium text-black">{label}</p>
            </div>
            <div className="bg-white rounded-[8px] p-[6px]">
                {icon}
            </div>
        </div>
    )
}