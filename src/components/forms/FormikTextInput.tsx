"use client";

import { useField } from "formik";

type FormikTextInputProps = {
  name: string;
  label: string;
  type?: "text" | "tel" | "email";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
};

export function FormikTextInput({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = false,
  maxLength,
  className = "",
}: FormikTextInputProps) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <label className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border px-4 py-3 transition-all duration-300 focus-within:border-airline-gold focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(196_164_102_/_12%)] ${hasError ? "border-[#b42318] bg-[#fff8f6]" : "border-airline-line bg-[#f7f6f1] hover:-translate-y-px hover:border-airline-gold/70 motion-reduce:transform-none"} ${className}`.trim()} htmlFor={name}>
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.13em] text-airline-muted">{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input
        {...field}
        className="block w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] text-[15px] font-semibold text-airline-ink outline-none placeholder:font-normal placeholder:text-[#89928c]"
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      {hasError && <small id={`${name}-error`} className="animate-soft-rise text-xs font-medium text-[#b42318] motion-reduce:animate-none">{meta.error}</small>}
    </label>
  );
}
