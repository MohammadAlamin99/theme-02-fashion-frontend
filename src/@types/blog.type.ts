export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface BlogResponse {
  success: boolean;
  statusCode: number;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: BlogPost[];
  };
}
