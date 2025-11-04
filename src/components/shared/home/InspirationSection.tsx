"use client";

import Image from "next/image";

type Article = {
  id: string | number;
  title: string;
  description: string;
  bannerSrc: string;
};

type Props = {
  articles: Article[];
  onSeeAll?: () => void;
};

export default function InspirationSection({ articles, onSeeAll }: Props) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/images/inspirasi.png" alt="" width={24} height={24} />
          <h2 className="text-base font-semibold">Inspirasi & Wawasan</h2>
        </div>
        <button
          className="text-sm text-[color:var(--color-primary)]"
          onClick={onSeeAll}
        >
          Lihat Semua
        </button>
      </div>

      {articles.map((a) => (
        <article
          key={a.id}
          className="rounded-2xl p-3 shadow-lg "
          
        >
          <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={a.bannerSrc}
              alt={a.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <h3 className="font-semibold">{a.title}</h3>
          <p className="text-sm text-black/60">{a.description}</p>
        </article>
      ))}
    </section>
  );
}
