"use client";

import { useFormikContext } from "formik";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { BaseButton } from "@/src/components/buttons/BaseButton";

export function FormikSubmitButton({ label, busyLabel }: { label: string; busyLabel: string }) {
  const { isSubmitting, isValid } = useFormikContext();
  return (
      <BaseButton className="group min-h-12 w-full rounded-xl bg-airline-forest px-7 text-sm font-semibold text-white shadow-[0_8px_18px_rgb(23_62_56_/_18%)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#24594f] hover:shadow-[0_12px_24px_rgb(23_62_56_/_24%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-gold disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none sm:w-auto" type="submit" disabled={isSubmitting || !isValid} aria-busy={isSubmitting}>
      <span>{isSubmitting ? busyLabel : label}</span>
      {isSubmitting ? <LoaderCircle size={17} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />}
    </BaseButton>
  );
}
