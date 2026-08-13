"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  PlusCircle,
  RotateCw,
  Monitor,
  Smartphone,
} from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";
import DataTable from "../../common/DataTable";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface PopupItem {
  id: number;
  sl: number;
  image: string;
  name: string;
  url: string;
  status: "Publish" | "Draft";
}

const popupsData: PopupItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  sl: index + 1,
  image: "/images/products/product2.png",
  name: "Motorcycle Toy [Motorbike Model Showpiece for Boys, Gift for Kids]",
  url: "offer/labonno-bd-bridal-glow-complete-care-set",
  status: "Publish",
}));

export default function PopupMainSection() {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const siteUrl = "https://creassmart.com/";

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === popupsData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(popupsData.map((item) => item.id));
    }
  };

  const columns: TableColumn<PopupItem>[] = [
    {
      header: "",
      key: "checkbox-selection",
      headerClassName: "w-[45px]",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={
            selectedIds.length === popupsData.length && popupsData.length > 0
          }
          onChange={handleSelectAll}
        />
      ),
      render: (item) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[#EAF8E7] accent-[#1DA1F2] cursor-pointer"
          checked={selectedIds.includes(item.id)}
          onChange={() => handleSelectRow(item.id)}
        />
      ),
    },
    {
      header: "SL",
      key: "sl",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {item.sl}
        </span>
      ),
    },
    {
      header: "Name",
      key: "name",
      render: (item) => (
        <div className="flex items-center gap-3 max-w-[260px]">
          <div className="shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              width={45}
              height={45}
              className="rounded-[8px] object-cover"
            />
          </div>
          <span
            className="text-[14px] text-[#1D1A1A] font-normal line-clamp-2"
            title={item.name}
          >
            {item.name}
          </span>
        </div>
      ),
    },
    {
      header: "URL",
      key: "url",
      render: (item) => (
        <span
          className="text-[14px] text-gray-500 font-normal block max-w-[220px] truncate"
          title={item.url}
        >
          {item.url}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item) => (
        <div
          className={`px-3 py-1 rounded-full text-[12px] font-medium w-fit ${
            item.status === "Publish"
              ? "bg-[#C1FFBC] text-[#085E00]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.status}
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: () => (
        <button className="text-black p-1 transition-colors">
          <MoreVertical size={20} />
        </button>
      ),
    },
  ];

  return (
    <div className="w-full p-6 font-poppins">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE: POPUP MANAGEMENT TABLE (7 Columns) */}
        <div className="lg:col-span-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2">
            <div>
              <h2 className="text-[#003032] text-xl font-bold font-lato">
                Popup
              </h2>
              <p className="text-[#777777] text-sm mt-1 font-normal">
                Create unlimited Popup
              </p>
            </div>
            <PrimaryButton
              label="Create Popup"
              icon={<PlusCircle size={18} strokeWidth={2.5} />}
            />
          </div>

          <DataTable
            data={popupsData}
            columns={columns}
            rowKey="id"
            gradiant={true}
          />
        </div>

        {/* RIGHT SIDE: LIVE PREVIEW LAYOUT WRAPPER (5 Columns) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-3">
              <h2 className="text-[#003032] text-xl font-bold font-lato">
                Preview
              </h2>
              <button className="text-gray-400 hover:text-[#1DA1F2] cursor-pointer bg-transparent border-none outline-none">
                <RotateCw size={18} />
              </button>
            </div>

            <div className="flex bg-white rounded-[8px] p-1 border border-gray-100 shadow-sm">
              <button
                onClick={() => setViewMode("desktop")}
                className={`p-2 rounded-[6px] transition-all cursor-pointer border-none outline-none ${
                  viewMode === "desktop"
                    ? "bg-[#1DA1F2] text-white"
                    : "text-gray-400 bg-transparent"
                }`}
              >
                <Monitor size={20} />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`p-2 rounded-[6px] transition-all cursor-pointer border-none outline-none ${
                  viewMode === "mobile"
                    ? "bg-[#1DA1F2] text-white"
                    : "text-gray-400 bg-transparent"
                }`}
              >
                <Smartphone size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-center bg-gray-200/40 rounded-[8px] overflow-hidden min-h-[700px] relative border border-gray-100">
            <div
              className={`transition-all duration-500 bg-white shadow-2xl overflow-hidden ${
                viewMode === "desktop"
                  ? "w-full h-[700px]"
                  : "w-[340px] h-[640px] my-6 rounded-[32px] border-[10px] border-[#131313]"
              }`}
            >
              <iframe
                src={siteUrl}
                className="w-full h-full border-none"
                title="Live Preview"
              />
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400 font-medium italic">
            * Live preview tracking: {siteUrl}
          </p>
        </div>
      </div>
    </div>
  );
}
