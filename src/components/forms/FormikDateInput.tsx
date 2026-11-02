"use client";

import { useField } from "formik";

export function FormikDateInput({
  name,
  label,
  min,
  required = false,
  className = "",
}: {
  name: string;
  label: string;
  min?: string;
  required?: boolean;
  className?: string;
}) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <label className={`flex min-w-[120px] flex-1 flex-col justify-center gap-[5px] border-l border-[#d7dbe0] px-[15px] ${className}`.trim()} htmlFor={name}>
      <span className="flex items-center gap-1.5 text-xs text-[#777e87]">{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input {...field} className="max-w-full border-0 bg-transparent font-[inherit] text-[17px] text-[#202934] outline-0" id={name} type="date" min={min} required={required} aria-invalid={hasError} aria-describedby={hasError ? `${name}-error` : undefined} />
      {hasError && <small id={`${name}-error`} className="mt-[3px] text-xs text-[#b42318]">{meta.error}</small>}
    </label>
  );
}
