import FlightSearchView from "@/src/features/flights/ui/views/FlightSearchView";
import WhereWeFlyView from "@/src/features/flights/ui/views/WhereWeFlyView";
import PrepareToTravelView from "@/src/features/travel-info/ui/views/PrepareToTravelView";
import FaqsView from "@/src/features/faqs/ui/views/FaqsView";
import TravelExperienceView from "@/src/features/experience/ui/views/TravelExperienceView";

export default function HomePage() {
  return (
    <main>
      <FlightSearchView />
      <WhereWeFlyView embedded />
      <PrepareToTravelView embedded />
      <FaqsView embedded />
      <TravelExperienceView embedded />
    </main>
  );
}
