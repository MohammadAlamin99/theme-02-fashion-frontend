"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBlogs,
  getMainBanner,
  createBlog,
  updateBlog,
  deleteBlog,
  bulkDeleteBlogs,
} from "@/services-api/blogService";
import BlogListHeader from "./BlogListHeader";
import BannerSection from "./BannerSection";
import BlogTableSection from "./BlogTableSection";
import BlogForm from "./BlogForm";
import { Blog, BlogFormData } from "@/@types/blogpost.type";
import toast from "react-hot-toast";

export default function BlogManagement() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initial form state
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    content: "",
    youtube_link: "",
    meta_title: "",
    meta_tag: "",
    meta_description: "",
    featured_image: "",
    product_ids: [],
    status: "PUBLISHED",
    order: 0,
  });
  // Fetch blogs query
  const {
    data: blogListData,
    isLoading: isBlogsLoading,
    isFetching: isBlogsFetching,
  } = useQuery({
    queryKey: ["admin-blogs", currentPage],
    queryFn: () => getAdminBlogs(currentPage, 10),
  });

  // Fetch banner query
  const { data: bannerData, isLoading: isBannerLoading } = useQuery({
    queryKey: ["main-banner"],
    queryFn: getMainBanner,
  });

  // Create or Update mutation
  const createOrUpdateMutation = useMutation({
    mutationFn: (dto: BlogFormData) =>
      editingId ? updateBlog(editingId, dto) : createBlog(dto),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
        closeForm();
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  // Single delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  // --- BULK DELETE MUTATION ---
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteBlogs(ids),
    onSuccess: () => {
      // Refresh the blog list
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      // Clear the selected IDs after successful deletion
      setSelectedIds([]);
      toast.success("Selected items deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete selected items");
    },
  });

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content || "",
      youtube_link: blog.youtube_link || "",
      meta_title: blog.meta_title || "",
      meta_tag: blog.meta_tag || "",
      meta_description: blog.meta_description || "",
      featured_image: blog.featured_image || "",
      product_ids: blog.product_ids || [],
      status: blog.status || "PUBLISHED",
      order: blog.order || 0,
    });
    setShowCreateForm(true);
  };
  const closeForm = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      youtube_link: "",
      meta_title: "",
      meta_tag: "",
      meta_description: "",
      featured_image: "",
      product_ids: [],
      status: "PUBLISHED",
      order: 0,
    });
  };

  const handleSaveBlog = () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Title and Slug are required");
      return;
    }
    const payload: BlogFormData = {
      ...formData,
      order: Number(formData.order),
    };
    if (!payload.youtube_link || payload.youtube_link.trim() === "") {
      delete payload.youtube_link;
    }
    if (!payload.product_ids || payload.product_ids.length === 0) {
      delete payload.product_ids;
    }
    createOrUpdateMutation.mutate(payload);
  };

  if (showCreateForm) {
    return (
      <BlogForm
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        onClose={closeForm}
        isSaving={createOrUpdateMutation.isPending}
        onSave={handleSaveBlog}
      />
    );
  }

  return (
    <div className="bg-white pb-10">
      <BlogListHeader
        selectedCount={selectedIds.length}
        onCreateClick={() => setShowCreateForm(true)}
        onBulkDelete={() => {
          if (confirm(`Delete ${selectedIds.length} items?`)) {
            bulkDeleteMutation.mutate(selectedIds);
          }
        }}
      />
      <BannerSection bannerData={bannerData} isLoading={isBannerLoading} />

      <BlogTableSection
        blogs={blogListData?.data?.data || []}
        isLoading={isBlogsLoading}
        isFetching={isBlogsFetching}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={handleEdit}
        onDelete={(id: string) =>
          confirm("Delete this blog?") && deleteMutation.mutate(id)
        }
        currentPage={currentPage}
        totalPages={blogListData?.data?.meta?.totalPages || 1}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
