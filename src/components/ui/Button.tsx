import { ComponentPropsWithoutRef } from "react"

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "bg-[#22C55E] text-white hover:opacity-95 focus:ring-[#22C55E]/40",
    outline: "border border-[#22C55E] bg-white text-black hover:bg-black/[0.03] focus:ring-black/15",
    ghost: "text-black hover:bg-black/[0.04] focus:ring-black/15",
  }
  
  const sizes = {
    sm: "h-10 px-4",
    md: "h-11 px-5",
    lg: "h-12 px-6",
  }

  // Method paling reliable untuk avoid hydration mismatch
  const classNames = [
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full", // Gunakan && instead of ternary
    className
  ]
    .filter(Boolean) // Remove falsy values (false, "", undefined, null)
    .join(" ")

  return <button className={classNames} {...props} />
}

export { Button };