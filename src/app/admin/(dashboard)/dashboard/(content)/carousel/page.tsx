import CarouselManager from "@/components/admin/content/carousel/CarouselManager";
import ContentHead from "@/components/admin/content/ContentHead";
import ContentNavigation from "@/components/admin/content/ContentNavigation";

export default function Page() {
  return (
    <div className="flex">
      <main className="flex-1">
        <div className="p-2 md:p-0">
          <div className="bg-white">
            <ContentHead />
            <ContentNavigation />
          </div>
          <CarouselManager />
        </div>
      </main>
    </div>
  );
}
