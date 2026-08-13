"use client";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import { FiEdit3 } from "react-icons/fi";

// Services
import {
  getOrderByIdService,
  editOrderInvoiceService,
} from "@/services-api/orderService";

// Components
import OrderCompletedModal from "@/components/store-front/thank_you/Ordercompletedmodal";
import EditOrderModal, {
  CustomerInfo,
} from "@/components/store-front/thank_you/Editordermodal";
import { OrderItem } from "@/@types/order.type";
import { invoiceItem } from "@/@types/invoice.type";
import { getSettings } from "@/services-api/globalSettingsService";

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<CustomerInfo | null>(
    null,
  );

  const { data: setting } = useQuery({
    queryKey: ["setting"],
    queryFn: () => getSettings(),
  });
  const settingsdata = setting?.data;

  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["order-details", orderId],
    queryFn: () => getOrderByIdService(orderId as string),
    enabled: !!orderId,
  });

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const invoiceLogo = settingsdata?.primary_logo
    ? settingsdata.primary_logo.startsWith("http")
      ? settingsdata.primary_logo
      : `${backendBaseUrl}${settingsdata.primary_logo.startsWith("/") ? "" : "/"}${settingsdata.primary_logo}`
    : "/images/admin/logo.png";

  // edit invoice mutation
  const editInvoiceMutation = useMutation({
    mutationFn: (updated: CustomerInfo) =>
      editOrderInvoiceService(orderId!, {
        customerName: updated.name,
        customerPhone: updated.phone,
        customerAddress: updated.address,
      }),
    onSuccess: (_, variables) => {
      setEditedCustomer(variables);
      toast.success("Updated!");
      refetch();
      setIsEditOpen(false);
    },
  });

  if (isLoading)
    return (
      <div className="p-20 text-center font-medium">Fetching Invoice...</div>
    );
  if (!apiResponse)
    return <div className="p-20 text-center">Order not found.</div>;

  // calculation and data preparation
  const currentCustomer = editedCustomer || {
    name: apiResponse.customer_name,
    phone: apiResponse.customer_phone,
    address: apiResponse.customer_address,
  };

  const subtotal =
    apiResponse.order_items?.reduce(
      (acc: number, item: OrderItem) =>
        acc + Number(item.unit_price) * item.quantity,
      0,
    ) || 0;
  const shippingFee = Number(
    apiResponse.shipping_fee ??
      apiResponse.delivery_fee ??
      apiResponse.delivery_charge ??
      apiResponse.shippingFee ??
      0,
  );
  const discountAmount = Number(apiResponse.discount_amount || 0);

  const formattedDate = apiResponse.created_at
    ? new Date(apiResponse.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-10 px-4 flex flex-col items-center">
      <div
        ref={invoiceRef}
        className="w-full max-w-[1020px] bg-white rounded-lg p-8 md:p-12 font-poppins text-[#2D2D2D]"
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={invoiceLogo}
                alt="logo"
                width={160}
                height={60}
                className="object-contain rounded-md"
                unoptimized
              />
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              <p>www.creassmart.com</p>
              <p>{settingsdata?.contact_email}</p>
              <p>+88 01904300117</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Info Meta */}
        <div className="flex justify-between mb-10 text-[13px] flex-wrap gap-5">
          <div>
            <p className="text-gray-400 font-medium mb-1">Billed to</p>
            <p className="font-medium text-lg">{currentCustomer.name}</p>
            <p className="font-medium text-gray-600">{currentCustomer.phone}</p>
            <p className="text-gray-500 w-56">{currentCustomer.address}</p>
          </div>
          <div className="text-right space-y-4">
            <div>
              <p className="text-gray-400 font-medium">Invoice number</p>
              <p className="font-medium text-gray-800">
                #{apiResponse.invoice_number}
              </p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-gray-400 font-medium">Date</p>
                <p className="font-medium text-gray-800">{formattedDate}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Order number</p>
                <p className="font-medium text-gray-800">
                  #{apiResponse.order_number}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-gray-400 uppercase font-medium border-b border-gray-100">
                <th className="pb-3">NO.</th>
                <th className="pb-3 px-4">ITEM DETAIL</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">QTY</th>
                <th className="pb-3">UNIT</th>
                <th className="pb-3 text-right">RATE</th>
                <th className="pb-3 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {apiResponse.order_items?.map(
                (item: invoiceItem, idx: number) => {
                  const variantImg = item.variant?.images?.[0];
                  const productImg = item.product?.images?.[0];
                  const externalImg = item.external_image;
                  const rawImg = variantImg || productImg || externalImg;
                  const finalImg = rawImg
                    ? rawImg.startsWith("http")
                      ? rawImg
                      : `${backendBaseUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
                    : "/images/placeholder.svg";

                  let vInfo = "";
                  if (item.variant?.attributes) {
                    try {
                      const attrs =
                        typeof item.variant.attributes === "string"
                          ? JSON.parse(item.variant.attributes)
                          : item.variant.attributes;
                      if (Array.isArray(attrs)) {
                        vInfo = attrs
                          .map((a: unknown) => (a as { value: string }).value)
                          .join(", ");
                      }
                    } catch (e) {
                      vInfo = "";
                    }
                  }

                  return (
                    <tr key={item.id} className="text-[13px]">
                      <td className="py-5 font-medium">{idx + 1}</td>
                      <td className="py-5 px-4 flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative flex-shrink-0">
                          <Image
                            src={finalImg}
                            alt={item.product_name || "product"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {item.product_name}
                          </p>
                          {vInfo && (
                            <p className="text-[11px] text-gray-400 font-medium">
                              {vInfo}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-5 text-gray-400 font-medium">
                        {item.variant?.sku || item.product?.sku || "N/A"}
                      </td>
                      <td className="py-5 font-medium text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="py-5 text-gray-400 font-medium">
                        {item.variant?.unit || item.product?.unit || "pcs"}
                      </td>
                      <td className="py-5 text-right font-medium">
                        ৳{Number(item.unit_price).toLocaleString()}
                      </td>
                      <td className="py-5 text-right font-medium">
                        ৳
                        {(
                          Number(item.unit_price) * item.quantity
                        ).toLocaleString()}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Totals */}
        <div className="flex flex-col md:flex-row justify-between items-start border-t border-gray-100 pt-8 gap-6">
          <button
            onClick={() => setIsEditOpen(true)}
            data-html2canvas-ignore
            className="flex items-center gap-2 text-base font-medium text-gray-800 hover:text-[#FF5C24] transition-colors"
          >
            <FiEdit3 className="text-xl" /> Edit
          </button>

          <div className="w-full max-w-[280px] space-y-3">
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Sub Total</span>
              <span className="font-medium text-gray-800">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Delivery Charge</span>
              <span className="font-medium text-gray-800">
                ৳{shippingFee.toLocaleString()}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-500 font-medium">
                <span>Discount</span>
                <span className="font-medium">
                  -৳{discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-medium text-gray-900 border-t border-gray-50 pt-3">
              <span>Grand Total</span>
              <span className="text-[#FF5C24]">
                ৳{apiResponse.total_bill?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Advance Pay</span>
              <span className="font-medium text-gray-800">
                ৳{apiResponse?.advance_amount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-lg font-medium text-gray-900 border-t border-gray-200 pt-3">
              <span>Due Pay</span>
              <span className="text-[#FF5C24]">
                ৳{apiResponse.total_amount_due?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 text-center border-t border-gray-50 pt-6">
          <p className="text-[14px] font-medium text-red-500">
            বিঃ দ্রঃ ইনভয়েসসহ আনবক্সিং ভিডিও বাধ্যতামূলক ভিডিও ছাড়া কোনো অভিযোগ
            গ্রহণযোগ্য নয়*
          </p>
        </div>
      </div>

      {/* Modals */}
      <OrderCompletedModal
        isOpen={isCompletedOpen}
        onClose={() => setIsCompletedOpen(false)}
        customerName={currentCustomer.name}
        invoiceNo={apiResponse.invoice_number}
      />

      <EditOrderModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        customer={currentCustomer as CustomerInfo}
        onSave={(updated) => editInvoiceMutation.mutate(updated)}
      />
    </div>
  );
}
