// app/(store-front)/landing-page/[slug]/page.tsx

import { notFound } from "next/navigation";
import LandingPageRenderer from "../../../../components/store-front/landing-page/LandingPageRenderer";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 1. Fetch Landing Page Data from Backend
async function getLandingPageData(slug: string) {
  try {
    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8082/api/v1";

    const baseUrl = rawApiUrl.replace(/\/+$/, "");

    // 💡 MATCHES BACKEND ROUTE: /landing-pages/view/:slug
    const res = await fetch(`${baseUrl}/landing-pages/view/${slug}`, {
      headers: {
        "X-Customer-Request": "true",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Backend returned status ${res.status} for slug: ${slug}`);
      return null;
    }

    const result = await res.json();
    return result?.data || result;
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return null;
  }
}

// 2. Metadata Generator
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pageData = await getLandingPageData(slug);

  if (!pageData) return {};

  return {
    title: pageData.meta_title || pageData.title || "Landing Page",
    description: pageData.meta_description || pageData.subHeadline || "",
  };
}

// 3. Page Component
export default async function LandingPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const landingData = await getLandingPageData(slug);

  if (!landingData) {
    notFound();
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: landingData.backgroundColor || "#ffffff",
        color: landingData.textColor || "#0f172a",
      }}
    >
      <LandingPageRenderer liveData={landingData} />
    </main>
  );
}