import { ComponentPropsWithoutRef } from "react"

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "outline" | "ghost" | "danger"
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
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:shadow-md"

  const variants = {
    primary: "bg-[#22C55E] text-white hover:opacity-95 focus:ring-[#22C55E]/40",
    outline: "border border-[#22C55E] bg-white text-black hover:bg-black/[0.03] focus:ring-black/15",
    ghost: "text-black hover:bg-black/[0.04] focus:ring-black/15",

    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/40",
  }

  const sizes = {
    sm: "h-10 px-4",
    md: "h-11 px-5",
    lg: "h-12 px-6",
  }

  const classNames = [
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  ]
    .filter(Boolean)
    .join(" ")

  return <button className={classNames} {...props} />
}

export { Button };