"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  User,
  ShoppingBag,
  CreditCard,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  createOrderService,
  getOrderByIdService,
  updateOrderStatusService,
  searchProductsService,
} from "@/services-api/orderService";
import {
  fetchShippingSettings,
  calculateCartShippingDetails,
  buildZoneShippingOptions,
  CartItemWithShipping,
  ShippingConfigEntry,
} from "@/services-api/shippingService";
import { fetchSingleProduct } from "@/services-api/productService";
import { toast } from "react-hot-toast";
import Image from "next/image";

type orderItem = {
  productId: string;
  name: string;
  sell_price: number;
  quantity: number;
  variantId?: string | null;
  image?: string;
};

type ProductVariant = {
  id: string | number;
  price?: number | string;
  images?: string[];
  attributes?: { value?: string; label?: string }[];
  sku?: string;
  stock?: number;
};

type Product = {
  id: string;
  name: string;
  sell_price: number | string;
  images?: string[];
  image?: string;
  variants?: ProductVariant[];
  shipping_type?: string;
  shipping_config?: ShippingConfigEntry[] | string;
};

type OrderItemFromApi = {
  product_id: number | string;
  product_name: string;
  unit_price: number;
  quantity: number;
  variant_id: number | string | null;
  external_image?: string | null;
  product?: {
    id?: string;
    images?: string[];
  } | null;
  variant?: {
    id?: string;
    images?: string[];
  } | null;
};

type ExistingOrder = {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_note?: string;
  shipping_fee?: number | string;
  payment_method?: string;
  source?: string;
  status?: string;
  payment_status?: string;
  discount_amount?: number | string;
  advance_amount?: number | string;
  courier_city_id?: number | null;
  courier_zone_id?: number | null;
  courier_area_id?: number | null;
  order_items: OrderItemFromApi[];
};

// Matches OrderItemInput expected by orderService (no `null`, only `undefined`)
type OrderPayload = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote: string;
  shippingArea: string;
  shippingFee?: number;
  shipping_fee?: number;
  delivery_charge?: number;
  paymentMethod: string;
  source: string;
  status: string;
  paymentStatus: string;
  manualDiscount: number;
  advanceAmount: number;
  courier_city_id?: number;
  courier_zone_id?: number;
  courier_area_id?: number;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
};

