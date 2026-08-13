"use client";

import CatalogHead from "@/components/admin/catalog/CatalogHead";
import ChildCategoryTable from "@/components/admin/catalog/category/ChildCategoryTable";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <CatalogHead />
          <ChildCategoryTable />
        </div>
      </main>
    </div>
  );
}
