import { FaCheck } from "react-icons/fa";

const statusStyles: Record<string, string> = {
  completed: "bg-[#E8F9EE] text-[#00C542]",
  processing: "bg-[#FFF4E5] text-[#FF9900]",
  pending: "bg-[#F0F0F0] text-[#727272]",
};

export const InvoiceHeader = ({
  invoiceNo,
  orderNo,
  status,
  date,
}: {
  invoiceNo: string;
  orderNo: string;
  status: string;
  date: string;
}) => (
  <div className="flex items-start justify-between mb-8 pb-6 border-b border-[#F0F0F0]">
    <div>
      <h2 className="text-lg md:text-2xl font-semibold text-black mb-1">
        Invoice
      </h2>
      <p className="text-[#727272] text-sm">
        Invoice ID: {invoiceNo.startsWith("#") ? invoiceNo : `#${invoiceNo}`}
      </p>
      <p className="text-[#727272] text-sm">
        Order ID: {orderNo.startsWith("#") ? orderNo : `#${orderNo}`}
      </p>
    </div>
    <div className="text-right">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles[status as string] || statusStyles.completed}`}
      >
        {status === "completed" && <FaCheck size={10} />}
        {status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Completed"}
      </span>
      <p className="text-[#727272] text-sm mt-2">{date}</p>
    </div>
  </div>
);

// components/CustomerSection.tsx
import {
  IoCallOutline,
  IoLocationOutline,
  IoPencilOutline,
} from "react-icons/io5";

export const CustomerSection = ({
  customer,
  onEdit,
}: {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  onEdit: () => void;
}) => (
  <div className="bg-[#FAFAFA] rounded-[14px] p-5 mb-8 flex items-start justify-between gap-4">
    <div className="space-y-2">
      <p className="text-black font-semibold text-base">
        {customer.name || <span className="text-gray-400 italic">No name</span>}
      </p>
      <p className="text-[#727272] text-sm flex items-center gap-2">
        <IoCallOutline size={16} className="text-[#FF5C24] shrink-0" />{" "}
        {customer.phone || "No phone"}
      </p>
      <p className="text-[#727272] text-sm flex items-start gap-2">
        <IoLocationOutline
          size={16}
          className="text-[#FF5C24] shrink-0 mt-0.5"
        />{" "}
        {customer.address || "No address"}
      </p>
    </div>
    <button
      data-html2canvas-ignore
      onClick={onEdit}
      className="shrink-0 flex items-center gap-1.5 text-[#FF5C24] text-sm font-medium border border-[#FFDCCB] rounded-full px-4 py-2 hover:bg-[#FFECDF] transition-colors cursor-pointer"
    >
      <IoPencilOutline size={15} /> Edit
    </button>
  </div>
);