// Shipping/config form state shape
type ShippingState = {
  shippingArea: string;
  paymentMethod: string;
  source: string;
  status: string;
  paymentStatus: string;
  manualDiscount: number;
  advanceAmount: number;
  actualShippingFee: number | null; // stores real fee from API in edit mode
  courier_city_id: number | null;
  courier_zone_id: number | null;
  courier_area_id: number | null;
};

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
const SAVED_SHIPPING_KEY = "__saved_shipping__";
export default function AddOrderMain() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const orderId = searchParams.get("id");
  const isEditMode = !!orderId;

  const [loading, setLoading] = useState(false);

  // --- Form States ---
  const [items, setItems] = useState<orderItem[]>([]);
  const [customer, setCustomer] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerNote: "",
  });

  const [shipping, setShipping] = useState<ShippingState>({
    shippingArea: "inside",
    paymentMethod: "COD",
    source: "admin_panel",
    status: "PENDING",
    paymentStatus: "UNPAID",
    manualDiscount: 0,
    advanceAmount: 0,
    actualShippingFee: null,
    courier_city_id: null,
    courier_zone_id: null,
    courier_area_id: null,
  });

  // --- Product Search & Variant Modal State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProductForVariant, setSelectedProductForVariant] =
    useState<Product | null>(null);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const getImgUrl = (rawImg?: string) => {
    const url = extractImageUrl(rawImg);
    const cleanImg = typeof url === "string" ? url.trim() : "";
    return cleanImg !== ""
      ? cleanImg.startsWith("http")
        ? cleanImg
        : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`
      : "/images/products/product2.png";
  };

  // --- 1. FETCH DATA (Edit Mode) ---
  const { data: existingOrder, isLoading: isFetchingOrder } =
    useQuery<ExistingOrder>({
      queryKey: ["edit-order", orderId],
      queryFn: () => getOrderByIdService(orderId!),
      enabled: isEditMode,
    });

  // --- Fetch Global Shipping Settings ---
  const { data: shippingSettings } = useQuery({
    queryKey: ["shipping-settings"],
    queryFn: fetchShippingSettings,
  });

  // --- Fetch Product Details for Cart Items to get shipping_type and shipping_config ---
  const itemProductQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ["product-detail-shipping", item.productId],
      queryFn: () => fetchSingleProduct(item.productId),
      enabled: !!item.productId,
    })),
  });

  // Attach resolved product shipping info to cart items
  const cartItemsWithShipping: CartItemWithShipping[] = useMemo(() => {
    return items.map((item, index) => {
      const pData = itemProductQueries[index]?.data as Product | undefined;
      return {
        id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.sell_price,
        product: {
          shipping_type: pData?.shipping_type || "DEFAULT",
          shipping_config: pData?.shipping_config || undefined,
        },
      } as CartItemWithShipping;
    });
  }, [items, itemProductQueries]);

  // Compute Dynamic Shipping Options for Admin Select Dropdown
  const dynamicShippingOptions = useMemo(() => {
    if (items.length === 0) {
      const realZoneOptions = buildZoneShippingOptions(
        shippingSettings?.courier_config,
      );
      if (realZoneOptions.length > 0) {
        return realZoneOptions.map((z) => ({
          key: z.key,
          label: z.label,
          fee: z.fee,
        }));
      }
      return [
        { key: "inside", label: "Inside Dhaka", fee: 60 },
        { key: "outside", label: "Outside Dhaka", fee: 120 },
      ];
    }

    const customOptions: { key: string; label: string; fee: number }[] = [];

    cartItemsWithShipping.forEach((item) => {
      const prod = (item.product || {}) as {
        shipping_type?: string;
        shipping_config?: ShippingConfigEntry[] | string;
      };
      const sType = String(prod.shipping_type || "DEFAULT").toUpperCase();
      const rawConfig = prod.shipping_config;

      if (sType === "CUSTOM" && rawConfig) {
        let config: ShippingConfigEntry[] = [];
        try {
          config =
            typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
        } catch {
          config = [];
        }
        if (Array.isArray(config)) {
          config.forEach((c) => {
            if (c.zone && c.charge !== undefined && c.charge !== null) {
              const zoneName = String(c.zone).trim();
              const chargeNum = Number(c.charge);
              const keyName = zoneName.toLowerCase().replace(/\s+/g, "_");
              const exists = customOptions.find((opt) => opt.key === keyName);
              if (!exists) {
                customOptions.push({
                  key: keyName,
                  label: zoneName,
                  fee: chargeNum,
                });
              } else {
                exists.fee = Math.max(exists.fee, chargeNum);
              }
            }
          });
        }
      }
    });

    if (customOptions.length > 0) {
      return customOptions;
    }

    // 🔥 Real zones configured by admin in Settings — actual list
    const realZoneOptions = buildZoneShippingOptions(
      shippingSettings?.courier_config,
    );
    if (realZoneOptions.length > 0) {
      return realZoneOptions.map((z) => ({
        key: z.key,
        label: z.label,
        fee: z.fee,
      }));
    }

    // Fallback only if admin hasn't configured any zones at all
    const insideFee = calculateCartShippingDetails(
      cartItemsWithShipping,
      "inside",
      shippingSettings,
    ).totalShippingFee;

    const outsideFee = calculateCartShippingDetails(
      cartItemsWithShipping,
      "outside",
      shippingSettings,
    ).totalShippingFee;

    const options = [
      { key: "inside", label: "Inside Dhaka", fee: insideFee },
      { key: "outside", label: "Outside Dhaka", fee: outsideFee },
    ];

    if (shippingSettings?.courier_config?.sub_city) {
      const subCityFee = calculateCartShippingDetails(
        cartItemsWithShipping,
        "sub_city",
        shippingSettings,
      ).totalShippingFee;
      options.push({ key: "sub_city", label: "Sub City", fee: subCityFee });
    }

    return options;
  }, [items, cartItemsWithShipping, shippingSettings]);

  const userSelectedShippingRef = useRef(false);
  const isShippingDataLoading =
    !shippingSettings ||
    itemProductQueries.some((q) => q.isLoading || q.isFetching);

  // auto-select effect
  useEffect(() => {
    if (dynamicShippingOptions.length === 0 || isShippingDataLoading) return;
    if (
      isEditMode &&
      !hasMatchedEditShippingRef.current &&
      shipping.actualShippingFee !== null
    ) {
      hasMatchedEditShippingRef.current = true;
      const matched = dynamicShippingOptions.find(
        (opt) => Number(opt.fee) === Number(shipping.actualShippingFee),
      );
      userSelectedShippingRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShipping((prev) => ({
        ...prev,
        shippingArea: matched ? matched.key : SAVED_SHIPPING_KEY,
      }));
      return;
    }

    const exists = dynamicShippingOptions.some(
      (opt) => opt.key === shipping.shippingArea,
    );

    if (
      !shipping.shippingArea ||
      (!exists && !userSelectedShippingRef.current)
    ) {
      setShipping((prev) => ({
        ...prev,
        shippingArea: dynamicShippingOptions[0].key,
      }));
    }
  }, [
    dynamicShippingOptions,
    isShippingDataLoading,
    shipping.shippingArea,
    shipping.actualShippingFee,
    isEditMode,
  ]);

  // --- 2. POPULATE FORM (Render-time hydration when existingOrder is loaded) ---
  const hasMatchedEditShippingRef = useRef(false);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  if (isEditMode && existingOrder && loadedOrderId !== existingOrder.id) {
    setLoadedOrderId(existingOrder.id);
    // eslint-disable-next-line react-hooks/immutability, react-hooks/refs
    hasMatchedEditShippingRef.current = false;
    // eslint-disable-next-line react-hooks/refs
    userSelectedShippingRef.current = false;
    setCustomer({
      customerName: existingOrder.customer_name || "",
      customerPhone: existingOrder.customer_phone || "",
      customerAddress: existingOrder.customer_address || "",
      customerNote: existingOrder.customer_note || "",
    });

    const realShippingFee = Number(existingOrder.shipping_fee) || 0;
    setShipping({
      shippingArea: "",
      paymentMethod: existingOrder.payment_method || "COD",
      source: existingOrder.source || "admin_panel",
      status: existingOrder.status || "PENDING",
      paymentStatus: existingOrder.payment_status || "UNPAID",
      manualDiscount: Number(existingOrder.discount_amount) || 0,
      advanceAmount: Number(existingOrder.advance_amount) || 0,
      actualShippingFee: realShippingFee,
      courier_city_id: existingOrder.courier_city_id ?? null,
      courier_zone_id: existingOrder.courier_zone_id ?? null,
      courier_area_id: existingOrder.courier_area_id ?? null,
    });

    const mappedItems = existingOrder.order_items.map(
      (item: OrderItemFromApi) => {
        const itemImage =
          item.variant?.images?.[0] ||
          item.product?.images?.[0] ||
          item.external_image ||
          "";
        return {
          productId: String(item.product_id),
          name: item.product_name,
          sell_price: Number(item.unit_price),
          quantity: item.quantity,
          variantId: item.variant_id !== null ? String(item.variant_id) : null,
          image: itemImage,
        };
      },
    );
    setItems(mappedItems);
  }

  // --- Calculations ---
  const subtotal = items.reduce(
    (acc: number, item: { sell_price: number; quantity: number }) =>
      acc + item.sell_price * item.quantity,
    0,
  );

  // Dynamic Shipping Fee calculation
  const calculatedShippingFee = useMemo(() => {
    if (isEditMode && shipping.actualShippingFee !== null) {
      return shipping.actualShippingFee;
    }
    const selectedOpt = dynamicShippingOptions.find(
      (opt) => opt.key === shipping.shippingArea,
    );
    if (selectedOpt) return selectedOpt.fee;
    return dynamicShippingOptions[0]?.fee || 0;
  }, [
    isEditMode,
    shipping.actualShippingFee,
    shipping.shippingArea,
    dynamicShippingOptions,
  ]);

  const shippingFee = calculatedShippingFee;
  const totalDue = subtotal + shippingFee - shipping.manualDiscount;
  // Remaining amount after advance payment
  const remainingDue = totalDue - shipping.advanceAmount;

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.length < 2) return;
    try {
      const res = await searchProductsService(val);
      setSearchResults(res.data?.data || []);
    } catch (e) {}
  };

  const handleSelectProductFromSearch = async (product: Product) => {
    try {
      const singleP = await fetchSingleProduct(product.id);
      const fullProd: Product = singleP
        ? {
            ...singleP,
            images: singleP.images?.map((img) =>
              typeof img === "string" ? img : img.url,
            ),
          }
        : product;
      if (fullProd.variants && fullProd.variants.length > 0) {
        setSelectedProductForVariant(fullProd);
      } else {
        addItem(fullProd, null);
      }
    } catch (e) {
      addItem(product, null);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const addItem = (
    product: Product,
    selectedVariant: ProductVariant | null,
  ) => {
    const vId = selectedVariant?.id ? String(selectedVariant.id) : null;
    const existingIndex = items.findIndex(
      (i) => i.productId === product.id && i.variantId === vId,
    );

    const price = selectedVariant?.price
      ? Number(selectedVariant.price)
      : Number(product.sell_price || 0);

    const prodImg =
      selectedVariant?.images?.[0] ||
      product.images?.[0] ||
      product.image ||
      "";

    const variantLabel = selectedVariant?.attributes
      ? selectedVariant.attributes.map((a) => a.value || a.label).join(" / ")
      : "";

    const itemName = variantLabel
      ? `${product.name} (${variantLabel})`
      : product.name;

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          name: itemName,
          sell_price: price,
          quantity: 1,
          variantId: vId,
          image: prodImg,
        },
      ]);
    }
    setSelectedProductForVariant(null);
  };

  const updateQuantity = (idx: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...items];
    updated[idx].quantity = qty;
    setItems(updated);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0)
      return toast.error("Please add at least one product");

    setLoading(true);
    try {
      const selectedOpt = dynamicShippingOptions.find(
        (opt) => opt.key === shipping.shippingArea,
      );
      const resolvedShippingArea =
        shipping.shippingArea === "inside" ||
        shipping.shippingArea === "outside" ||
        shipping.shippingArea === "sub_city"
          ? shipping.shippingArea
          : selectedOpt &&
              selectedOpt.label.toLowerCase().includes("dhaka") &&
              !selectedOpt.label.toLowerCase().includes("outside")
            ? "inside"
            : "outside";

      const payload: OrderPayload = {
        // Customer fields
        customerName: customer.customerName,
        customerPhone: customer.customerPhone,
        customerAddress: customer.customerAddress,
        customerNote: customer.customerNote,
        // Shipping & order config
        shippingArea: resolvedShippingArea,
        // shippingFee: calculatedShippingFee,
        shipping_fee: calculatedShippingFee,
        // delivery_charge: calculatedShippingFee,
        paymentMethod: shipping.paymentMethod,
        source: shipping.source,
        status: shipping.status,
        paymentStatus: shipping.paymentStatus,
        // Financial fields — explicitly named to avoid confusion
        manualDiscount: Number(shipping.manualDiscount),
        advanceAmount: Number(shipping.advanceAmount),
        // Courier IDs (optional)
        courier_city_id: shipping.courier_city_id
          ? Number(shipping.courier_city_id)
          : undefined,
        courier_zone_id: shipping.courier_zone_id
          ? Number(shipping.courier_zone_id)
          : undefined,
        courier_area_id: shipping.courier_area_id
          ? Number(shipping.courier_area_id)
          : undefined,
        // Items
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? undefined,
          quantity: i.quantity,
        })),
      };
      console.log("payload", payload);

      if (isEditMode) {
        await updateOrderStatusService(orderId!, payload);
        toast.success("Order Updated Successfully");
      } else {
        await createOrderService(payload);
        toast.success("Order Created Successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      router.push("/admin/dashboard/order");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to save order");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingOrder) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-[#1DA1F2]" size={40} />
        <p className="text-gray-500 font-medium font-lato">
          Fetching Order Data...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen font-lato">
      <div className="">
        <div className="flex justify-between items-center mb-6 mt-6">
          <h1 className="text-2xl font-bold text-[#023337]">
            {isEditMode ? "Modify Order Details" : "Create New Order"}
          </h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#1DA1F2] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isEditMode ? (
              <Save size={18} />
            ) : (
              <Plus size={18} />
            )}
            {isEditMode ? "Update Order" : "Place Order"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Products */}
            <div className="bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-[#1DA1F2]">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-medium text-gray-800">
                  Cart Items
                </h2>
              </div>

              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search products to add..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#1DA1F2]"
                />

                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-[8px] shadow-xl max-h-[250px] overflow-y-auto">
                    {searchResults.map((product: Product) => {
                      const img = product.images?.[0] || product.image;
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProductFromSearch(product)}
                          className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {img && (
                              <Image
                                src={getImgUrl(img)}
                                alt={product.name}
                                width={36}
                                height={36}
                                unoptimized
                                className="w-9 h-9 object-cover rounded border bg-gray-50"
                              />
                            )}
                            <div className="flex flex-col text-left">
                              <span className="font-medium text-gray-700">
                                {product.name}
                              </span>
                              {product.variants &&
                                product.variants.length > 0 && (
                                  <span className="text-[11px] text-[#1DA1F2] font-semibold">
                                    {product.variants.length} Variants Available
                                  </span>
                                )}
                            </div>
                          </div>
                          <span className="text-[#1DA1F2] font-bold">
                            ৳{product.sell_price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-sm font-medium border-b border-gray-200">
                    <tr>
                      <th className="pb-3">Item</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Subtotal</th>
                      <th className="pb-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-4 font-medium flex items-center gap-3">
                          {item.image ? (
                            <Image
                              src={getImgUrl(item.image)}
                              alt={item.name}
                              width={40}
                              height={40}
                              unoptimized
                              className="w-10 h-10 object-cover rounded-lg border bg-gray-50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">
                              N/A
                            </div>
                          )}
                          <div className="flex flex-col text-left">
                            <span>{item.name}</span>
                            <span className="text-xs text-gray-400">
                              Unit Price: ৳{item.sell_price}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(idx, item.quantity - 1)
                              }
                              className="w-6 h-6 border rounded hover:bg-gray-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(idx, item.quantity + 1)
                              }
                              className="w-6 h-6 border rounded hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right font-bold text-gray-800">
                          ৳{item.sell_price * item.quantity}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-red-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- VARIANT SELECTION MODAL --- */}
            {selectedProductForVariant && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10002] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 text-left">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Select Variant
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {selectedProductForVariant.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProductForVariant(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {selectedProductForVariant.variants?.map(
                      (v: ProductVariant) => {
                        const vImg =
                          v.images?.[0] ||
                          selectedProductForVariant.images?.[0] ||
                          selectedProductForVariant.image;
                        const attrText = v.attributes
                          ? v.attributes
                              .map((a) => a.value || a.label)
                              .join(" / ")
                          : `Variant #${v.id}`;
                        const price =
                          v.price || selectedProductForVariant.sell_price;

                        return (
                          <div
                            key={v.id}
                            onClick={() =>
                              addItem(selectedProductForVariant, v)
                            }
                            className="p-3 border rounded-xl hover:border-[#1DA1F2] hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center gap-3">
                              {vImg ? (
                                <Image
                                  src={getImgUrl(vImg)}
                                  alt={attrText}
                                  width={44}
                                  height={44}
                                  unoptimized
                                  className="w-11 h-11 object-cover rounded-lg border bg-gray-50"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">
                                  N/A
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm text-gray-800">
                                  {attrText}
                                </p>
                                {v.sku && (
                                  <p className="text-xs text-gray-400">
                                    SKU: {v.sku} | Stock: {v.stock ?? 0}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-[#1DA1F2] text-sm">
                              ৳{price}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Customer */}
            <div className="bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-[#1DA1F2]">
                <User size={20} />
                <h2 className="text-lg font-bold text-gray-800">
                  Delivery Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customer.customerName}
                    onChange={(e) =>
                      setCustomer({ ...customer, customerName: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2]"
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customer.customerPhone}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        customerPhone: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2]"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <textarea
                    value={customer.customerAddress}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        customerAddress: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2]"
                    rows={2}
                    placeholder="Shipping address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 3. Settings */}
            <div className="bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-[#1DA1F2]">
                <RefreshCw size={20} />
                <h2 className="text-lg font-medium text-gray-800">
                  Order Config
                </h2>
              </div>

              <div className="space-y-4">
                {/* ⚡ Status Selectors (Only relevant in Edit or detailed create) */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Order Status
                  </label>
                  <select
                    value={shipping.status}
                    onChange={(e) =>
                      setShipping({ ...shipping, status: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-100 rounded-lg text-sm mt-2 cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="SENT_TO_COURIER">Sent to Courier</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="PARTIAL_DELIVERED">Partial Delivered</option>
                    <option value="CANCELED">Canceled</option>
                    <option value="RETURNED">Returned</option>
                    <option value="RETURN_RECEIVED">Return Received</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Payment Status
                  </label>
                  <select
                    value={shipping.paymentStatus}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-100 rounded-lg text-sm mt-2 cursor-pointer"
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-black flex items-center gap-2">
                    Shipping Area
                    {isShippingDataLoading && (
                      <Loader2
                        className="animate-spin text-gray-400"
                        size={12}
                      />
                    )}
                  </label>
                  <select
                    value={shipping.shippingArea}
                    onChange={(e) => {
                      userSelectedShippingRef.current = true;
                      setShipping((prev) => ({
                        ...prev,
                        shippingArea: e.target.value,
                        actualShippingFee: null,
                      }));
                    }}
                    disabled={isShippingDataLoading}
                    className="w-full p-2.5 bg-gray-100 rounded-lg text-sm mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isShippingDataLoading ? (
                      <option value={shipping.shippingArea}>
                        Calculating shipping fee...
                      </option>
                    ) : (
                      <>
                        {shipping.shippingArea === SAVED_SHIPPING_KEY && (
                          <option value={SAVED_SHIPPING_KEY}>
                            Saved Shipping (৳{shipping.actualShippingFee})
                          </option>
                        )}
                        {dynamicShippingOptions.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label} (৳{opt.fee})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Financials */}
            <div className="bg-white p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-[#1DA1F2]">
                <CreditCard size={20} />
                <h2 className="text-lg font-medium text-gray-800">
                  Bill Summary
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>৳{shippingFee}</span>
                </div>
                <div className="flex justify-between items-center gap-4 text-red-500">
                  <span>Manual Discount</span>
                  <input
                    type="number"
                    min={0}
                    value={
                      shipping.manualDiscount === 0
                        ? ""
                        : shipping.manualDiscount
                    }
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        manualDiscount:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="w-20 p-1 border rounded text-right bg-red-50"
                  />
                </div>
                <div className="pt-2 border-t flex justify-between items-center text-base font-semibold text-gray-700 border-gray-200">
                  <span>Total Due</span>
                  <span>৳{totalDue}</span>
                </div>
                <div className="flex justify-between items-center gap-4 text-green-600">
                  <span className="font-medium">Advance Payment</span>
                  <input
                    type="number"
                    min={0}
                    value={
                      shipping.advanceAmount === 0 ? "" : shipping.advanceAmount
                    }
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        advanceAmount:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="w-20 p-1 border border-green-300 rounded text-right bg-green-50"
                  />
                </div>
                <div className="pt-2 border-t flex justify-between items-center text-lg font-bold text-[#023337] border-gray-200">
                  <span>Remaining Due</span>
                  <span>৳{remainingDue}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Payment Method
                </label>
                <div className="flex gap-2 mt-2">
                  {["COD", "ONLINE"].map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setShipping({ ...shipping, paymentMethod: m })
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${shipping.paymentMethod === m ? "bg-[#1DA1F2] text-white border-[#1DA1F2]" : "bg-white text-gray-500"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
