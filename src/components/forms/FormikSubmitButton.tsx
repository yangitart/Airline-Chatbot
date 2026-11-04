"use client";

import { useFormikContext } from "formik";
import { BaseButton } from "@/src/components/buttons/BaseButton";

export function FormikSubmitButton({ label, busyLabel }: { label: string; busyLabel: string }) {
  const { isSubmitting, isValid } = useFormikContext();
  return (
    <BaseButton className="min-h-12 w-full rounded-xl bg-[#173e38] px-7 text-sm font-semibold text-white shadow-[0_8px_18px_rgb(23_62_56_/_18%)] transition hover:bg-[#24594f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173e38] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto" type="submit" disabled={isSubmitting || !isValid} aria-busy={isSubmitting}>
      {isSubmitting ? busyLabel : label}
    </BaseButton>
  );
}
