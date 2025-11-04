import { ComponentPropsWithoutRef, forwardRef } from "react";

interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium mb-2 text-black"
          >
            {label}
            {props.required && <span className="text-rose-600"> *</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={[
              "w-full px-4 py-3 rounded-xl border bg-white text-black appearance-none transition-all",
              "focus:outline-none focus:ring-2",
              // Jika error -> merah, else jika sudah ada value -> border primary, else default border
              error
                ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                : `${
                    props.value ? "border-[#04BF68]" : "border-black/15"
                  } focus:ring-[#04BF68]/30 focus:border-[#4FD295]`,
              "disabled:bg-gray-50 disabled:text-black/40 disabled:cursor-not-allowed",
              props.value ? "text-black" : "text-black/40",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          >
            <option value="" disabled>
              {placeholder || "Pilih opsi"}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-black/50"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
