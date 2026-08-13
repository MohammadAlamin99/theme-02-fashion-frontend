"use client";
import AdminControlTable from "@/components/admin/admin-control/AdminControlTable";
import AdminControlHead from "@/components/admin/admin-control/AdminControlHead";
import PermissionGuard from "@/components/admin/common/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard permission="Admin Control">
      <div className="flex">
        <main className="flex-1">
          <div className="">
            <AdminControlHead />
            <AdminControlTable />
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
}
