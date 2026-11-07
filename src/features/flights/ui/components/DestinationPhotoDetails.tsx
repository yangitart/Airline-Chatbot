import Image from "next/image";
import {
  getPhotoAttribution,
  type DestinationPhoto,
} from "../../data/destinationPhotos";

export function DestinationCountry({
  photo,
  locale,
}: {
  photo: DestinationPhoto;
  locale: string;
}) {
  const country = new Intl.DisplayNames(locale, { type: "region" }).of(
    photo.country,
  );
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold">
      <Image
        src={`/flags/${photo.country.toLowerCase()}.svg`}
        alt=""
        width={24}
        height={16}
        className="h-4 w-6 rounded-sm object-cover"
      />
      {country}
    </span>
  );
}

export function DestinationPhotoCredit({
  photo,
  className,
}: {
  photo: DestinationPhoto;
  className?: string;
}) {
  const { source, license } = getPhotoAttribution(photo);
  return (
    <p className={`text-xs text-white/90 ${className ?? ""}`}>
      <a
        className="underline underline-offset-2"
        href={source}
        target="_blank"
        rel="noreferrer"
      >
        {photo.author}
      </a>
      {" · "}
      <a
        className="underline underline-offset-2"
        href={license}
        target="_blank"
        rel="noreferrer"
      >
        {photo.license}
      </a>
    </p>
  );
}
