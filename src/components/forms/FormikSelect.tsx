"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useField } from "formik";
import { Check, ChevronDown } from "lucide-react";

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
  const [field, meta, helpers] = useField<string>(name);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const listId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === field.value),
  );
  const hasError = Boolean(meta.touched && meta.error);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex);
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    optionRefs.current[selectedIndex]?.focus();
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, selectedIndex]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    void helpers.setValue(option.value);
    void helpers.setTouched(true);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let next = activeIndex;
    if (event.key === "ArrowDown")
      next = Math.min(options.length - 1, activeIndex + 1);
    else if (event.key === "ArrowUp") next = Math.max(0, activeIndex - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    } else return;
    event.preventDefault();
    setActiveIndex(next);
    optionRefs.current[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      className={`relative flex min-w-0 flex-col gap-1.5 rounded-2xl border px-4 py-3 transition-all duration-300 ${hasError ? "border-[#b42318] bg-[#fff8f6]" : "border-airline-line bg-[#f7f6f1] hover:border-airline-gold/70 focus-within:border-airline-gold focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(196_164_102_/_12%)]"} ${className}`.trim()}
    >
      <label
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.13em] text-airline-muted"
        htmlFor={name}
      >
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </label>
      <input type="hidden" name={field.name} value={field.value ?? ""} />
      <button
        ref={triggerRef}
        id={name}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={hasError ? `${name}-error` : undefined}
        onBlur={() => void helpers.setTouched(true)}
        onClick={() => setOpen((value) => !value)}
        className={`flex min-h-7 w-full min-w-0 items-center justify-between gap-3 text-left font-[inherit] text-[15px] font-semibold text-airline-ink outline-none ${inputClassName}`.trim()}
      >
        <span className="truncate">{options[selectedIndex]?.label}</span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-airline-forest transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${listId}-option-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] max-h-64 overflow-y-auto rounded-2xl border border-airline-line bg-airline-paper p-1.5 shadow-[0_18px_48px_rgb(23_40_59_/_18%)] animate-soft-rise motion-reduce:animate-none"
        >
          {options.map((option, index) => {
            const selected = index === selectedIndex;
            return (
              <div
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onClick={() => selectOption(index)}
                onMouseEnter={() => {
                  setActiveIndex(index);
                  optionRefs.current[index]?.focus();
                }}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors focus:bg-airline-forest-soft focus:outline-none ${selected ? "bg-airline-forest-soft font-semibold text-airline-forest" : "text-airline-ink hover:bg-[#f6f3eb]"}`}
              >
                <span>{option.label}</span>
                {selected && (
                  <Check
                    size={16}
                    className="shrink-0 text-airline-garnet"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {hasError && (
        <small
          id={`${name}-error`}
          className="animate-soft-rise text-xs font-medium text-[#b42318] motion-reduce:animate-none"
        >
          {meta.error}
        </small>
      )}
    </div>
  );
}
