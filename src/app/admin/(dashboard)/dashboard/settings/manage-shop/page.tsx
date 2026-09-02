"use client";

import ShopSettingsPage from "@/components/admin/settings/manage-shop/ShopSettingsPage";

export default function Page() {
  return (
    <div className="flex overflow-hidden">
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="p-2 md:p-0">
          <div className="mt-2">
            <ShopSettingsPage />
          </div>
        </div>
      </main>
    </div>
  );
}
