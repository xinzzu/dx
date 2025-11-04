"use client";

import clsx from "clsx";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  onCta: () => void;
  variant?: "primary" | "neutral";
  illustration?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  /** warna/bg frame ikon (opsional) */
  imageBg?: string; // contoh: "bg-[#D8F4E6]" atau "bg-emerald-100"
  className?: string;
};

function IconFrame({
  children,
  bgClass = "bg-[#D8F4E6]", // mint lembut default (seperti screenshot)
}: { children: ReactNode; bgClass?: string }) {
  return (
    <div
      className={clsx(
        "relative grid h-16 w-16 place-items-center shrink-0",
        // radius besar ala iOS app icon
        "rounded-[26%]",
        bgClass,
        // ring & inner highlight agar terasa emboss
        "ring-1 ring-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,.75),0_4px_12px_rgba(0,0,0,.10)]"
      )}
    >
      {/* kilau lembut di atas */}
      <div className="pointer-events-none absolute inset-0 rounded-[26%]
                      bg-[radial-gradient(80%_55%_at_50%_0%,rgba(255,255,255,.35),transparent_60%)]" />
      {children}
    </div>
  );
}

export default function ShortcutCard({
  title,
  subtitle,
  ctaLabel,
  onCta,
  variant = "primary",
  illustration,
  imageSrc,
  imageAlt = "illustration",
  imageBg,
  className,
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <section
      className={clsx(
        "rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,.08)]",
        isPrimary
          ? "text-white bg-[linear-gradient(135deg,#04BF68_0%,#22D3A8_60%,#34D399_100%)]"
          : "text-black bg-white border border-black/10",
        className
      )}
    >
      {/* Header: ikon kiri + teks kanan */}
      <div className="flex items-start gap-3">
        {(illustration || imageSrc) && (
          <IconFrame bgClass={imageBg}>
            {illustration ? (
              illustration
            ) : (
              <Image
                src={imageSrc!}
                alt={imageAlt}
                width={48}
                height={48}
                // sedikit membulat agar menyatu dengan frame
                className="rounded-[18%] object-cover"
                priority
              />
            )}
          </IconFrame>
        )}

        <div className="min-w-0">
          <h3 className={clsx("font-semibold", isPrimary ? "text-xl" : "text-lg")}>
            {title}
          </h3>
          {subtitle ? (
            <p className={clsx("mt-1 leading-snug", isPrimary ? "text-white/90" : "text-black/70")}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {/* CTA card putih di bawah */}
      <div className={clsx("mt-4 rounded-xl", isPrimary ? "bg-white/15 p-2" : undefined)}>
        <Button
          type="button"
          size="lg"
          onClick={onCta}
          className={clsx(
            "w-full rounded-xl shadow-sm",
            isPrimary
              ? "!bg-white !text-[color:var(--color-primary,#10B981)] hover:!bg-white/95"
              : "border border-black/10"
          )}
        >
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
