"use client";

import { Loader2, PlusCircle } from "lucide-react";
import { BannerCard } from "./Bannercard";
import { EmptyState } from "./Emptystate";
import { LivePreviewPhone } from "./Livepreviewphone";
import { BannerFormModal } from "./Bannerformmodal";
import { DeleteConfirmDialog } from "./Deleteconfirmdialog";
import { getBannerKey } from "./Utils";
import { useBannerManager } from "./Usebannermanager";
import PrimaryButton from "../../common/PrimaryButton";

const BannerManager = () => {
  const {
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
    isDeleting,
    isModalOpen,
    formData,
    setFormData,
    isEditing,
    isDragActive,
    setIsDragActive,
    addFiles,
    removeImage,
    applyToPreview,
    bannerPendingDelete,
    confirmDelete,
    cancelDelete,
  } = useBannerManager();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-lato">
      {/* LEFT: MANAGEMENT PANEL */}
      <div className="flex-1 rounded-3xl p-4">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-bold text-[#023337]">Carousel</h2>
            <p className="text-[#777777] text-sm font-medium font-poppins">
              Manage website hero section entries.
            </p>
          </div>
          <PrimaryButton
            label="Upload Banner"
            onClick={() => openModal()}
            icon={<PlusCircle size={20} />}
          />
        </header>

        {localBanners.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localBanners.map((banner) => {
              const key = getBannerKey(banner);
              return (
                <BannerCard
                  key={key || banner.id}
                  banner={banner}
                  isPending={pendingKeys.has(key)}
                  isSaving={savingKey === key}
                  isDeleteDisabled={isDeleting}
                  getImgSrc={getImgSrc}
                  onEdit={openModal}
                  onPublish={publishBanner}
                  onDelete={requestDelete}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: REAL-TIME PREVIEW MOCKUP */}
      <div className="w-full lg:w-[420px] mt-2">
        <div className="sticky top-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[20px] font-semibold text-[#023337] ">
              Preview
            </span>
          </div>
          <LivePreviewPhone
            localBanners={localBanners}
            previewBanner={previewBanner}
            getImgSrc={getImgSrc}
          />
        </div>
      </div>

      <BannerFormModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        isDragActive={isDragActive}
        setIsDragActive={setIsDragActive}
        getImgSrc={getImgSrc}
        onClose={closeModal}
        onSubmit={applyToPreview}
        onFilesAdded={addFiles}
        onRemoveImage={removeImage}
      />

      <DeleteConfirmDialog
        banner={bannerPendingDelete}
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BannerManager;
