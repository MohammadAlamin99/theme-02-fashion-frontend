"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminProfileData } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
}

export default function PermissionGuard({
  children,
  permission,
}: PermissionGuardProps) {
  const router = useRouter();

  const adminUser = useAuthStore((state) => state.adminUser);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const { data, isLoading, isError } = useAdminProfileData();

  const user = data || adminUser;

  const permissions = (user?.permissions ?? []).map((p: string) =>
    p.trim().toLowerCase(),
  );

  const hasPermission = permission
    ? permissions.includes(permission.trim().toLowerCase())
    : true;

  useEffect(() => {
    if (!_hasHydrated || isLoading) return;

    if (!user || isError) {
      router.replace("/admin/dashboard/signin");
      return;
    }

    if (!hasPermission) {
      router.replace("/admin/dashboard/home");
    }
  }, [_hasHydrated, isLoading, isError, user, hasPermission, router]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user || !hasPermission) {
    return null;
  }

  return <>{children}</>;
}
