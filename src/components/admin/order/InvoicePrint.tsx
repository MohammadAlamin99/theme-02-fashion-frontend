"use client";
import { getSettings } from "@/services-api/globalSettingsService";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

interface Product {
  id?: string | number;
  sku?: string;
  images?: string[];
  unit?: string;
}

interface OrderItem {
  id?: string | number;
  product_name?: string;
  quantity?: number | string;
  unit_price?: number | string;
  product?: Product;
  variant?: {
    images?: string[];
    sku?: string;
    unit?: string;
  };
  external_image?: string;
}

interface Order {
  order_number?: string | number;
  invoice_number?: string | number;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  created_at?: string;
  discount_amount?: number | string;
  shipping_fee?: number | string;
  total_amount_due?: number | string;
  total_bill?: number | string;
  advance_amount?: number | string;
  order_items?: OrderItem[];
}

function extractImageUrl(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    const inner = (val as Record<string, unknown>).url;
    if (typeof inner === "string") return inner;
    if (inner && typeof inner === "object") {
      const deepUrl = (inner as Record<string, unknown>).url;
      if (typeof deepUrl === "string") return deepUrl;
    }
  }
  return "";
}

export const InvoicePrint = React.forwardRef<
  HTMLDivElement,
  {
    order: Order | null;
    baseStorageUrl: string;
  }
>(({ order, baseStorageUrl }, ref) => {
  const { data: settingResponse } = useQuery({
    queryKey: ["global-settings"],
    queryFn: getSettings,
  });

  if (!order) return null;

  const subTotal =
    order.order_items?.reduce(
      (acc: number, item: OrderItem) =>
        acc + Number(item.unit_price || 0) * Number(item.quantity || 0),
      0,
    ) || 0;

  const discount = Number(order.discount_amount) || 0;
  const deliveryCharge = Number(order.shipping_fee) || 0;
  const grandTotal =
    Number(order.total_bill) || subTotal + deliveryCharge - discount;
  const advancePay = Number(order.advance_amount) || 0;
  const duePay = Number(order.total_amount_due) || grandTotal - advancePay;

  const settingsdata = settingResponse?.data;

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const logoUrl = settingsdata?.primary_logo
    ? settingsdata.primary_logo.startsWith("http")
      ? settingsdata.primary_logo
      : `${backendBaseUrl}${settingsdata.primary_logo.startsWith("/") ? "" : "/"}${settingsdata.primary_logo}`
    : "/images/admin/logo.png";

  return (
    <div
      ref={ref}
      className="p-12 bg-white min-h-[297mm] w-[210mm] font-lato text-[#023337] print:p-10 mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex gap-5">
          <div className="w-20 h-20 relative">
            <Image
              src={logoUrl}
              alt="Logo"
              className="object-contain"
              fill
              unoptimized
            />
          </div>
          <div className="text-[13px] border-l border-gray-200 pl-5 space-y-0.5">
            <p className="font-medium text-gray-500">
              {settingsdata?.company_name}
            </p>
            <p className="font-medium text-gray-500">
              {settingsdata?.contact_email}
            </p>
            <p className="font-medium text-gray-500">+88 0141 0050041</p>
          </div>
        </div>
        <div className="text-right text-[13px] text-gray-600">
          <p className="font-medium text-base text-[#023337] mb-1">
            Business address
          </p>
          <p>{settingsdata?.address}</p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex justify-between border-t border-gray-100 pt-8 mb-12">
        <div className="space-y-1">
          <p className="text-gray-400 font-medium text-base text-base">
            Billed to
          </p>
          <p className="font-bold text-[20px] text-[#023337]">
            {order.customer_name}
          </p>
          <p className="text-[14px] text-gray-700 font-medium">
            {order.customer_phone}
          </p>
          <p className="max-w-[280px] text-[14px] text-gray-600 leading-relaxed">
            {order.customer_address}
          </p>
        </div>
        <div className="text-right space-y-3">
          <div>
            <p className="text-gray-400 font-bold uppercase text-[11px] tracking-widest">
              Date
            </p>
            <p className="font-bold text-[15px] text-[#023337]">
              {order.created_at ? new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-medium text-base">
              Invoice number
            </p>
            <p className="font-medium text-base text-[#023337]">
              #{order.invoice_number || order.order_number}
            </p>
          </div>
          {/* order number */}
          <div>
            <p className="text-gray-400 font-medium text-base">Order number</p>
            <p className="font-medium text-base text-[#023337]">
              #{order.order_number}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="text-gray-400 text-[11px] font-bold uppercase border-b-2 border-[#023337]/10">
            <th className="py-4 text-left w-12">NO.</th>
            <th className="py-4 text-left">ITEM DETAIL</th>
            <th className="py-4 text-left">SKU</th>
            <th className="py-4 text-center">QTY</th>
            <th className="py-4 text-center">UNIT</th>
            <th className="py-4 text-right">RATE</th>
            <th className="py-4 text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order.order_items?.map((item: OrderItem, idx: number) => {
            // --- Image Logic (Same as ThankYou Page) ---
            const variantImg = extractImageUrl(item.variant?.images?.[0]);
            const productImg = extractImageUrl(item.product?.images?.[0]);
            const externalImg = extractImageUrl(item.external_image);
            const rawImg = variantImg || productImg || externalImg;

            const finalImg = rawImg
              ? rawImg.startsWith("http")
                ? rawImg
                : `${baseStorageUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
              : "/images/placeholder.svg";

            return (
              <tr key={item.id} className="text-[14px]">
                <td className="py-6 align-top text-gray-500">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="py-6 flex gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden relative">
                    <Image
                      unoptimized
                      fill
                      alt="Product image"
                      src={finalImg}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[#023337] text-[15px]">
                      {item.product_name}
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      High-quality premium product
                    </p>
                  </div>
                </td>
                <td className="py-6 align-top text-gray-500 font-medium uppercase">
                  {item.variant?.sku || item.product?.sku || "N/A"}
                </td>
                <td className="py-6 align-top text-center font-bold text-[#023337]">
                  {item.quantity}
                </td>
                <td className="py-6 align-top text-center text-gray-500">
                  {item.variant?.unit || item.product?.unit || "pcs"}
                </td>
                <td className="py-6 align-top text-right text-gray-600">
                  ৳{Number(item.unit_price || 0).toLocaleString()}
                </td>
                <td className="py-6 align-top text-right font-bold text-[#023337]">
                  ৳{(Number(item.unit_price || 0) * Number(item.quantity || 0)).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Calculations */}
      <div className="flex justify-end mt-10">
        <div className="w-72 space-y-3.5 text-[15px]">
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Sub Total</span>
            <span className="text-[#023337] font-bold">
              ৳{subTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Delivery Charge</span>
            <span className="text-[#023337] font-bold">
              ৳{deliveryCharge.toLocaleString()}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#7FB63F] font-medium">
              <span>Discount</span>
              <span className="font-bold">- ৳{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[20px] font-black text-[#023337] border-t-2 border-gray-100 pt-4 mt-2">
            <span>Grand Total</span>
            <span>৳{grandTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-400 font-medium">
            <span>Advance Pay</span>
            <span className="font-bold">৳{advancePay.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[18px] font-bold text-gray-800 pt-3 border-t border-dashed border-gray-200">
            <span>Due Pay</span>
            <span className="text-[#7FB63F]">৳{duePay.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePrint.displayName = "InvoicePrint";
