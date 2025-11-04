"use client";

import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
} from "react";

type PhoneInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "onChange"> & {
  label?: string;
  error?: string;
  prefix?: string;            // default +62 (hanya tampilan)
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onValueChange?: (value: string) => void; // handler value-only (disarankan)
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // opsional utk kompatibilitas
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    { label, error, className = "", prefix = "+62", leftIcon, rightIcon, onValueChange, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="mb-2 block text-sm font-medium text-black">
            {label}
          </label>
        )}

        <div
          className={[
            "flex h-12 items-center gap-2 rounded-xl border px-4 transition-all",
            error
              ? "border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30"
              : "border-black/15 focus-within:border-[color:var(--color-primary)] focus-within:ring-2 focus-within:ring-[color:var(--color-primary)]/30",
            className,
          ].join(" ")}
        >
          {leftIcon && <span className="text-black/60">{leftIcon}</span>}

          <span className="select-none text-sm font-medium text-black/60">
            {prefix}
          </span>

          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            pattern="\d*"
            className="h-full flex-1 bg-transparent text-sm text-black placeholder:text-black/40 outline-none"
            {...props}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              onValueChange?.(digits);
              props.onChange?.({
                ...e,
                target: { ...e.target, value: digits },
                currentTarget: { ...e.currentTarget, value: digits },
              } as unknown as React.ChangeEvent<HTMLInputElement>);
            }}
          />

          {rightIcon && <span className="text-black/60">{rightIcon}</span>}
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;