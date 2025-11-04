"use client"

import { useState } from "react"
// Hapus twMerge jika tidak dipakai, atau gunakan untuk styling
import TextField from "./TextField"

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12s3.5-6 10-6c2.1 0 3.9.6 5.4 1.4M22 12s-3.5 6-10 6c-2.1 0-3.9-.6-5.4-1.4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.88 9.88A3.5 3.5 0 0012 15.5a3.5 3.5 0 002.12-.62" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

type PasswordFieldProps = Omit<React.ComponentProps<typeof TextField>, "type" | "rightIcon"> & {
  fieldSize?: "sm" | "md" | "lg"
  onRevealChange?: (show: boolean) => void
}

export default function PasswordField({
  fieldSize = "lg",
  className,
  autoComplete,
  onRevealChange,
  ...props
}: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  const toggle = () => setShow(s => { const n = !s; onRevealChange?.(n); return n })

  return (
    <TextField
      {...props}
      fieldSize={fieldSize}                       /* ✅ ikut tinggi */
      className={className}
      type={show ? "text" : "password"}
      autoComplete={autoComplete ?? "new-password"}
      rightIcon={
        <button
          type="button"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          onClick={toggle}
          onMouseDown={(e) => e.preventDefault()}
          className="p-2 -m-2 min-w-11 min-h-11 flex items-center justify-center" // ≥44px
        >
          <EyeIcon open={show} />
        </button>
      }
    />
  )
}
