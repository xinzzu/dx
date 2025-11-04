"use client"; // ✅ Pastikan ini ada di baris paling atas

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type Props = {
  open: boolean;
  message?: string;
  onClose: () => void;
  autoCloseMs?: number; // default 1500ms
};

export default function SuccessDialog({
  open,
  message = "Data Berhasil Tersimpan",
  onClose,
  autoCloseMs = 1500,
}: Props) {
  const [mounted, setMounted] = useState(false);

  // ✅ Panggil useEffect di level atas
  useEffect(() => {
    // Jalankan timer hanya jika dialog 'open'
    if (open) {
      const timer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, autoCloseMs]);

  // Efek untuk menandai bahwa komponen sudah di-mount di client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Jangan render apa pun jika belum di-mount atau dialog tidak 'open'
  if (!mounted || !open) {
    return null;
  }
  
  // Dapatkan elemen root setelah dipastikan berada di client
  const root = document.getElementById("modal-root");
  if (!root) {
      // Beri pesan error jika root tidak ditemukan, ini membantu debugging
      console.error("Elemen #modal-root tidak ditemukan di DOM.");
      return null;
  }

  return createPortal(
    <div
      aria-live="polite"
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] grid place-items-center"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* card */}
      <div
        className="relative z-10 w-[320px] max-w-[88vw] rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ikon cek */}
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full ">
          <Image
            src="/check-badge.svg" // Pastikan path ini benar
            alt="Success"
            width={80}
            height={80}
          />
        </div>

        <p className="text-base font-semibold text-black">{message}</p>
      </div>
    </div>,
    root
  );
}