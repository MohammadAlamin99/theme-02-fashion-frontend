"use client";

import CatalogHead from "@/components/admin/catalog/CatalogHead";
import SubCategoryTable from "@/components/admin/catalog/category/SubCategoryTable";

export default function Page() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <CatalogHead />
          <SubCategoryTable />
        </div>
      </main>
    </div>
  );
}
