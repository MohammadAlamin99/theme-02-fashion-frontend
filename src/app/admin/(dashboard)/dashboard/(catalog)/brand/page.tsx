"use client";
import CatalogHead from "@/components/admin/catalog/CatalogHead";
import BrandTable from "@/components/admin/catalog/category/BrandTable";

export default function Page() {
  return (
    <div className="flex">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <CatalogHead />
          <BrandTable />
        </div>
      </main>
    </div>
  );
}
