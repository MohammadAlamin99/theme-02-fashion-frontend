export interface CategoryCount {
  products: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  _count?: CategoryCount;
  image_url?: string | null;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface Brand {
  id: string;
  name: string;
  _count?: CategoryCount;
}
