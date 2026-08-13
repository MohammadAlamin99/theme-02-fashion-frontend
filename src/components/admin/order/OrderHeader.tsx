"use client";

import Link from "next/link"; // Import Link
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import PrimaryButton from "../common/PrimaryButton";

export default function OrderHeader() {
  return (
    <div className="flex justify-between items-center mb-4 mx-4">
      <h2 className="text-[#023337] text-base lg:text-[22px] font-lato font-bold">
        Order List
      </h2>
      
      <Link href="/admin/dashboard/order/add">
        <PrimaryButton label="Add Order" icon={<PluseIcon />} />
      </Link>
    </div>
  );
}