import { Order, OrderItem } from "@/@types/order.type";
import { ThankYouOrder, ThankYouOrderItem } from "@/@types/thankyouOrder.type";
import { extractImageUrl } from "@/utils/image";

export const extractOrderData = (
  fetchedData: ThankYouOrder & { data?: ThankYouOrder },
  defaultOrderId?: string | null,
): Order => {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";
  const raw = fetchedData?.data || fetchedData || {};

  const items: OrderItem[] = Array.isArray(raw.order_items)
    ? raw.order_items.map((it: ThankYouOrderItem, index: number) => {
        const variantImage = it.variant?.images?.[0];
        const productImage = it.product?.images?.[0];
        const externalImage = it.external_image || it.externalImage || "";
        const image = extractImageUrl(
          variantImage || productImage || externalImage,
          backendBaseUrl,
        );

        let variantInfo =
          it.external_variant_info || it.externalVariantInfo || "";
        if (!variantInfo && it.variant?.attributes) {
          if (Array.isArray(it.variant.attributes)) {
            variantInfo = it.variant.attributes
              .map(
                (attr: {
                  label?: string;
                  name?: string;
                  type?: string;
                  key?: string;
                  value?: string;
                  val?: string;
                }) => {
                  const label =
                    attr.label || attr.name || attr.type || attr.key || "";
                  const value = attr.value || attr.val || "";
                  return label ? `${label}: ${value}` : value;
                },
              )
              .filter(Boolean)
              .join(", ");
          } else if (typeof it.variant.attributes === "object") {
            variantInfo = Object.entries(it.variant.attributes)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ");
          }
        }

        return {
          id: String(it.id || index),
          productId: it.product_id || undefined,
          variantId: it.variant_id || undefined,
          name: it.product_name || it.product?.name || "Unknown Product",
          quantity: Number(it.quantity || 1),
          price: Number(it.unit_price || 0),
          image,
          variantInfo,
          shippingFee: Number(it.item_shipping_fee || 0),
        };
      })
    : [];

  const itemShippingFees = items
    .map((item) => Number(item.shippingFee || 0))
    .filter((fee) => !Number.isNaN(fee) && fee > 0);

  const computedDeliveryFee = itemShippingFees.length
    ? Math.min(...itemShippingFees)
    : Number(raw.shipping_fee || 0);

  const computedSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const computedTotal =
    computedSubtotal - Number(raw.discount_amount || 0) + computedDeliveryFee;

  return {
    id: String(raw.id || defaultOrderId || 0),
    orderNo: String(raw.order_number || ""),
    invoiceNo: String(raw.invoice_number || ""),
    date: raw.created_at
      ? new Date(raw.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
    status: raw.status?.toLowerCase() === "pending" ? "pending" : "completed",
    deliveryFee: computedDeliveryFee,
    discountAmount: Number(raw.discount_amount || 0),
    totalAmountDue: computedTotal,
    customer: {
      name: raw.customer_name || "",
      phone: raw.customer_phone || "",
      address: raw.customer_address || "",
    },
    customerNote: raw.customer_note || raw.customerNote || "",
    items,
  } as Order;
};
