import { Label } from "./Label";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { useFormContext } from "react-hook-form";



export default function SidebarSupplierSection({ isEditMode }: { isEditMode: boolean }) {
  const { setValue, watch } = useFormContext();
  const activeSuppliers = watch("supplier_ids") || [];

  const { data: supplierResponse } = useQuery({
    queryKey: ["suppliers-list-upload-select"],
    queryFn: async () => {
      const res = await apiFetch("/suppliers");
      return res.json();
    },
  });

  const supplierList = (() => {
    if (Array.isArray(supplierResponse)) return supplierResponse;
    if (supplierResponse && Array.isArray(supplierResponse.data))
      return supplierResponse.data;
    if (supplierResponse && Array.isArray(supplierResponse.data?.data))
      return supplierResponse.data.data;
    return [];
  })();

  const handleToggleSupplier = (supplierId: string) => {
    const updated = activeSuppliers.includes(supplierId)
      ? activeSuppliers.filter((id: string) => id !== supplierId)
      : [...activeSuppliers, supplierId];
    setValue("supplier_ids", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="bg-white rounded-[8px] p-5 border border-gray-100 shadow-xs">
      <h3 className="text-[#003032] font-medium text-base mb-4">
        Suppliers Assignment
      </h3>
      <Label>Select Linked Suppliers</Label>
      <div className="max-h-[140px] overflow-y-auto border border-gray-100 p-2.5 rounded-[6px] space-y-1.5 bg-[#F9FAFB]">
        {supplierList.map((supplier: any) => {
          const isSelected = activeSuppliers.includes(supplier.id);
          return (
            <div
              key={supplier.id}
              onClick={() => handleToggleSupplier(supplier.id)}
              className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
                isSelected
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span>{supplier.name}</span>
              {isSelected && <span className="font-bold text-sky-600">✓</span>}
            </div>
          );
        })}
        {supplierList.length === 0 && (
          <span className="text-[11px] text-gray-400">No suppliers found.</span>
        )}
      </div>
    </div>
  );
}