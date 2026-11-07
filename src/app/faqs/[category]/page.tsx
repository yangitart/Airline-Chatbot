import { notFound } from "next/navigation";
import FaqsView from "@/src/features/faqs/ui/views/FaqsView";
import { isFaqCategory } from "@/src/features/faqs/data/faqCatalog";

export default async function FaqCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isFaqCategory(category)) notFound();
  return <FaqsView category={category} />;
}
