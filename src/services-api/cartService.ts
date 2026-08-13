import { apiFetch } from "@/utils/api";
import { getMohasagorProductBySlug } from "./mohasagorService";
import { CartItem } from "@/@types/order.type";

const getLocalMohasagorItems = (): {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantInfo: { label: string; value: string; type?: string }[];
}[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("mohasagor_cart_items");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalMohasagorItems = (
  items: {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variantInfo: { label: string; value: string; type?: string }[];
  }[],
) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mohasagor_cart_items", JSON.stringify(items));
  } catch {}
};

// create cart
export const createCart = async (
  productId: string,
  quantity: number,
  variantId?: string | null,
  guestId?: string | null,
) => {
  if (productId.startsWith("mohasagor-")) {
    const localItems = getLocalMohasagorItems();
    const productObj = (await getMohasagorProductBySlug(productId)) ?? {
      id: productId,
      name: "Mohasagor Product",
      sell_price: "0",
      regular_price: "0",
      images: ["/images/placeholder.svg"],
      variants: [],
    };

    const safeName = productObj.name || "Mohasagor Product";
    const safePrice = Number(productObj.sell_price) || 0;
    const safeImage =
      Array.isArray(productObj.images) && productObj.images.length > 0
        ? productObj.images[0]
        : "/images/placeholder.svg";

    const matchingVariant =
      variantId && Array.isArray(productObj.variants)
        ? productObj.variants.find(
            (variant: { id: string }) =>
              String(variant.id) === String(variantId),
          )
        : null;

    const variantImage = matchingVariant?.images?.[0];
    const itemImage = variantImage || safeImage;

    const variantInfo = Array.isArray(matchingVariant?.attributes)
      ? matchingVariant.attributes.map(
          (attr: {
            label?: string;
            name?: string;
            type?: string;
            key?: string;
            value?: string;
            val?: string;
          }) => ({
            label:
              attr.label || attr.name || attr.type || attr.key || "Variant",
            value: attr.value || attr.val || attr.name || "",
            type: attr.type || undefined,
          }),
        )
      : [];

    const newItemId = variantId ? `${productId}:${variantId}` : productId;

    const existingIndex = localItems.findIndex(
      (i) =>
        i.productId === productId &&
        String(i.variantId || "") === String(variantId || ""),
    );

    if (existingIndex > -1) {
      localItems[existingIndex].quantity += quantity;
      localItems[existingIndex].image = itemImage;
      localItems[existingIndex].variantId = variantId || undefined;
      localItems[existingIndex].variantInfo = variantInfo;
      localItems[existingIndex].variant = matchingVariant || undefined;
    } else {
      localItems.push({
        id: newItemId,
        productId,
        variantId: variantId || undefined,
        name: safeName,
        price: safePrice,
        image: itemImage,
        quantity,
        variantInfo,
        product: productObj,
        variant: matchingVariant
          ? {
              id: matchingVariant.id,
              images: matchingVariant.images,
            }
          : undefined,
      });
    }

    saveLocalMohasagorItems(localItems);
    return { success: true, message: "Added to cart" };
  }

  const response = await apiFetch(`cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId,
      variantId: variantId || undefined,
      quantity,
      guestId: guestId || undefined,
    }),
  });

  if (!response.ok) throw new Error("Failed to add item to cart");
  return await response.json();
};

// cart merge
export const mergeCart = async (guestId: string) => {
  const response = await apiFetch(`cart/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guestId }),
  });
  if (!response.ok) throw new Error("Failed to merge cart");
  return await response.json();
};

// update cart
export const updateCartItem = async (cartItemId: string, quantity: number) => {
  if (cartItemId.startsWith("mohasagor-")) {
    const items = getLocalMohasagorItems();
    const idx = items.findIndex(
      (i) =>
        i.id === cartItemId ||
        i.productId === cartItemId ||
        `${i.productId}:${i.variantId || ""}` === cartItemId,
    );
    if (idx > -1) {
      items[idx].quantity = quantity;
      saveLocalMohasagorItems(items);
    }
    return { success: true };
  }

  const response = await apiFetch(`cart/update/${cartItemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error("Failed to update cart");
  return await response.json();
};

// fetch cart
export const fetchCart = async (guestId?: string | null) => {
  const url = guestId ? `cart?guestId=${guestId}` : `cart`;
  let serverItems: CartItem[] = [];
  let serverSubTotal = 0;

  try {
    const response = await apiFetch(url, {
      method: "GET",
    });
    if (response.ok) {
      const result = await response.json();
      const cartData = result.data || result;
      serverItems = Array.isArray(cartData?.items) ? cartData.items : [];
      serverSubTotal = Number(cartData?.sub_total || 0);
    }
  } catch (err) {
    console.error("Server cart fetch error:", err);
  }

  const localMohasagorItems = getLocalMohasagorItems();
  if (localMohasagorItems.length > 0) {
    const combinedItems = [...serverItems, ...localMohasagorItems];
    const mohasagorSubTotal = localMohasagorItems.reduce(
      (sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );
    return {
      items: combinedItems,
      sub_total: serverSubTotal + mohasagorSubTotal,
    };
  }

  return {
    items: serverItems,
    sub_total: serverSubTotal,
  };
};

// delete cart item
export const deleteCartItem = async (cartItemId: string) => {
  if (cartItemId.startsWith("mohasagor-")) {
    const items = getLocalMohasagorItems();
    const filtered = items.filter(
      (i) =>
        i.id !== cartItemId &&
        i.productId !== cartItemId &&
        `${i.productId}:${i.variantId || ""}` !== cartItemId,
    );
    saveLocalMohasagorItems(filtered);
    return { success: true };
  }

  const response = await apiFetch(`cart/remove/${cartItemId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to remove item from cart");
  return await response.json();
};

// clear all cart items
export const clearCart = async (guestId?: string | null) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mohasagor_cart_items");
  }
  const url = guestId ? `cart/clear?guestId=${guestId}` : `cart/clear`;
  try {
    const response = await apiFetch(url, {
      method: "DELETE",
    });
    if (!response.ok) return { success: true };
    return await response.json();
  } catch {
    return { success: true };
  }
};
