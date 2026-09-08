"use client";

import ChatWidget from "@/components/store-front/chat/ChatWidget";
import Footer from "@/components/store-front/home/Footer";
import Navbar from "@/components/store-front/home/Navbar";
import TopHeader from "@/components/store-front/home/TopHeader";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col text-center px-4 font-poppins">
      <TopHeader />
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-7xl font-semibold text-gray-900">404</h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>

        <p className="mt-2 text-gray-500">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="mt-6 rounded-lg bg-[#000000] px-6 py-3 text-white hover:bg-[#000000] transition"
        >
          Go Home
        </Link>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
