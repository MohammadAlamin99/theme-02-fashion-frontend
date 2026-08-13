import React from "react";
import { IoClose, IoCall } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

interface OrderCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  invoiceNo?: string;
}

const OrderCompletedModal: React.FC<OrderCompletedModalProps> = ({
  isOpen,
  onClose,
  customerName,
  invoiceNo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[600px] rounded-[16px] p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#727272] hover:text-black cursor-pointer p-1"
        >
          <IoClose size={32} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#E8F9EE] rounded-full flex items-center justify-center mb-6 md:mb-8">
            <FaCheck className="text-[#00C542] text-3xl md:text-4xl" />
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-[32px] font-semibold text-black mb-2 font-poppins">
            Order Completed
          </h2>

          {invoiceNo && (
            <p className="text-[#727272] text-sm font-poppins mb-2">
              Invoice #{invoiceNo}
            </p>
          )}

          {/* Subtext */}
          <p className="text-[#727272] text-base font-normal font-poppins mb-8 max-w-[312px]">
            {customerName
              ? `Thanks, ${customerName}. `
              : "Thanks for ordering. "}
            We&apos;ve received your order from{" "}
            <span className="font-semibold text-[#727272]">Creass Mart</span>.
          </p>

          {/* Contact Section */}
          <div className="bg-[#FFECDF] w-full rounded-[24px] py-4 mb-6">
            <h3 className="text-[#FF5C24] text-base font-medium mb-4 font-poppins">
              Contact us for help.
            </h3>
            <button className="bg-[#FF7050] text-white mx-auto px-[42px] py-4 rounded-[39px] flex items-center justify-center gap-3 text-base font-medium font-poppins">
              <IoCall size={24} className="md:size-7" />
              01904-300117
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-[#727272] text-sm font-poppins">
            Please inspect the product upon receipt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderCompletedModal;
