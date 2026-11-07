import type { ButtonHTMLAttributes, ReactNode } from "react";

type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
  leadingIcon?: ReactNode;
};

export function BaseButton({
  variant = "primary",
  leadingIcon,
  className = "",
  children,
  ...props
}: BaseButtonProps) {
  const variantClasses = {
    primary: "border-0",
    secondary: "border border-[#d7dce2] bg-white text-[#243246]",
    quiet: "border-0 bg-transparent text-inherit",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center gap-[10px] font-[inherit] enabled:cursor-pointer disabled:cursor-wait disabled:opacity-65 ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
}
