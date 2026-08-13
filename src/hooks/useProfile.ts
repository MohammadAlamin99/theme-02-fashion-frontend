import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import { getAdminTokenAction } from "@/app/actions/auth";

/* ==========================================================================

CUSTOMER STOREFRONT HOOKS (Keep completely intact)

========================================================================== */

export function useProfileData() {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  return useQuery({
    queryKey: ["profile"],

    queryFn: async () => {
      const res = await apiFetch("/users/profile", {
        method: "GET",

        headers: {
          // 🚀 Explicit flag identifying this request belongs to the storefront customer

          "X-Customer-Request": "true",
        },
      });

      if (res.status === 401 || res.status === 403) {
        setAuthUser(null);

        return null;
      }

      if (!res.ok) throw new Error("Failed to load profile details.");

      const rawData = await res.json();

      const data = rawData?.data || rawData;

      if (data) {
        setAuthUser({
          id: data.id || data._id,

          name: data.name || "",

          email: data.email || "",

          phone: data.phone || "",

          role: data.role,

          avatar: data.avatar || null,

          permissions: [],
        });
      }

      return data;
    },

    retry: false,
  });
}

// 🚀 1. Inside useUpdateCustomerAvatarMutation:

export function useUpdateCustomerAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("image", file); // 🚀 FIXED: Changed from "avatar" to "image"

      const res = await apiFetch("/users/avatar", {
        method: "PATCH",

        headers: { "X-Customer-Request": "true" },

        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to update avatar.");

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// 🚀 2. Inside useAdminUpdateAvatarMutation:

export function useAdminUpdateAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const adminToken = await getAdminTokenAction();

      const formData = new FormData();

      formData.append("image", file); // 🚀 FIXED: Changed from "avatar" to "image"

      const res = await apiFetch("/users/avatar", {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${adminToken || ""}`,

          "X-Admin-Request": "true",
        },

        body: formData,
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.message || "Failed to update admin avatar.");

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;

      email?: string;

      primaryAddress?: string;
    }) => {
      const res = await apiFetch("/users/profile", {
        method: "PUT",

        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to sync changes.");

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useAddAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: string) => {
      const res = await apiFetch("/users/addresses", {
        method: "POST",

        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.message || "Failed to append address.");

      return data?.data || data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/* ==========================================================================

🚀 REFACTORED ADMIN HOOKS (Safe extraction via Server Engine context)

========================================================================== */

export function useAdminProfileData() {
  const setAdminUser = useAuthStore((state) => state.setAdminUser);

  return useQuery({
    queryKey: ["admin-profile"], // 🚀 FIX: Changed "adminProfile" to "admin-profile"

    queryFn: async () => {
      const adminToken = await getAdminTokenAction();

      const res = await apiFetch("/users/profile", {
        method: "GET",

        headers: {
          Authorization: `Bearer ${adminToken || ""}`,

          "X-Admin-Request": "true",
        },
      });

      if (res.status === 401 || res.status === 403) {
        setAdminUser(null);

        return null;
      }

      const data = await res.json();

      const user = data?.data || data;

      if (user) {
        setAdminUser({
          id: user.id || user._id,

          name: user.name || "",

          email: user.email || "",

          phone: user.phone || "",

          role: user.role, // 🚀 Backend sends "MANAGER" or "ADMIN"

          avatar: user.avatar || null,

          permissions: user.permissions || [],
        });
      }

      return user;
    },

    retry: false,
  });
}

export function useAdminUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email?: string;
      primaryAddress?: string;
    }) => {
      const adminToken = await getAdminTokenAction();
      const res = await apiFetch("/users/profile", {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${adminToken || ""}`,

          "Content-Type": "application/json",

          "X-Admin-Request": "true",
        },

        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data?.message || "Failed to save administrative updates.",
        );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
    },
  });
}
