export default function NotificationItem({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <span className="text-xs text-black font-normal">{text}</span>
            </div>
            {/* <button className="text-[10px] text-[#38BDF8] font-medium bg-[#E9F8FF] px-2.5 py-1 rounded-full">
                View
            </button> */}
        </div>
    )
}