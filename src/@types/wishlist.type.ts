export interface WishlistProduct {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  sell_price: string;
  regular_price: string;
}