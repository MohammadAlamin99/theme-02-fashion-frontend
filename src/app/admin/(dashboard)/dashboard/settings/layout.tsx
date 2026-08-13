"use client";

import PermissionGuard from "@/components/admin/common/PermissionGuard";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGuard permission="Settings">
      {children}
    </PermissionGuard>
  );
}