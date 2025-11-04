"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { twMerge } from "tailwind-merge";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** sm=40px, md=44px, lg=48px */
  fieldSize?: "sm" | "md" | "lg";
  inputClassName?: string;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    helper,
    error,
    leftIcon,
    rightIcon,
    className,
    inputClassName,
    fieldSize = "lg",
    id,
    required,
    disabled,
    placeholder,
    value,
    defaultValue,
    ...props
  },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? `tf-${autoId}`;
  const helperId = helper ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const heights = { sm: "h-10", md: "h-11", lg: "h-12" } as const;

  // === LOGIKA STATUS (meniru Select) ===
  const raw = (value ?? defaultValue) as string | number | readonly string[] | undefined;
  const hasValue =
    raw !== undefined &&
    raw !== null &&
    (Array.isArray(raw) ? raw.length > 0 : String(raw).trim() !== "");

  const borderAndRing = error
    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/30 focus-within:border-red-500"
    : `${hasValue ? "border-[#04BF68]" : "border-black/15"} focus-within:ring-2 focus-within:ring-[#04BF68]/30 focus-within:border-[#4FD295]`;

  const textColor = hasValue ? "text-black" : "text-black/80";
  const placeholderColor = hasValue ? "placeholder:text-black/50" : "placeholder:text-black/40";

  return (
    <label className="block" htmlFor={fieldId}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-black">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </span>
      )}

      <div
        className={twMerge(
          // ⬇️ penting: tambahkan "border"
          "flex items-center gap-2 rounded-xl border bg-white px-4",
          heights[fieldSize],
          "transition-all",
          borderAndRing,
          "disabled:bg-gray-50 disabled:text-black/40 disabled:cursor-not-allowed",
          className
        )}
      >
        {leftIcon && (
          <span className={twMerge("text-black/50", disabled && "opacity-50")}>
            {leftIcon}
          </span>
        )}

        <input
          id={fieldId}
          ref={ref}
          className={twMerge(
            "h-full w-full bg-transparent text-sm outline-none",
            textColor,
            placeholderColor,
            "disabled:bg-transparent disabled:text-black/40",
            inputClassName
          )}
          aria-invalid={!!error}
          aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          {...props}
        />

        {rightIcon && (
          <span className={twMerge("text-black/50", disabled && "opacity-50")}>
            {rightIcon}
          </span>
        )}
      </div>

      {helper && !error && (
        <span id={helperId} className="mt-1 block text-xs text-black/60">
          {helper}
        </span>
      )}
      {error && (
        <span id={errorId} className="mt-1 block text-xs text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
});

export default TextField;
