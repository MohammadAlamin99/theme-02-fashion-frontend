
export default function TableTabs({ tabs, activeTab, setActiveTab }:
    { tabs: string[], activeTab: number, setActiveTab: (idx: number) => void }) {
    return (
        <div className="flex bg-[#E7F4FF] rounded-[8px] p-1 w-fit overflow-x-auto scrollbar-none gap-0.5">
            {tabs.map((tab, idx) => {
                const [label, count] = tab.split(' (');
                const countStr = count ? count.replace(')', '') : '';
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(idx)}
                        className={`cursor-pointer flex items-center gap-1 px-3 sm:px-3 py-2.5 text-[14px] sm:text-[15px] whitespace-nowrap rounded-[8px] transition-all shrink-0 ${idx === activeTab
                            ? 'bg-white text-black font-medium'
                            : 'text-[#4B5563] font-medium'
                            }`}
                    >
                        <span>{label}</span>
                        {countStr && (
                            <span className={`text-[11px] font-semibold ${idx === activeTab ? 'text-[#1DA1F2]' : 'text-[#1DA1F2]/70'
                                }`}>
                                ({countStr})
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    )
}
