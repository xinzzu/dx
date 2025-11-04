"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import ProgressLine from "./ProgressLine";

type Props = {
  icon: string;        // PNG path
  title: string;
  desc: string;
  progress?: number;     // 0..1, optional
  progressLabel?: string;
  ctaText?: string;
  onCta?: () => void;
  shareable?: boolean;   // jika true, tombol "Bagikan"
};

export default function ChallengeCard({
  icon,
  title,
  desc,
  progress,
  progressLabel,
  ctaText,
  onCta,
  shareable,
}: Props) {
  return (
    <article
      className="rounded-2xl border p-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl ">
          <Image src={icon} alt="" width={50} height={50} />
        </div>
        <div className="flex-1">
          <h3 className="text-[17px] font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-black/70">{desc}</p>
        </div>
      </div>

      {typeof progress === "number" && (
        <>
          <div className="mt-3">
            <ProgressLine value={progress} />
          </div>
          {progressLabel && (
            <div className="mt-2 text-sm font-medium">{progressLabel}</div>
          )}
        </>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">

        {shareable && (
          <Button size="sm" onClick={() => console.log("Tombol bagikan diklik")}>
            <div className="flex items-center gap-2">
              <Image src="/icons/tantangan/share.svg" alt="" width={16} height={16} />
              <span>Bagikan</span>
            </div>
          </Button>
        )}
        {ctaText && (
          <Button size="sm" onClick={onCta}>
            {ctaText}
          </Button>
        )}
      </div>
    </article>
  );
}