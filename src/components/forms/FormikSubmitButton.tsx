"use client";

import { useFormikContext } from "formik";
import { BaseButton } from "@/src/components/buttons/BaseButton";

export function FormikSubmitButton({ label, busyLabel }: { label: string; busyLabel: string }) {
  const { isSubmitting, isValid } = useFormikContext();
  return (
    <BaseButton className="col-span-2 ml-[14px] inline-flex min-h-[62px] w-full min-w-[142px] items-center justify-center gap-2 rounded-[10px] bg-[#86233d] px-5 text-base font-bold text-white hover:bg-[#6d1b31] disabled:cursor-wait disabled:opacity-65 max-[1050px]:col-span-6 max-[1050px]:ml-0 max-[650px]:col-span-2 max-[650px]:min-h-[52px]" type="submit" disabled={isSubmitting || !isValid}>
      {isSubmitting ? busyLabel : label}
    </BaseButton>
  );
}
