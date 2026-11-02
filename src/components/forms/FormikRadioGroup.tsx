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
    <fieldset className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 border-0 p-0 text-sm max-[650px]:gap-x-4">
      <legend className="visually-hidden">{label}</legend>
      {options.map((option) => (
        <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-[#344052]" key={option.value}>
          <input {...field} className="accent-[#86233d]" type="radio" value={option.value} checked={field.value === option.value} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
