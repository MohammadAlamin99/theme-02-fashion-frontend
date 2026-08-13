"use client";

import { create } from "zustand";

interface Variant {
  attribute: string;
  stock: number;
  sku: string;
  price: number;
  images: string[];
}

interface ProductFormState {
  formData: {
    name: string;
    slug: string;
    category_id: string;
    brand_id: string;
    short_description: string;
    description: string;
    regular_price: number;
    sell_price: number;
    cost_price: number;
    quantity: number;
    unit_name: string;
    warranty: string;
    sku: string;
    barcode: string;
    priority: number;
    is_variant_mandatory: boolean;
    images: string[];
    tag_ids: string[];
    variants: Variant[];
  };
  updateField: (field: string, value: any) => void;
  resetForm: () => void;
}

export const useProductFormStore = create<ProductFormState>((set) => ({
  formData: {
    name: "",
    slug: "",
    category_id: "",
    brand_id: "",
    short_description: "",
    description: "",
    regular_price: 0,
    sell_price: 0,
    cost_price: 0,
    quantity: 50,
    unit_name: "Pcs",
    warranty: "",
    sku: "",
    barcode: "",
    priority: 100,
    is_variant_mandatory: false,
    images: [],
    tag_ids: [],
    variants: [],
  },
  updateField: (field, value) =>
    set((state) => ({ formData: { ...state.formData, [field]: value } })),
  resetForm: () =>
    set({
      formData: {
        name: "",
        slug: "",
        category_id: "",
        brand_id: "",
        short_description: "",
        description: "",
        regular_price: 0,
        sell_price: 0,
        cost_price: 0,
        quantity: 50,
        unit_name: "Pcs",
        warranty: "",
        sku: "",
        barcode: "",
        priority: 100,
        is_variant_mandatory: false,
        images: [],
        tag_ids: [],
        variants: [],
      },
    }),
}));