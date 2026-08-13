"use client";

import SettingsPage from "@/components/admin/settings/SettingsPage";

export default function Page() {
  return (
    <div className="flex">
      <main className="flex-1">
        <div className="bg-white">
          <div className="md:mx-4 mx-2 bg-white mt-2">
            <SettingsPage />
          </div>
        </div>
      </main>
    </div>
  );
}
