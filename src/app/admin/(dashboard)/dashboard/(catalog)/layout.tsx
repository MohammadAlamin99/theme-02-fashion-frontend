"use client";

import PermissionGuard from "@/components/admin/common/PermissionGuard";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="Catalog">
      {children}
    </PermissionGuard>
  );
}