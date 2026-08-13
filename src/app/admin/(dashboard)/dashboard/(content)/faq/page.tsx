import FaqManagement from "@/components/admin/content/faq/FaqManagement";
import ContentHead from "@/components/admin/content/ContentHead";
import ContentNavigation from "@/components/admin/content/ContentNavigation";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <div className="bg-white">
            <ContentHead />
            <ContentNavigation />
          </div>
          <FaqManagement />
        </div>
      </main>
    </div>
  );
}
