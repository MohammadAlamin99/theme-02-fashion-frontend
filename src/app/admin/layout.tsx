"use client";

import { useState } from "react";
import Header from "@/components/admin/common/Header";
import Sidebar from "@/components/admin/common/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-2 md:p-0 md:mx-4 mx-2">{children}</div>
        </main>
      </div>
    </div>
  );
}
