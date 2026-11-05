"use client";

import { useField } from "formik";

export function FormikRadioGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  const [field] = useField(name);

  return (
    <fieldset className="flex min-w-0 flex-wrap gap-1 rounded-full border border-airline-forest-soft bg-airline-forest-soft/60 p-1 text-sm">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label className="cursor-pointer" key={option.value}>
          <input {...field} className="peer sr-only" type="radio" value={option.value} checked={field.value === option.value} />
          <span className="block whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold text-airline-muted transition-all duration-300 peer-checked:bg-white peer-checked:text-airline-forest peer-checked:shadow-[0_4px_10px_rgb(23_40_59_/_8%)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-airline-gold">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
