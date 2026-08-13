export interface BlogPost {
  id: number;
  title: string;
  date: string;
  image: string;
  slug: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  featured_image?: string;
  content?: string;
  youtube_link?: string;
  order?: number;
  meta_title?: string;
  meta_tag?: string;
  meta_description?: string;
  product_ids?: string[];
  created_at?: string;
  related_products?: {
    id?: string;
    _id?: string;
    name?: string;
    title?: string;
    images?: string[];
  }[];
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  youtube_link?: string;
  meta_title: string;
  meta_tag: string;
  meta_description: string;
  featured_image: string;
  product_ids?: string[];
  status?: "DRAFT" | "PUBLISHED";
  order?: number;
}

export interface BlogResponse {
  data: {
    data: Blog[];
  };
  meta: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
}

export interface BannerResponse {
  data: {
    image_url: string;
  };
}
