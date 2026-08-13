"use client";

import PermissionGuard from "@/components/admin/common/PermissionGuard";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="Website Content">
      {children}
    </PermissionGuard>
  );
}