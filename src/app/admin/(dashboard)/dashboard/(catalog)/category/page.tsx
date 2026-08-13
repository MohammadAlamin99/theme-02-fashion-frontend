"use client";

import CatalogHead from "@/components/admin/catalog/CatalogHead";
import CategoryTable from "@/components/admin/catalog/category/CategoryTable";

export default function Page() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <CatalogHead />
          <CategoryTable />
        </div>
      </main>
    </div>
  );
}
