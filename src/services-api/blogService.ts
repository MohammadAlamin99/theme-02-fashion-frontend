import { apiFetch } from "@/utils/api";
import { BlogResponse } from "@/@types/blog.type";
import { BlogFormData } from "@/@types/blogpost.type";

export const getBlogs = async (page = 1, limit = 4): Promise<BlogResponse> => {
  const res = await apiFetch(`/blogs?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return res.json();
};

// admin dashboad data
// get main banner
export const getMainBanner = async () => {
  const res = await apiFetch(`/blogs/main-banner`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch banner");
  return res.json();
};

// upload banner api
export const uploadMainBanner = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiFetch(`/blogs/upload-banner`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload banner");
  return res.json();
};

// 1. Fetch Admin Blogs (Matches your Postman GET)
export const getAdminBlogs = async (page = 1, limit = 10) => {
  const res = await apiFetch(`/blogs/admin-list?page=${page}&limit=${limit}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
};

// 2. Upload Image for specific blog (Returns image_url)
export const uploadBlogImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiFetch(`/blogs/upload-image`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

// 3. Create Blog (Matches your Postman POST)
export const createBlog = async (dto: BlogFormData) => {
  const res = await apiFetch(`/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return res.json();
};

export const updateBlog = async (id: string, dto: BlogFormData) => {
  const res = await apiFetch(`/blogs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return res.json();
};

export const deleteBlog = async (id: string) => {
  const res = await apiFetch(`/blogs/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

export const bulkDeleteBlogs = async (ids: string[]) => {
  const res = await apiFetch(`/blogs/bulk-delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return res.json();
};

// Fetch a single blog post by slug
export const getBlogBySlug = async (slug: string) => {
  const res = await apiFetch(`/blogs/post/${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch the blog post");
  }

  return res.json();
};
