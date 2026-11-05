"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/src/core/locales/supportedLanguages";

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeLanguage = supportedLanguages.find((language) => language.code === i18n.resolvedLanguage)
    ?? supportedLanguages.find((language) => language.code === i18n.resolvedLanguage?.split("-")[0])
    ?? supportedLanguages[0];
  const activeCode = activeLanguage.code;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const changeLanguage = (language: (typeof supportedLanguages)[number]) => {
    window.localStorage.setItem("airline-language", language.code);
    void i18n.changeLanguage(language.code);
    setOpen(false);
  };

  return (
    <div className="relative z-50" ref={pickerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("flightSearch.nav.language")}
        aria-expanded={open}
        aria-controls="language-picker-options"
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-transparent px-2.5 py-2 text-airline-ink transition-all duration-300 hover:border-airline-line hover:bg-white hover:shadow-[0_5px_14px_rgb(23_40_59_/_7%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet"
      >
        <Globe2 size={17} className="hidden text-airline-forest transition-transform duration-500 group-hover:rotate-12 sm:block motion-reduce:transform-none" aria-hidden="true" />
        <Image src={"/flags/" + activeLanguage.flag + ".svg"} alt="" width={24} height={16} className="shrink-0 rounded-sm ring-1 ring-black/10" />
        <span className="hidden text-[11px] font-bold uppercase tracking-wide sm:inline">{activeLanguage.code}</span>
        <ChevronDown size={14} className={`text-airline-muted transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && <div id="language-picker-options" aria-label={t("flightSearch.nav.language")} className="absolute right-0 top-full mt-3 w-56 origin-top-right animate-soft-rise rounded-2xl border border-airline-line bg-airline-paper p-2 shadow-[0_18px_50px_rgb(23_40_59_/_16%)] motion-reduce:animate-none">
        <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.16em] text-airline-muted">{t("flightSearch.nav.language")}</p>
        {supportedLanguages.map((language) => {
          const selected = language.code === activeCode;
          return <button key={language.code} type="button" aria-pressed={selected} onClick={() => changeLanguage(language)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-airline-garnet ${selected ? "bg-airline-forest-soft text-airline-forest" : "text-airline-ink hover:bg-[#f7f6f1]"}`}>
            <Image src={"/flags/" + language.flag + ".svg"} alt="" width={24} height={16} className="shrink-0 rounded-sm ring-1 ring-black/10" />
            <span className="flex-1 text-sm font-semibold">{language.label}</span>
            {selected && <Check size={16} className="text-airline-garnet" aria-hidden="true" />}
          </button>;
        })}
      </div>}
    </div>
  );
}
