import { Suspense } from "react";
import ThankYouContent from "@/components/store-front/thank_you/ThankYouContent";

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center font-medium">
          Loading Page Content...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
