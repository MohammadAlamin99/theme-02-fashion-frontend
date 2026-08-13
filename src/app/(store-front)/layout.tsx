// import Navbar from "@/components/store-front/home/Navbar";
// import TopHeader from "@/components/store-front/home/TopHeader";
// import FAQ from "@/components/store-front/home/FAQ";
// import Footer from "@/components/store-front/home/Footer";
// import ChatWidget from "@/components/store-front/chat/ChatWidget";

// export default function StoreFrontLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <>
//       <TopHeader />
//       <Navbar />
//       <main className="flex-1">{children}</main>
//       <FAQ />
//       <Footer />
//       <ChatWidget />
//     </>
//   );
// }


import { Suspense } from "react";
import Navbar from "@/components/store-front/home/Navbar";
import TopHeader from "@/components/store-front/home/TopHeader";
import FAQ from "@/components/store-front/home/FAQ";
import Footer from "@/components/store-front/home/Footer";
import ChatWidget from "@/components/store-front/chat/ChatWidget";
import { LanguageProvider } from "@/providers/LanguageProvider";
import SourceTracker from "@/components/store-front/SourceTracker";

export default function StoreFrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      {/* Captures UTM / referrer on first page load — renders nothing visually */}
      <Suspense fallback={null}>
        <SourceTracker />
      </Suspense>

      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <FAQ />
        <Footer />
        <ChatWidget />
      </div>
    </LanguageProvider>
  );
}