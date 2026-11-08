import FlightDiscoveryView from "@/src/features/flights/ui/views/FlightDiscoveryView";
import PrepareToTravelView from "@/src/features/travel-info/ui/views/PrepareToTravelView";
import FaqsView from "@/src/features/faqs/ui/views/FaqsView";
import TravelExperienceView from "@/src/features/experience/ui/views/TravelExperienceView";

export default function HomePage() {
  return (
    <main>
      <FlightDiscoveryView />
      <PrepareToTravelView embedded />
      <FaqsView embedded />
      <TravelExperienceView embedded />
    </main>
  );
}
