"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import InputField from "./InputField";
import OrderItemComponent from "./OrderItem";
import PricingList from "./PricingList";
import { FaCaretDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  fetchCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from "@/services-api/cartService";
import { createOrderService } from "@/services-api/orderService";
import {
  applyCouponService,
  CouponResponse,
} from "@/services-api/couponService";
import {
  fetchShippingSettings,
  calculateCartShippingDetails,
} from "@/services-api/shippingService";
import { fetchSingleProduct } from "@/services-api/productService";
import { CartItem, OrderPayload } from "@/@types/order.type";
import { useAuthStore } from "@/store/useAuthStore";
import { Product, ShippingConfig } from "@/@types/product.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
import { MOHASAGOR_PREFIX } from "@/constants/checkout";
import debounce from "lodash/debounce";
import { trackIncompleteOrder } from "@/services-api/incompleteOrderService";

const MainCheckoutSection: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const user = useAuthStore((state) => state.user);
  const isStoreReady = useAuthStore((state) => state._hasHydrated);

  const [orderSource, setOrderSource] = useState<string>("direct");
  useEffect(() => {
    const stored = sessionStorage.getItem("order_source");
    if (stored) setOrderSource(stored);
  }, []);

  const [guestId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    let id = localStorage.getItem("guestId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("guestId", id);
    }
    return id;
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    shippingArea: "outside" as "inside" | "outside" | "sub_city",
    paymentMethod: "COD",
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart", user?.id, guestId],
    queryFn: () => fetchCart(user ? null : guestId),
    enabled: isStoreReady && (!!user || !!guestId),
  });

  const { data: shippingSettings } = useQuery({
    queryKey: ["shipping-settings"],
    queryFn: fetchShippingSettings,
  });

  const rawCartItems: CartItem[] = cartData?.items || [];

  const productQueries = useQueries({
    queries: rawCartItems.map((item) => ({
      queryKey: ["product-detail-shipping", item.productId],
      queryFn: () => {
        if (item.productId?.startsWith(MOHASAGOR_PREFIX))
          return Promise.resolve(null);
        return fetchSingleProduct(item.productId);
      },
      enabled:
        !!item.productId && !item.productId?.startsWith(MOHASAGOR_PREFIX),
    })),
  });

  const cartItems: CartItem[] = useMemo(() => {
    return rawCartItems.map((item, index) => {
      const pData = productQueries[index]?.data;
      const existingProduct = (item.product || {}) as Product;

      return {
        ...item,
        product: {
          id: item.productId,
          name: item.name || existingProduct.name || pData?.name || "Product",
          featuredImage: item.image || existingProduct.featuredImage || "",
          price: Number(
            item.price || existingProduct.price || pData?.sell_price || 0,
          ),
          shipping_type:
            existingProduct.shipping_type || pData?.shipping_type || "DEFAULT",
          shipping_config:
            existingProduct.shipping_config || pData?.shipping_config || null,
        },
      };
    });
  }, [rawCartItems, productQueries]);

  const courierConfig = shippingSettings?.courier_config;
  // golobal setttings have only enable
  const isSubCityAvailable = useMemo(() => {
    if (!courierConfig?.sub_city) return false;
    return cartItems.every((item) => {
      const prod = (item.product || {}) as unknown as Product;
      if (String(prod.shipping_type).toUpperCase() === "CUSTOM") {
        const raw = prod.shipping_config;
        let config = [];
        try {
          config = typeof raw === "string" ? JSON.parse(raw) : raw || [];
        } catch {
          config = [];
        }
        return (
          Array.isArray(config) &&
          config.some((c) => String(c.zone).toLowerCase().includes("sub"))
        );
      }
      return true;
    });
  }, [cartItems, courierConfig]);

  useEffect(() => {
    if (!isSubCityAvailable && formData.shippingArea === "sub_city") {
      setFormData((prev) => ({ ...prev, shippingArea: "outside" }));
    }
  }, [isSubCityAvailable, formData.shippingArea]);

  // Dynamic shipping options computation (location & charge)
  const dynamicShippingOptions = useMemo(() => {
    // Check if any product in cart has CUSTOM shipping_type with custom shipping_config
    const customOptions: { key: string; label: string; fee: number }[] = [];

    cartItems.forEach((item) => {
      const prod = (item.product || {}) as Product;
      const sType = String(prod.shipping_type || "DEFAULT").toUpperCase();
      const rawConfig = prod.shipping_config || item.shipping_config;
      if (sType === "CUSTOM" && rawConfig) {
        let config: ShippingConfig[] = [];
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
              const exists = customOptions.find(
                (opt) => opt.label.toLowerCase() === zoneName.toLowerCase(),
              );
              if (!exists) {
                customOptions.push({
                  key: zoneName.toLowerCase().replace(/\s+/g, "_"),
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

    // Default Fallback Options
    const options = [
      {
        key: "inside",
        label: t.checkout.insideDhakaLabel || "Inside Dhaka",
        fee: calculateCartShippingDetails(cartItems, "inside", shippingSettings)
          .totalShippingFee,
      },
      {
        key: "outside",
        label: t.checkout.outsideDhakaLabel || "Outside Dhaka",
        fee: calculateCartShippingDetails(
          cartItems,
          "outside",
          shippingSettings,
        ).totalShippingFee,
      },
    ];

    if (isSubCityAvailable) {
      options.push({
        key: "sub_city",
        label: t.checkout.subCityLabel || "Sub City",
        fee: calculateCartShippingDetails(
          cartItems,
          "sub_city",
          shippingSettings,
        ).totalShippingFee,
      });
    }

    return options;
  }, [cartItems, shippingSettings, isSubCityAvailable, t]);

  // Set default shippingArea when options load if current is invalid
  useEffect(() => {
    if (dynamicShippingOptions.length > 0) {
      const exists = dynamicShippingOptions.some(
        (opt) => opt.key === formData.shippingArea,
      );
      if (!exists) {
        setFormData((prev) => ({
          ...prev,
          shippingArea: dynamicShippingOptions[0].key,
        }));
      }
    }
  }, [dynamicShippingOptions]);

  const calculatedShippingFee = useMemo(() => {
    const selectedOpt = dynamicShippingOptions.find(
      (opt) => opt.key === formData.shippingArea,
    );
    if (selectedOpt) return selectedOpt.fee;
    return dynamicShippingOptions[0]?.fee || 0;
  }, [formData.shippingArea, dynamicShippingOptions]);

  const formatShippingOptionLabel = (label: string, fee: number) =>
    `${label} - BDT ${fee}`;

  const updateQtyMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      updateCartItem(id, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update quantity"),
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => deleteCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart");
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => applyCouponService({ code }),
    onSuccess: (data: CouponResponse) => {
      const discount = data?.discountAmount ?? data?.data?.discountAmount ?? 0;
      setCouponDiscount(Number(discount));
      setAppliedCoupon(couponInput.trim());
      toast.success("Coupon applied successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: (payload: OrderPayload) => createOrderService(payload),
    onSuccess: async (data) => {
      toast.success("Order placed successfully!");

      const orderUUID = data?.data?.id || data?.id || "";
      const hasMohasagor = cartItems.some((i) =>
        i.productId?.startsWith(MOHASAGOR_PREFIX),
      );

      // clean the cart
      try {
        await clearCart(user ? null : guestId);
      } catch (err) {
        console.error("Cart API cleanup failed:", err);
      }

      // re-fresh react query cache
      queryClient.invalidateQueries({
        queryKey: ["cart", user?.id || null, guestId],
      });

      // extra clearing
      sessionStorage.removeItem("order_source");
      sessionStorage.removeItem("mohasagor_order");

      // custom event for real-time count update
      window.dispatchEvent(new Event("cart_updated"));

      // redirect
      const redirectUrl = orderUUID
        ? `/thank_you?orderId=${orderUUID}${hasMohasagor ? "&type=mohasagor" : ""}`
        : "/thank_you";

      router.push(redirectUrl);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    if (!user) {
      toast.error("Please login/signup to place an order");
      router.push("/signin?redirect=/order");
      return;
    }
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const allItemsForBackend = cartItems.map((item) => {
      const isMohasagor = item.productId?.startsWith(MOHASAGOR_PREFIX);

      // fee matching selected dynamic option or calculated shipping fee
      const fee = calculatedShippingFee;

      if (isMohasagor) {
        const formattedAttributes = Array.isArray(item.variantInfo)
          ? item.variantInfo.map((v) => ({
              type: "text",
              label: v.label || "Variant",
              value: v.value || "",
            }))
          : [
              {
                type: "text",
                label: "Variant",
                value: String(item.variantInfo || ""),
              },
            ];

        return {
          isExternal: true as const,
          externalProductId: item.productId,
          externalVariantId: item.variantId || null,
          externalName: item.name || item.product?.name || "Mohasagor Product",
          externalPrice: Number(item.price || 0),
          externalImage: item.image || item.product?.featuredImage || "",
          externalAttributes: formattedAttributes,
          item_shipping_fee: fee,
          quantity: item.quantity,
        };
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        variantId:
          item.variantId && item.variantId !== "null"
            ? item.variantId
            : undefined,
        item_shipping_fee: fee,
      };
    });

    // Map shippingArea to standard inside/outside backend enum if custom zone key was selected
    const selectedOpt = dynamicShippingOptions.find(
      (opt) => opt.key === formData.shippingArea,
    );
    const resolvedShippingArea =
      formData.shippingArea === "inside" ||
      formData.shippingArea === "outside" ||
      formData.shippingArea === "sub_city"
        ? formData.shippingArea
        : selectedOpt &&
            selectedOpt.label.toLowerCase().includes("dhaka") &&
            !selectedOpt.label.toLowerCase().includes("outside")
          ? "inside"
          : "outside";

    const payload: OrderPayload = {
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      customerNote: [
        formData.note,
        cartItems.some((i) => i.productId?.startsWith(MOHASAGOR_PREFIX))
          ? `[Mohasagor External Products: ${cartItems
              .filter((i) => i.productId?.startsWith(MOHASAGOR_PREFIX))
              .map((i) => `${i.name}`)
              .join(", ")}]`
          : "",
      ]
        .filter(Boolean)
        .join(" | "),
      paymentMethod: formData.paymentMethod,
      shippingArea: resolvedShippingArea,
      shippingFee: calculatedShippingFee,
      shipping_fee: calculatedShippingFee,
      delivery_charge: calculatedShippingFee,
      source: orderSource,
      items: allItemsForBackend,
      couponCode: appliedCoupon || undefined,
    };

    placeOrderMutation.mutate(payload);
  };

  // 1. Ensure debouncedTrack is stable to fix "useEffect changed size" error
  const debouncedTrack = useCallback(
    debounce(async (data, items, source, gid) => {
      // Only stop if the cart is completely empty
      if (!items || items.length === 0) return;

      const payload = {
        guestId: gid, // The invisible ID that makes "nothing required" work
        customerName: data.name || "",
        customerPhone: data.phone || "",
        customerAddress: data.address || "",
        source: source || "direct",
        items: items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId !== "null" ? item.variantId : undefined,
          qty: Number(item.quantity || 1),
        })),
      };

      await trackIncompleteOrder(payload);
    }, 1500),
    [], // Keep this empty to ensure the function never changes
  );

  // 2. The Effect
  useEffect(() => {
    if (isStoreReady && cartItems.length > 0) {
      // This fires IMMEDIATELY when the page loads with items
      debouncedTrack(formData, cartItems, orderSource, guestId);
    }
  }, [isStoreReady, cartItems, formData, orderSource, guestId, debouncedTrack]);

  if (isLoading)
    return (
      <div className="p-20 text-center font-poppins text-lg font-medium">
        Loading Checkout...
      </div>
    );

  return (
    <div className="max-w-[1720px] mx-auto p-4 md:p-10 font-poppins bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Form Section */}
        <div className="lg:col-span-7 flex flex-col gap-5 md:gap-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
            {t.checkout.shoppingDetails}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={t.checkout.name}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t.checkout.namePlaceholder}
              required
            />
            <InputField
              label={t.checkout.number}
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t.checkout.phonePlaceholder}
              required
            />
          </div>

          <InputField
            label={t.checkout.address}
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder={t.checkout.addressPlaceholder}
            required
          />
          <InputField
            label={t.checkout.note}
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder={t.checkout.notePlaceholder}
            isTextArea
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 w-full relative">
              <label className="text-[#727272] font-semibold text-base md:text-lg">
                {t.checkout.deliveryCharge}{" "}
                <span className="text-[#FF7050]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  name="shippingArea"
                  value={formData.shippingArea}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] pl-4 md:pl-6 pr-12 py-3.5 md:py-4 rounded-xl outline-none text-base appearance-none cursor-pointer"
                >
                  {dynamicShippingOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {formatShippingOptionLabel(opt.label, opt.fee)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FaCaretDown />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full relative">
              <label className="text-[#727272] font-semibold text-base md:text-lg">
                {t.checkout.paymentMethod}{" "}
                <span className="text-[#FF7050]">*</span>
              </label>
              <div className="relative w-full">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full bg-[#F7F7F7] pl-4 md:pl-6 pr-12 py-3.5 md:py-4 rounded-xl outline-none text-base appearance-none cursor-pointer"
                >
                  <option value="COD">{t.checkout.cashOnDelivery}</option>
                  <option value="Online">{t.checkout.onlinePayment}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FaCaretDown />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#727272] font-semibold text-base md:text-lg">
              {t.checkout.coupon}
            </label>
            <div className="flex gap-2">
              <input
                placeholder={t.checkout.couponPlaceholder}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="bg-[#F7F7F7] py-4 px-4 rounded-xl outline-none text-base w-full font-poppins"
              />
              <button
                onClick={() => applyCouponMutation.mutate(couponInput.trim())}
                disabled={applyCouponMutation.isPending || !couponInput.trim()}
                className="bg-[#9E9E9E] text-white px-8 py-3.5 rounded-xl hover:bg-gray-500 transition-colors"
              >
                {applyCouponMutation.isPending
                  ? "..."
                  : appliedCoupon
                    ? "Applied"
                    : t.checkout.apply}
              </button>
            </div>
          </div>

          <div className="bg-[#FFFF00] p-4 rounded-[12px] flex items-center gap-2 text-sm md:text-base font-normal justify-center">
            <span>⚠️</span>
            <span>{t.checkout.deliveryWarning}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending}
            className="bg-[#FF7050] text-white py-4 rounded-[12px] text-lg md:text-xl font-bold hover:bg-[#ff6b48] transition-all cursor-pointer"
          >
            {placeOrderMutation.isPending
              ? "Placing Order..."
              : t.checkout.placeOrder}
          </button>
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-lg md:text-xl font-semibold mb-6 md:mb-10">
            {t.checkout.myOrders}
          </h2>
          <div className="flex flex-col max-h-[400px] overflow-y-auto no-scrollbar mb-4">
            {cartItems.map((item) => (
              <OrderItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={(id, qty) =>
                  updateQtyMutation.mutate({ id, qty })
                }
                onRemove={(id) => removeItemMutation.mutate(id)}
              />
            ))}
          </div>
          <PricingList
            items={cartItems}
            shippingFee={calculatedShippingFee}
            couponDiscount={couponDiscount}
          />
        </div>
      </div>
    </div>
  );
};

export default MainCheckoutSection;
