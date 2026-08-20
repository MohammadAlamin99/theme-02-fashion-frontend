export interface CampaignDiscount {
  discount_value: number | string;
  campaign_name?: string;
  campaign_id?: string;
  is_free_delivery?: boolean;
}

export interface CampaignProductRef {
  id?: string;
  product_id?: string;
  slug?: string;
  product?: {
    id?: string;
    slug?: string;
  };
}

export interface Campaign {
  id?: string;
  name?: string;
  discount_value?: number | string;
  is_free_delivery?: boolean;
  products?: CampaignProductRef[];
  campaign_products?: CampaignProductRef[];
}

export interface ProductInput {
  id?: string;
  productId?: string;
  slug?: string;
  sell_price?: number | string;
  price?: number | string;
  campaign_discount?: CampaignDiscount | null;
  final_price?: number | string | null;
}

export interface CampaignDiscountResult {
  discountValue: number;
  finalPrice: number;
  campaignName: string;
  campaignDiscount: CampaignDiscount | null;
}

export function getProductCampaignInfo(
  productOrId: ProductInput | string,
  sellPriceArg?: number | string,
  activeCampaigns: Campaign[] = [],
): CampaignDiscountResult {
  let productId = "";
  let slug = "";
  let sellPrice = 0;
  let existingCampaignDiscount: CampaignDiscount | null = null;
  let existingFinalPrice: number | null = null;

  if (typeof productOrId === "string") {
    productId = productOrId;
    sellPrice = Number(sellPriceArg || 0);
  } else if (productOrId) {
    productId = productOrId.id || productOrId.productId || "";
    slug = productOrId.slug || "";
    sellPrice = Number(
      productOrId.sell_price || productOrId.price || sellPriceArg || 0,
    );
    existingCampaignDiscount = productOrId.campaign_discount || null;
    if (
      productOrId.final_price !== undefined &&
      productOrId.final_price !== null
    ) {
      existingFinalPrice = Number(productOrId.final_price);
    }
  }

  // 1. If explicit campaign_discount is already attached:
  if (existingCampaignDiscount) {
    const discVal = Number(existingCampaignDiscount.discount_value) || 0;
    if (discVal > 0 && sellPrice > 0) {
      const finalPrice =
        existingFinalPrice ?? Math.round(sellPrice * (1 - discVal / 100));
      return {
        discountValue: discVal,
        finalPrice,
        campaignName: existingCampaignDiscount.campaign_name || "",
        campaignDiscount: existingCampaignDiscount,
      };
    }
  }

  // 2. Otherwise search inside activeCampaigns list:
  if (activeCampaigns && activeCampaigns.length > 0 && (productId || slug)) {
    for (const camp of activeCampaigns) {
      const discVal = Number(camp.discount_value) || 0;
      if (discVal <= 0) continue;

      const prods = camp.products || camp.campaign_products || [];
      const isMatch = prods.some((p) => {
        const pObj = p?.product || p;
        const pId = p?.product_id || pObj?.id || p?.id;
        const pSlug = pObj?.slug || p?.slug;
        return (
          (productId && pId && String(pId) === String(productId)) ||
          (slug && pSlug && String(pSlug) === String(slug))
        );
      });

      if (isMatch && sellPrice > 0) {
        const finalPrice = Math.round(sellPrice * (1 - discVal / 100));
        return {
          discountValue: discVal,
          finalPrice,
          campaignName: camp.name || "",
          campaignDiscount: {
            discount_value: discVal,
            campaign_name: camp.name || "",
            campaign_id: camp.id,
            is_free_delivery: camp.is_free_delivery,
          },
        };
      }
    }
  }

  return {
    discountValue: 0,
    finalPrice: sellPrice,
    campaignName: "",
    campaignDiscount: null,
  };
}
