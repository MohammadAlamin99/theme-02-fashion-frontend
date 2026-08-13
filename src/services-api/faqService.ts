import { apiFetch } from "@/utils/api";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  priority: number;
  status: "active" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  status: "active" | "draft";
  priority?: number;
}

export interface FaqResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Faq[];
}

// 1. Fetch all FAQs (GET /faqs)

export const getFaqs = async (): Promise<FaqResponse> => {
  const res = await apiFetch("/faqs", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Optional: Revalidate cache every hour
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch FAQs");
  }

  return res.json();
};

// admin all faqs
export const getFaqsAdmin = async (): Promise<FaqResponse> => {
  const res = await apiFetch("/faqs/admin/all", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch FAQs");
  }

  return res.json();
};
// 2. Create a new FAQ (POST /faqs)
export const createFaq = async (
  data: Omit<FAQ, "id" | "createdAt" | "updatedAt">,
): Promise<boolean> => {
  try {
    const res = await apiFetch("/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res.ok;
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return false;
  }
};

// 3. Update an FAQ (PATCH /faqs/:id)
export const updateFaq = async (
  id: string,
  data: Partial<FAQ>,
): Promise<boolean> => {
  try {
    const res = await apiFetch(`/faqs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res.ok;
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return false;
  }
};

// 4. Delete an FAQ (DELETE /faqs/:id)
export const deleteFaq = async (id: string): Promise<boolean> => {
  try {
    const res = await apiFetch(`/faqs/${id}`, {
      method: "DELETE",
    });

    return res.ok;
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return false;
  }
};
