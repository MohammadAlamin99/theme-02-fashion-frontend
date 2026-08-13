

import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineXCircle,
} from "react-icons/hi";

export default function StatusBadge({ status }: { status: string }) {
  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const styles: Record<
    string,
    { color: string; icon: React.ReactNode; bg: string }
  > = {
    Pending: {
      color: "text-[#5E35B1]",
      bg: "bg-[#F3E5F5]",
      icon: <HiOutlineClipboardList size={16} />,
    },
    Delivered: {
      color: "text-[#32CD32]",
      bg: "bg-[#E8F9EE]",
      icon: <HiOutlineCheckCircle size={16} />,
    },
    Canceled: {
      color: "text-[#D32F2F]",
      bg: "bg-[#FFEBEE]",
      icon: <HiOutlineXCircle size={16} />,
    },
  };

  const current = styles[normalizedStatus] || styles.Pending;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit font-semibold text-[12px] ${current.bg} ${current.color}`}
    >
      {current.icon}
      <span className="uppercase tracking-wide">{normalizedStatus}</span>
    </div>
  );
}
