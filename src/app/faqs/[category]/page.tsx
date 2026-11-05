import { notFound } from "next/navigation";
import FaqsView from "@/src/features/faqs/ui/views/FaqsView";
const categories = ["booking", "checkin", "baggage", "reaccommodation", "loyalty", "notifications", "insurance", "cargo", "health", "children", "pets", "payments", "integration", "rail", "app", "account", "wifi", "baggage-guidelines", "customer-support", "flight-status-info", "online-checkin-info"];
export default async function FaqCategoryPage({ params }: { params: Promise<{ category: string }> }) { const { category } = await params; if (!categories.includes(category)) notFound(); return <FaqsView category={category} />; }
