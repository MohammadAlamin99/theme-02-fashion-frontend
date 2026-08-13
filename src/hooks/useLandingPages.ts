import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  saveLandingPage, 
  fetchLandingPageBySlug, 
  fetchLandingPageByProductId,
  fetchAllProductsForLP // 🚀 Fixed name mismatch
} from "@/services-api/landingPageService";
import { CreateLandingPageDto } from "../@types/landing-page";

/**
 * 🚀 Hook to fetch all products for the Landing Page dropdown
 * Use this to populate the Search/Select product field in the editor.
 */
export function useAllProductsForLP() {
  return useQuery({
    queryKey: ["products-dropdown-list"],
    queryFn: () => fetchAllProductsForLP(),
  });
}

/**
 * 🚀 Hook to save (create or update) a landing page
 * Automatically invalidates the cache so the editor shows fresh data after saving.
 */
export function useSaveLandingPageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLandingPageDto) => saveLandingPage(payload),
    onSuccess: (data, variables) => {
      // Invalidate the specific admin query for this product ID
      queryClient.invalidateQueries({ 
        queryKey: ['admin-landing-page', variables.productId] 
      });
      // Also invalidate the list if you have a table view somewhere
      queryClient.invalidateQueries({ queryKey: ["products-dropdown-list"] });
    },
  });
}

/**
 * 🚀 Hook to fetch a landing page by Product ID for Admin Editor
 * Returns the existing configuration if it exists in the DB.
 */
export function useAdminLandingPage(productId: string | null) {
  return useQuery({
    queryKey: ['admin-landing-page', productId],
    queryFn: () => fetchLandingPageByProductId(productId!), // ! is safe because of 'enabled'
    enabled: !!productId, // Only runs the query when a product is actually selected
    retry: false,
    refetchOnWindowFocus: false, // Prevents form resetting if user tabs out and back
  });
}

/**
 * 🚀 Hook to fetch a landing page by slug for Public Storefront
 * Used by the customer-facing template.
 */
export function useLandingPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['landing-page', slug],
    queryFn: () => fetchLandingPageBySlug(slug),
    enabled: !!slug, // Only run if slug exists
    retry: false,
  });
}