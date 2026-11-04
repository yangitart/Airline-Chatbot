"use client";

import { useField } from "formik";

export type SelectOption = { value: string; label: string };

export function FormikSelect({
  name,
  label,
  options,
  required = false,
  className = "",
  inputClassName = "",
}: {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <label className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border px-4 py-3 transition focus-within:border-[#9a604d] focus-within:ring-2 focus-within:ring-[#9a604d]/15 ${hasError ? "border-[#b42318] bg-[#fff8f6]" : "border-[#dfe5e3] bg-[#f7f9f8] hover:border-[#b6c3bf]"} ${className}`.trim()} htmlFor={name}>
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.13em] text-[#63736f]">{label}{required && <b aria-hidden="true"> *</b>}</span>
      <select {...field} className={`w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] text-[15px] font-semibold text-[#182d2b] outline-none ${inputClassName}`.trim()} id={name} required={required} aria-invalid={hasError} aria-describedby={hasError ? `${name}-error` : undefined}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {hasError && <small id={`${name}-error`} className="text-xs font-medium text-[#b42318]">{meta.error}</small>}
    </label>
  );
}
