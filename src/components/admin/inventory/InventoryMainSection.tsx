
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { StatCard } from "../common/StatCard";
import InventorySearchBar from "./InventorySearchBar";
import SelectTrigger from "../common/SelectTrigger";
import DataTable from "../common/DataTable";
import GrowIcon from "@/components/store-front/svg/svg/GrowIcon";
import HandBoxicon from "@/components/store-front/svg/svg/HandBoxicon";
import ProductIcon from "@/components/store-front/svg/svg/sidebar-icon/ProductIcon";
import InventroyGrowIcon from "@/components/store-front/svg/svg/InventroyGrowIcon";
import { inventoryApi } from "@/services-api/inventoryService";

const InventoryMainSection = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("stock_low");
  const [thresholdValue, setThresholdValue] = useState(5);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-dashboard", search, sortBy],
    queryFn: () => inventoryApi.getDashboard(search, sortBy),
  });

  const mutation = useMutation({
    mutationFn: inventoryApi.updateThreshold,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inventory-dashboard"],
      });
    },

    onError: (err) => {
      console.error("Threshold update failed:", err);
    },
  });

  const stats = data?.stats || {
    totalProductsCount: 0,
    totalUnitsOnHand: 0,
    lowStockCount: 0,
    totalCapitalValue: 0,
    totalInventoryValue: 0,
  };

  const productList = data?.productList || [];
  const alerts = data?.inventoryAlerts || [];
  const threshold = data?.currentThreshold ?? 5;

  useEffect(() => {
    setThresholdValue(threshold);
  }, [threshold]);

  const columns = [
    {
      header: "Product",
      key: "name",
      render: (item: any) => (
        <span className="text-[13px] font-medium text-gray-800">
          {item.name}
        </span>
      ),
    },
    {
      header: "Category",
      key: "category",
      render: (item: any) => (
        <span className="text-sm">{item.category}</span>
      ),
    },
    {
      header: "Price",
      key: "price",
      render: (item: any) => (
        <span className="text-sm">৳{item.price}</span>
      ),
    },
    {
      header: "Stock",
      key: "stock",
      render: (item: any) => (
        <span className="text-sm">{item.stock}</span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item: any) => (
        <div className="bg-[#C1FFBC] text-[#085E00] text-[11px] font-bold px-3 py-1 rounded-full w-fit">
          {item.status}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-[#F9F9F9] font-lato min-h-screen p-6">
      <div className="bg-white p-5 rounded-[8px_8px_0_0] mt-2">
        <h1 className="text-[22px] font-bold text-[#023337] mb-6">
          Inventory
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <StatCard
            title="Products"
            val={String(stats.totalProductsCount)}
            sub="Category wise"
            icon={ProductIcon}
            textColor="text-gray-400"
            bgColor="bg-[#F9F9F9]"
          />

          <StatCard
            title="Total units"
            val={String(stats.totalUnitsOnHand)}
            sub="Entire shop"
            icon={HandBoxicon}
            textColor="text-blue-400"
            bgColor="bg-[#F9F9F9]"
          />

          <StatCard
            title="Low stock"
            val={String(stats.lowStockCount)}
            sub={`Items < ${threshold}`}
            icon={AlertTriangle}
            textColor="text-red-500"
            bgColor="bg-[#F9F9F9]"
          />

          <StatCard
            title="Capital"
            val={`৳ ${Number(stats.totalCapitalValue).toLocaleString()}`}
            sub="Cost Price"
            icon={GrowIcon}
            textColor="text-green-500"
            bgColor="bg-[#F9F9F9]"
          />

          <StatCard
            title="Inventory"
            val={`৳ ${Number(stats.totalInventoryValue).toLocaleString()}`}
            sub="Selling Price"
            icon={InventroyGrowIcon}
            textColor="text-orange-500"
            bgColor="bg-[#F9F9F9]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-6">
          <InventorySearchBar onSearch={setSearch} />

          <div
            onClick={() =>
              setSortBy((prev) =>
                prev === "stock_low" ? "stock_high" : "stock_low"
              )
            }
          >
            <SelectTrigger
              label={
                sortBy === "stock_low"
                  ? "Stock Low to High"
                  : "Stock High to Low"
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">Set Threshold:</span>

            <input
              type="number"
              value={thresholdValue}
              onChange={(e) =>
                setThresholdValue(Number(e.target.value))
              }
              onBlur={() => mutation.mutate(thresholdValue)}
              className="bg-[#F9F9F9] p-2 rounded w-20 text-center text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-white p-5">
        <div className="lg:col-span-7 bg-white rounded-[8px]">
          {isLoading ? (
            <p className="p-4">Loading...</p>
          ) : (
            <DataTable
              data={productList}
              columns={columns}
              rowKey="id"
              gradiant
            />
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-[8px] p-6 shadow-[0_4px_5px_0_rgba(0,0,0,0.11)]">
          <h3 className="text-lg font-bold mb-1">
            Inventory Alerts
          </h3>

          {alerts.length > 0 ? (
            alerts.map((a: any) => (
              <div
                key={a.id}
                className="py-2 border-b border-gray-200 text-sm flex justify-between"
              >
                <span>{a.name}</span>
                <span className="text-red-500 font-bold">
                  {a.stock} left
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#00A557] bg-[#ECFDF5] p-4 rounded text-center">
              Inventory looks healthy!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryMainSection;