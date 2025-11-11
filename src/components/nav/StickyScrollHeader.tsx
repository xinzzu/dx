// components/StickyScrollHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface StickyScrollHeaderProps {
  title: string;
}

export default function StickyScrollHeader({ title }: StickyScrollHeaderProps) {
  // isVisible: Kontrol apakah header terlihat (transisi ke max-h-0)
  const [isVisible, setIsVisible] = useState(true);
  // lastScrollY: Digunakan untuk membandingkan arah scroll. Dibuat sebagai useRef agar tidak memicu re-render pada setiap perubahan.
  const lastScrollY = useRef(0);

  useEffect(() => {
    // 💡 Gunakan Window untuk mendengarkan scroll halaman
    const handleScroll = () => {
      // 💡 Gunakan window.scrollY (sama dengan window.pageYOffset)
      const currentScrollY = window.scrollY;

      // Logika: Sembunyikan jika scroll ke bawah DAN sudah melewati titik awal (misal 100px)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false); // Scroll ke bawah, sembunyikan
      } else {
        setIsVisible(true);  // Scroll ke atas, tampilkan
      }

      // Update nilai scroll terakhir
      lastScrollY.current = currentScrollY;
    };

    // Pasang event listener pada window
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Bersihkan event listener
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Dependency array kosong: listener dibuat sekali saja

  return (
    <header
      className={`
        text-center border-b border-black/10 shadow-sm 
        h-16 flex items-center justify-center px-4 
        sticky top-0 bg-white z-20 
        transition-all duration-300
        
        ${isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
        }
      `}
    >
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}