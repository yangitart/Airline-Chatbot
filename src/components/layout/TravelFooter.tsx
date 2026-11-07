"use client";

import { useTranslation } from "react-i18next";

export function TravelFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-airline-line bg-airline-paper px-4 pb-[calc(6rem_+_env(safe-area-inset-bottom))] pt-6 text-center text-xs text-airline-muted lg:pb-6">
      <span>Veyra</span>
      <span aria-hidden="true" className="mx-2 text-airline-gold">
        ·
      </span>
      {t("travelPages.footer")}
    </footer>
  );
}
