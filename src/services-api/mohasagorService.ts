import { Product } from "@/@types/product.type";
import { FilterProductsResponse } from "./productService";

const MOHASAGOR_API_KEY = "xrGuaYn8ZPZZ8oMZ";
const MOHASAGOR_SECRET_KEY =
  "11ae6a994890d3d27d0e605130f383128fcfae4f991fe2ef0f7dd747d901dc02";

interface RawMohasagorVariantAttribute {
  type?: string;
  label?: string;
  value?: string;
  val?: string;
  name?: string;
  hex?: string;
  key?: string;
  attributeName?: string;
  attributeValue?: string;
}

interface RawMohasagorVariant {
  id?: number | string;
  color?: string;
  size?: string;
  variant?: string;
  name?: string;
  value?: string;
  image?: string;
  stock?: number | string;
  qty?: number | string;
  sku?: string | number;
  price?: number | string;
  sale_price?: number | string;
  attributes?:
    | string
    | RawMohasagorVariantAttribute[]
    | Record<string, unknown>;
}

interface RawMohasagorProduct {
  id: number | string;
  name: string;
  product_code?: number | string;
  category?: string;
  thumbnail_img?: string;
  slug?: string;
  price?: number;
  sale_price?: number;
  details?: string;
  product_images?: Array<{
    id: number;
    product_id: number;
    product_image: string;
  }>;
  product_variants?: RawMohasagorVariant[];
  variants?: RawMohasagorVariant[];
}

