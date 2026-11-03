import { Container } from "inversify";
import { NetworkModule } from "@/src/ioc/common/network.module";
import { GoogleAuthenticationModule } from "@/src/features/authentication/ioc/GoogleAuthentication.module";
import { FlightSearchModule } from "@/src/features/flights/ioc/FlightSearch.module";
import { BookingModule } from "@/src/features/bookings/ioc/Booking.module";

const ApplicationContainer = new Container({
  skipBaseClassChecks: true,
  defaultScope: "Singleton",
  autoBindInjectable: true,
});

export const initializeContainer = () => {
  ApplicationContainer.load(NetworkModule);
  ApplicationContainer.load(GoogleAuthenticationModule);
  ApplicationContainer.load(FlightSearchModule);
  ApplicationContainer.load(BookingModule);
};

initializeContainer();

export { ApplicationContainer };
