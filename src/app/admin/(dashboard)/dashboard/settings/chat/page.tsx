"use client";

import ChatSettingsPage from "@/components/admin/settings/chat/ChatSettingsPage";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <ChatSettingsPage />
        </div>
      </main>
    </div>
  );
}
