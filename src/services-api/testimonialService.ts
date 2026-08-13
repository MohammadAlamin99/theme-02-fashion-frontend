import { apiFetch } from "@/utils/api";

// --- TYPES ---
export type TestimonialType = "FACEBOOK" | "YOUTUBE";

export interface Testimonial {
  id: string;
  type: TestimonialType;
  author_name: string;
  author_avatar: string | null;
  content: string;
  rating: number;
  video_url: string | null;
  thumbnail: string | null;
  status: string;
  created_at: string;
}

export interface TestimonialResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Testimonial[];
  timestamp: string;
}

/**
 * Fetch testimonials filtered by type
 */
export const getTestimonials = async (
  type?: TestimonialType,
): Promise<TestimonialResponse> => {
  const url = type ? `/testimonials?type=${type}` : "/testimonials";
  const res = await apiFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${type || ""} testimonials`);
  }

  return res.json();
};
