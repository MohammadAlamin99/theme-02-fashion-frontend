import { apiFetch } from "@/utils/api";

const getLocalMohasagorWishlist = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("mohasagor_wishlist_items");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalMohasagorWishlist = (items: any[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mohasagor_wishlist_items", JSON.stringify(items));
  } catch {}
};

// get wishlist
export const getWishlist = async () => {
  let serverItems: any[] = [];
  try {
    const response = await apiFetch(`wishlist`, {
      method: "GET",
    });
    if (response.ok) {
      const result = await response.json();
      serverItems = result.data || [];
    }
  } catch (error) {
    console.error("Fetch Error (getWishlist):", error);
  }

  const localItems = getLocalMohasagorWishlist();
  if (localItems.length > 0) {
    return [...serverItems, ...localItems];
  }
  return serverItems;
};

// wishlist create
export const createWishlist = async (productId: string) => {
  if (productId.startsWith("mohasagor-")) {
    const localItems = getLocalMohasagorWishlist();
    if (!localItems.some((i) => i.productId === productId || i.id === productId)) {
      localItems.push({
        id: productId,
        productId: productId,
        created_at: new Date().toISOString(),
      });
      saveLocalMohasagorWishlist(localItems);
    }
    return { success: true, message: "Added to wishlist" };
  }

  try {
    const response = await apiFetch(`wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
      }),
    });

    if (response.status === 401) {
      throw new Error("Please log in to add items to wishlist");
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        result.message || `Error: ${response.status} - ${response.statusText}`,
      );
    }
    return result.data || result;
  } catch (error) {
    console.error(
      "Fetch Error (createWishlist):",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

// delete wishlist
export const deleteWishlist = async (productId: string) => {
  if (productId.startsWith("mohasagor-")) {
    const localItems = getLocalMohasagorWishlist();
    const filtered = localItems.filter(
      (i) => i.productId !== productId && i.id !== productId,
    );
    saveLocalMohasagorWishlist(filtered);
    return { success: true, message: "Removed from wishlist" };
  }

  try {
    const response = await apiFetch(`wishlist/${productId}`, {
      method: "DELETE",
    });
    if (response.status === 401) {
      throw new Error("Please log in to remove items from wishlist");
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || `Error: ${response.status}`);
    }
    return result.data || result;
  } catch (error) {
    console.error(
      "Fetch Error (deleteWishlist):",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};
