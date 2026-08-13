"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banner,
  createBanner,
  deleteBanner,
  getAdminBanners,
  updateBanner,
  uploadBulkBanners,
} from "@/services-api/bannerService";
import toast from "react-hot-toast";
import {
  EMPTY_FORM,
  getBannerKey,
  isBlobUrl,
  omitKey,
  resolveImgSrc,
  stripTempId,
} from "./Utils";
import { LocalBanner } from "./caurousel.typ";

export const useBannerManager = () => {
  const queryClient = useQueryClient();

  // -- Modal / editing state --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [editingTempId, setEditingTempId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Banner>(EMPTY_FORM);

  // -- Banner list & pending publish tracking --
  const [localBanners, setLocalBanners] = useState<LocalBanner[]>([]);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [pendingFilesMap, setPendingFilesMap] = useState<
    Record<string, File[]>
  >({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // -- Upload state (scoped to the currently open modal session) --
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // -- Delete confirmation --
  const [bannerPendingDelete, setBannerPendingDelete] =
    useState<LocalBanner | null>(null);

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const getImgSrc = (path?: string | null): string =>
    resolveImgSrc(path, backendBaseUrl);

  // -- Queries --
  const { data: serverResponse, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: getAdminBanners,
  });

  // Keep localBanners in sync with the server response as it changes,
  // without an extra render from useEffect.
  const [prevServerResponse, setPrevServerResponse] = useState<
    Banner[] | undefined
  >(undefined);
  if (serverResponse !== prevServerResponse) {
    setPrevServerResponse(serverResponse);
    if (serverResponse) {
      setLocalBanners(serverResponse);
    }
  }

  // -- Mutations --
  const uploadMutation = useMutation({ mutationFn: uploadBulkBanners });

  const saveMutation = useMutation({
    mutationFn: async (payload: Banner) => {
      if (payload.id) return updateBanner({ id: payload.id, data: payload });
      return createBanner(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  // -- Helpers --

  const revokeIfBlob = (url?: string) => {
    if (url && isBlobUrl(url)) {
      URL.revokeObjectURL(url);
    }
  };

  const resetModalState = () => {
    setFormData(EMPTY_FORM);
    setEditingBannerId(null);
    setEditingTempId(null);
    setSelectedFiles([]);
    setIsDragActive(false);
  };

  // -- Event handlers --

  const openModal = (banner?: LocalBanner) => {
    if (banner) {
      const key = getBannerKey(banner);
      setEditingBannerId(banner.id ?? null);
      setEditingTempId(banner._tempId ?? null);
      setFormData({
        image_url: banner.image_url ?? [],
        link_url: banner.link_url ?? "",
        meta_title: banner.meta_title ?? "",
        meta_tags: banner.meta_tags ?? "",
        meta_description: banner.meta_description ?? "",
        status: banner.status ?? "draft",
        position: banner.position ?? 1,
        id: banner.id,
      });
      setSelectedFiles(pendingFilesMap[key] ?? []);
    } else {
      resetModalState();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetModalState();
  };

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    setFormData((prev) => ({
      ...prev,
      image_url: [
        ...prev.image_url,
        ...files.map((file) => URL.createObjectURL(file)),
      ],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const removedUrl = prev.image_url[index];
      revokeIfBlob(removedUrl);

      // Keep selectedFiles in sync when a freshly-added local image is removed.
      if (removedUrl && isBlobUrl(removedUrl)) {
        setSelectedFiles((files) => {
          const blobIndexInFiles = prev.image_url
            .slice(0, index)
            .filter(isBlobUrl).length;
          return files.filter((_, i) => i !== blobIndexInFiles);
        });
      }

      return {
        ...prev,
        image_url: prev.image_url.filter((_, i) => i !== index),
      };
    });
  };

  const applyToPreview = () => {
    if (formData.image_url.length === 0) {
      toast.error("Add at least one image before continuing.");
      return;
    }
    if (!formData.meta_title.trim()) {
      toast.error("Meta title is required.");
      return;
    }

    const key = editingBannerId ?? editingTempId ?? crypto.randomUUID();
    const updatedBanner: LocalBanner = {
      ...formData,
      id: editingBannerId ?? undefined,
      _tempId: editingBannerId ? undefined : key,
    };

    setLocalBanners((prev) => {
      if (editingBannerId) {
        return prev.map((b) =>
          b.id === editingBannerId ? { ...updatedBanner } : b,
        );
      }
      if (editingTempId) {
        return prev.map((b) =>
          b._tempId === editingTempId ? { ...updatedBanner } : b,
        );
      }
      return [updatedBanner, ...prev];
    });

    setPendingFilesMap((prev) => ({ ...prev, [key]: selectedFiles }));
    setPendingKeys((prev) => new Set(prev).add(key));

    closeModal();
    toast.success("Preview updated. Publish to save it to the server.");
  };

  const publishBanner = async (banner: LocalBanner) => {
    const key = getBannerKey(banner);
    setSavingKey(key);

    const uploadPromise = (async () => {
      let finalUrls = banner.image_url.filter((url) => !isBlobUrl(url));
      const filesToUpload = pendingFilesMap[key] ?? [];

      if (filesToUpload.length > 0) {
        const uploaded = await uploadMutation.mutateAsync(filesToUpload);
        finalUrls = [...finalUrls, ...uploaded];
      }

      if (finalUrls.length === 0) {
        throw new Error("Banner must have at least one image");
      }

      const saved = await saveMutation.mutateAsync({
        ...stripTempId(banner),
        image_url: finalUrls,
        position: Number(banner.position) || 1,
      });

      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setPendingFilesMap((prev) => omitKey(prev, key));

      return saved;
    })();

    try {
      await toast.promise(uploadPromise, {
        loading: "Publishing banner...",
        success: "Banner published successfully!",
        error: (err) =>
          err instanceof Error ? err.message : "Failed to publish banner",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const requestDelete = (banner: LocalBanner) => {
    if (!banner.id) {
      // Never-saved local banner — just drop it from the list, no API call needed.
      setLocalBanners((prev) =>
        prev.filter((b) => getBannerKey(b) !== getBannerKey(banner)),
      );
      return;
    }
    setBannerPendingDelete(banner);
  };

  const confirmDelete = () => {
    const banner = bannerPendingDelete;
    if (!banner?.id) return;
    toast.promise(deleteMutation.mutateAsync(banner.id), {
      loading: "Removing banner...",
      success: "Banner deleted permanently",
      error: "Could not delete banner",
    });
    setBannerPendingDelete(null);
  };

  const cancelDelete = () => setBannerPendingDelete(null);

  const previewBanner = useMemo(
    () => localBanners.find((b) => Boolean(b.image_url?.[0])) ?? null,
    [localBanners],
  );

  return {
    isLoading,
    localBanners,
    pendingKeys,
    savingKey,
    getImgSrc,
    openModal,
    closeModal,
    requestDelete,
    publishBanner,
    previewBanner,
    isDeleting: deleteMutation.isPending,

    isModalOpen,
    formData,
    setFormData,
    isEditing: Boolean(editingBannerId || editingTempId),
    isDragActive,
    setIsDragActive,
    addFiles,
    removeImage,
    applyToPreview,

    bannerPendingDelete,
    confirmDelete,
    cancelDelete,
  };
};
