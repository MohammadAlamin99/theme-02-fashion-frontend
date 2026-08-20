"use client";

import { useParams } from "next/navigation";
import FlashSaleContent from "@/components/store-front/flash-sale/FlashSaleContent";

export default function DynamicFlashSalePage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  return <FlashSaleContent slug={slug} />;
}
