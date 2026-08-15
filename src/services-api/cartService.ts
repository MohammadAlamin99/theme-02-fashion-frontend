import { apiFetch } from "@/utils/api";
import { CartItem } from "@/@types/order.type";

// create cart
export const createCart = async (
  productId: string,
  quantity: number,
  variantId?: string | null,
  guestId?: string | null,
) => {
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

  return {
    items: serverItems,
    sub_total: serverSubTotal,
  };
};

// delete cart item
export const deleteCartItem = async (cartItemId: string) => {
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
