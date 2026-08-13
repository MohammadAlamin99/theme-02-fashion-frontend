"use client";

import ContentHead from "@/components/admin/content/ContentHead";
import ContentNavigation from "@/components/admin/content/ContentNavigation";
import PopupMainSection from "@/components/admin/content/popup/PopupMainSection";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="p-2 md:p-0">
          <div className="bg-white">
            <ContentHead />
            <ContentNavigation />
          </div>
          <PopupMainSection />
        </div>
      </main>
    </div>
  );
}
