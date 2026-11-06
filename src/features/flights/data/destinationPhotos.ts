import type { DemoAirportCode } from "../domain/models/DemoRoutes";

const licenses = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
};

export type DestinationPhoto = {
  image: string;
  country: "IN" | "GB" | "SG";
  author: string;
  file: string;
  license: keyof typeof licenses;
};

export const destinationPhotos: Record<DemoAirportCode, DestinationPhoto> = {
  DEL: { image: "/images/delhi-india-gate.jpg", country: "IN", author: "Kamalkant0411", file: "Delhi,_India_Gate.jpg", license: "CC0" },
  BOM: { image: "/images/mumbai-gateway.jpg", country: "IN", author: "Deepak Kumar Singh", file: "Gateway_Of_India,_Mumbai,_India.jpg", license: "CC BY-SA 4.0" },
  BLR: { image: "/images/bengaluru-vidhana-soudha.jpg", country: "IN", author: "Harish.halebeed", file: "Vidhansoudha.jpg", license: "CC BY-SA 4.0" },
  MAA: { image: "/images/chennai-marina-beach.jpg", country: "IN", author: "Saiphani02", file: "Marina_beach,_Chennai_aerial_view.jpg", license: "CC BY-SA 4.0" },
  HYD: { image: "/images/hyderabad-charminar.jpg", country: "IN", author: "IcyB201299", file: "A_Landscape_shot_of_the_Charminar.jpg", license: "CC BY-SA 4.0" },
  LHR: { image: "/images/london-tower-bridge.jpg", country: "GB", author: "Pierre Blaché", file: "Tower_Bridge,_London_at_sunrise.jpg", license: "CC0" },
  SIN: { image: "/images/singapore-marina-bay.jpg", country: "SG", author: "Jakub Hałun", file: "Marina_Bay_Sands_at_night,_Singapore,_20240205_2003_6086.jpg", license: "CC BY 4.0" },
};

export function getDestinationPhoto(airport: string) {
  return Object.hasOwn(destinationPhotos, airport) ? destinationPhotos[airport as DemoAirportCode] : undefined;
}

export function getPhotoAttribution(photo: DestinationPhoto) {
  return {
    source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photo.file)}`,
    license: licenses[photo.license],
  };
}
