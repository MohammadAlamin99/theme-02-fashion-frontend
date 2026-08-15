import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getProductBySlug } from "@/services-api/productService";
import ProductDetailContent from "../ProductDetailContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: Props) {
  const queryClient = new QueryClient();
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  await queryClient.prefetchQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailContent slug={slug} />
    </HydrationBoundary>
  );
}
