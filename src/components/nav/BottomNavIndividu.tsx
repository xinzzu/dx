// src/components/nav/BottomNavIndividu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
  match?: "exact" | "startsWith";
};

export default function BottomNavIndividu({ items = [] as NavItem[] }) {
  const pathname = usePathname() || "/";

  return (
   <nav aria-label="Bottom navigation" className="fixed inset-x-0 bottom-0 z-50">
  <div
    className="
      bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70
      rounded-t-[16px] overflow-hidden
      outline outline-1 outline-[var(--color-primary)] outline-offset-[-1px]
      shadow-[0_-2px_8px_rgba(0,0,0,0.04)]
       md:mx-auto md:max-w-[480px]
    "
    style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
  >
          <ul className="grid grid-cols-5">
            {items.map((it) => {
              const active =
                it.match === "exact"
                  ? pathname === it.href
                  : pathname === it.href || pathname.startsWith(it.href + "/");

              const color = active ? "var(--color-primary)" : "#6B7280"; // abu untuk non-aktif

              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className="flex h-16 flex-col items-center justify-center gap-1 select-none"
                    style={{ color }}
                  >
                    <span
                      aria-hidden
                      className="
                        block h-6 w-6 shrink-0
                        bg-current
                        [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]
                        [-webkit-mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat]
                      "
                      style={{
                        maskImage: `url(${it.iconSrc})`,
                        WebkitMaskImage: `url(${it.iconSrc})`,
                      }}
                    />
                    <span className="text-[11px] leading-none font-medium">
                      {it.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
    </nav>
  );
}