const normalizeAttributeLabel = (label: string, type?: string): string => {
  const source = (type && type.trim()) || label || "";
  const normalized = source.trim().toLowerCase();

  const knownLabels: Record<string, string> = {
    color: "Color",
    colour: "Color",
    size: "Size",
    variant: "Variant",
    material: "Material",
    style: "Style",
    capacity: "Capacity",
    weight: "Weight",
    model: "Model",
  };

  if (knownLabels[normalized]) return knownLabels[normalized];

  if (!source) return "Attribute";

  return source
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const mapRawProduct = (item: RawMohasagorProduct): Product => {
  const regularPrice = item.price
    ? String(item.price)
    : String(item.sale_price || 0);
  const sellPrice = item.sale_price
    ? String(item.sale_price)
    : String(item.price || 0);
  const priceNum = Number(sellPrice) || Number(regularPrice) || 0;

  let images: string[] = [];
  if (Array.isArray(item.product_images) && item.product_images.length > 0) {
    images = item.product_images
      .map((img) => img.product_image)
      .filter(Boolean);
  }
  if (images.length === 0 && item.thumbnail_img) {
    images = [item.thumbnail_img];
  }
  if (images.length === 0) {
    images = ["/images/placeholder.svg"];
  }

  const rawVariants = item.product_variants || item.variants || [];
  const mappedVariants = Array.isArray(rawVariants)
    ? rawVariants.map((v: RawMohasagorVariant, index: number) => {
        const attrs: {
          type: string;
          label: string;
          value: string;
          hex?: string;
        }[] = [];

        const parseRawAttributes = (
          rawAttrs:
            | RawMohasagorVariantAttribute[]
            | Record<string, unknown>
            | string,
        ) => {
          if (!rawAttrs) return;
          if (typeof rawAttrs === "string") {
            try {
              const parsed = JSON.parse(rawAttrs);
              if (Array.isArray(parsed)) {
                parsed.forEach((item) => {
                  if (item && typeof item === "object") {
                    const parsedItem = item as RawMohasagorVariantAttribute;
                    const label =
                      parsedItem.label ||
                      parsedItem.name ||
                      parsedItem.type ||
                      parsedItem.key ||
                      parsedItem.attributeName;
                    const value =
                      parsedItem.value ||
                      parsedItem.val ||
                      parsedItem.attributeValue ||
                      parsedItem.name;
                    const hex = parsedItem.hex;
                    if (label && value) {
                      attrs.push({
                        label: normalizeAttributeLabel(
                          String(label),
                          String(parsedItem.type || ""),
                        ),
                        value: String(value),
                        type: normalizeAttributeLabel(
                          String(parsedItem.type || ""),
                          String(parsedItem.type || ""),
                        ),
                        hex: hex ? String(hex) : undefined,
                      });
                    }
                  }
                });
              }
            } catch {
              return;
            }
          } else if (Array.isArray(rawAttrs)) {
            rawAttrs.forEach((item) => {
              if (!item) return;
              const label =
                item.label ||
                item.name ||
                item.type ||
                item.key ||
                item.attributeName;
              const value =
                item.value || item.val || item.attributeValue || item.name;
              if (label && value) {
                attrs.push({
                  label: normalizeAttributeLabel(
                    String(label),
                    String(item.type || ""),
                  ),
                  value: String(value),
                  type: normalizeAttributeLabel(
                    String(item.type || ""),
                    String(item.type || ""),
                  ),
                  hex: item.hex ? String(item.hex) : undefined,
                });
              }
            });
          } else if (typeof rawAttrs === "object") {
            Object.entries(rawAttrs).forEach(([key, val]) => {
              if (!key || val == null) return;
              if (typeof val === "object" && !Array.isArray(val)) {
                const nested = val as RawMohasagorVariantAttribute;
                const value = nested.value || nested.val || nested.name;
                if (value) {
                  attrs.push({
                    label: normalizeAttributeLabel(key, nested.type || ""),
                    value: String(value),
                    type: normalizeAttributeLabel(
                      nested.type || key,
                      nested.type || "",
                    ),
                    hex: nested.hex ? String(nested.hex) : undefined,
                  });
                }
              } else {
                attrs.push({
                  label: normalizeAttributeLabel(key),
                  value: String(val),
                  type: normalizeAttributeLabel(key),
                });
              }
            });
          }
        };

        if (v.attributes) {
          parseRawAttributes(v.attributes);
        }

        if (attrs.length === 0) {
          if (v.color)
            attrs.push({
              type: "Color",
              label: "Color",
              value: String(v.color),
            });
          if (v.size)
            attrs.push({ type: "Size", label: "Size", value: String(v.size) });
          if (v.variant)
            attrs.push({
              type: "Variant",
              label: "Variant",
              value: String(v.variant),
            });
          if (v.name && v.name !== v.color && v.name !== v.size) {
            attrs.push({
              type: "Variant",
              label: "Variant",
              value: String(v.name),
            });
          }
          if (v.value && v.value !== v.color && v.value !== v.size) {
            attrs.push({
              type: "Variant",
              label: "Variant",
              value: String(v.value),
            });
          }
        }

        return {
          id: String(v.id || index),
          product_id: `mohasagor-${item.id}`,
          images: v.image ? [v.image] : images,
          attributes: attrs,
          stock: Number(v.stock || v.qty || 50),
          sku: String(v.sku || item.product_code || item.id),
          price: String(v.price || v.sale_price || sellPrice),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      })
    : [];

  return {
    id: `mohasagor-${item.id}`,
    name: item.name,
    slug: `mohasagor-${item.id}`,
    images,
    video_urls: null,
    regular_price: regularPrice,
    sell_price: sellPrice,
    price: priceNum,
    quantity: 50,
    short_description: item.category || "Gadgets & Electronics",
    description: item.details || item.name,
    brand: { id: "mohasagor", name: "Mohasagor", logo_url: "" },
    suppliers: [{ id: "mohasagor", name: "Mohasagor", image_url: "" }],
    sku: item.product_code ? String(item.product_code) : String(item.id),
    unit_name: "Pcs",
    warranty: "Authentic Product",
    avg_rating: 5,
    total_reviews: 1,
    specifications: null,
    faqs: null,
    shipping_config: [],
    variants: mappedVariants,
    product_tags: [],
    view_count: 150,
    total_sold: 45,
  };
};

/**
 * Client-side: uses the Next.js proxy route (/api/mohasagor/products) to avoid CORS.
 * Used on the suppliers page (always runs in browser).
 */
export const fetchMohasagorProducts = async (
  page = 1,
): Promise<FilterProductsResponse> => {
  const res = await fetch(`/api/mohasagor/products?page=${page}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch products from Mohasagor API");

  const json = await res.json();
  const rawList: RawMohasagorProduct[] = Array.isArray(json?.products)
    ? json.products
    : [];

  return {
    data: rawList.map(mapRawProduct),
    pagination: {
      current_page: json?.current_page || page,
      total_pages: json?.last_page || 1,
      total_items: json?.total || rawList.length,
      limit: json?.per_page || 200,
    },
  };
};

/**
 * Fetches a page directly from Mohasagor API.
 * Works both server-side (absolute URL) and client-side.
 */
const fetchMohasagorPageDirect = async (page: number) => {
  const res = await fetch(
    `https://mohasagor.com.bd/api/reseller/product?page=${page}`,
    {
      headers: {
        "api-key": MOHASAGOR_API_KEY,
        "secret-key": MOHASAGOR_SECRET_KEY,
      },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`Mohasagor API error on page ${page}`);
  return res.json();
};

/**
 * Find a single Mohasagor product by its slug (mohasagor-{numericId}).
 * Works server-side and client-side by calling Mohasagor API directly.
 */
export const getMohasagorProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  try {
    const rawId = slug.replace(/^mohasagor-/, "");
    const numericId = Number(rawId);

    // Fetch client proxy first if in browser, or direct API
    const fetchPage =
      typeof window !== "undefined"
        ? (page: number) =>
            fetchMohasagorProducts(page).then((res) => ({
              products: res.data,
              last_page: res.pagination.total_pages,
            }))
        : (page: number) => fetchMohasagorPageDirect(page);

    const firstPageJson = await fetchPage(1);
    const rawList1 = firstPageJson?.products || [];

    const getRawField = (p: unknown, key: string): unknown => {
      if (typeof p !== "object" || p === null) return undefined;
      return (p as Record<string, unknown>)[key];
    };

    const isProductWithImages = (p: unknown): p is Product =>
      typeof p === "object" && p !== null && "images" in p;

    const matchesProduct = (p: unknown): boolean => {
      const id = getRawField(p, "id");
      const slugField = getRawField(p, "slug");
      return (
        (numericId && Number(id) === numericId) ||
        id === slug ||
        id === `mohasagor-${rawId}` ||
        slugField === rawId ||
        slugField === slug
      );
    };

    const found1 = rawList1.find(matchesProduct);
    if (found1)
      return isProductWithImages(found1)
        ? found1
        : mapRawProduct(found1 as RawMohasagorProduct);

    const totalPages: number = firstPageJson?.last_page || 1;
    if (totalPages <= 1) return null;

    // Search max 10 pages in parallel
    const maxPagesToSearch = Math.min(totalPages, 10);
    const pageNums = Array.from(
      { length: maxPagesToSearch - 1 },
      (_, i) => i + 2,
    );
    const pageResults = await Promise.all(
      pageNums.map((page) => fetchPage(page).catch(() => null)),
    );

    for (const pageJson of pageResults) {
      if (!pageJson) continue;
      const rawList = pageJson?.products || [];
      const match = rawList.find(matchesProduct);
      if (match)
        return isProductWithImages(match)
          ? match
          : mapRawProduct(match as RawMohasagorProduct);
    }
    return null;
  } catch (error) {
    console.error("Error finding Mohasagor product by slug:", error);
    return null;
  }
};
