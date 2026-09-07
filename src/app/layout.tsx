import type { Metadata } from "next";
import { Inter, Lato, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { fetchSettings } from "@/services-api/settingsService";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();
  const info = settings?.data || settings;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "");

  const faviconUrl = info?.favicon
    ? `${baseUrl}/uploads/settings/${info.favicon.replace("/uploads/settings/", "")}`
    : "/favicon.ico";

  return {
    title: "Overseas",
    description: "Premium E-Commerce Platform",
    icons: {
      icon: [
        {
          url: faviconUrl,
          type: "image/webp",
        },
      ],
      shortcut: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} ${lato.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col relative"
        suppressHydrationWarning
      >
        <NextTopLoader
          color="#7CB640"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
