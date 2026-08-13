import React, { useState, useEffect } from "react";
import {
  IoClose,
  IoPersonOutline,
  IoCallOutline,
  IoLocationOutline,
} from "react-icons/io5";

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerInfo;
  onSave: (updated: CustomerInfo) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
}) => {
  const [form, setForm] = useState<CustomerInfo>(customer);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInfo, string>>
  >({});

  // Sync form state whenever modal opens or customer prop changes
  useEffect(() => {
    if (isOpen) {
      setForm(customer);
      setErrors({});
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleChange =
    (field: keyof CustomerInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = () => {
    const next: Partial<Record<keyof CustomerInfo, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!/^0\d{9,10}$/.test(form.phone.trim()))
      next.phone = "Please enter a valid phone number (e.g. 01904300117)";
    if (!form.address.trim()) next.address = "Please enter delivery address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-poppins">
      <div className="bg-white w-full max-w-[520px] rounded-[16px] p-6 md:p-10 relative animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#727272] hover:text-black cursor-pointer p-1"
        >
          <IoClose size={28} />
        </button>

        {/* Header */}
        <h2 className="text-xl md:text-2xl font-semibold text-black mb-1">
          Edit Order Info
        </h2>
        <p className="text-[#727272] text-sm mb-6">
          Delivery-র আগে চাইলে আপনার তথ্য আপডেট করে নিন।
        </p>

        {/* Current / Submitted Info Summary */}
        <div className="bg-[#FFF4EF] border border-[#FFDCCB] rounded-[12px] p-3.5 mb-6 text-xs text-[#555]">
          <p className="font-semibold text-[#FF5C24] mb-1">
            অর্ডারে প্রদত্ত পূর্বের তথ্য (Current Info):
          </p>
          <p><span className="font-medium text-black">Name:</span> {customer.name || "N/A"}</p>
          <p><span className="font-medium text-black">Phone:</span> {customer.phone || "N/A"}</p>
          <p><span className="font-medium text-black">Address:</span> {customer.address || "N/A"}</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <IoPersonOutline size={16} className="text-[#FF5C24]" />
                Full Name
              </label>
              {customer.name && (
                <span className="text-[11px] text-[#727272]">
                  Previous: <strong className="text-black font-normal">{customer.name}</strong>
                </span>
              )}
            </div>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g. Rahim Uddin"
              className={`w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-colors focus:border-[#FF7050] ${
                errors.name ? "border-red-400" : "border-[#E5E5E5]"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <IoCallOutline size={16} className="text-[#FF5C24]" />
                Phone Number
              </label>
              {customer.phone && (
                <span className="text-[11px] text-[#727272]">
                  Previous: <strong className="text-black font-normal">{customer.phone}</strong>
                </span>
              )}
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="e.g. 01904300117"
              className={`w-full rounded-[12px] border px-4 py-3 text-sm outline-none transition-colors focus:border-[#FF7050] ${
                errors.phone ? "border-red-400" : "border-[#E5E5E5]"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <IoLocationOutline size={16} className="text-[#FF5C24]" />
                Delivery Address
              </label>
              {customer.address && (
                <span className="text-[11px] text-[#727272] truncate max-w-[200px]">
                  Previous: <strong className="text-black font-normal">{customer.address}</strong>
                </span>
              )}
            </div>
            <textarea
              value={form.address}
              onChange={handleChange("address")}
              placeholder="House, Road, Area, City"
              rows={3}
              className={`w-full rounded-[12px] border px-4 py-3 text-sm outline-none resize-none transition-colors focus:border-[#FF7050] ${
                errors.address ? "border-red-400" : "border-[#E5E5E5]"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#E5E5E5] text-[#727272] py-3.5 rounded-[39px] text-sm font-medium hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[#FF7050] text-white py-3.5 rounded-[39px] text-sm font-medium hover:bg-[#FF5C24] transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
