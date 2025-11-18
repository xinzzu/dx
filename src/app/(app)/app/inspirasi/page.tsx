"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ScrollContainer from '@/components/nav/ScrollContainer';
import { ChevronLeft } from 'lucide-react';
import { toast } from "sonner";

type Article = {
    id: string | number;
    title: string;
    description: string;
    bannerSrc: string;
    source?: string;
};

const ALL_ARTICLES: Article[] = [
    {
        id: 1,
        title: "5 Tips Menghemat Listrik di Rumah",
        description: "Langkah mudah kurangi tagihan dan jejak karbon. Mulai hari ini!",
        bannerSrc: "/images/banner.png",
        source: "GreenTech Blog",
    },
    {
        id: 2,
        title: "Diet Plant-Based dan Jejak Karbon",
        description: "Pahami hubungan antara makanan dan emisi yang Anda hasilkan.",
        bannerSrc: "/images/banner.png",
        source: "CarbonWise",
    },
    {
        id: 3,
        title: "Transportasi Umum: Pilihan Pintar",
        description: "Mengapa beralih ke bus atau KRL adalah keputusan terbaik.",
        bannerSrc: "/images/banner.png",
        source: "Urban Living",
    },
    {
        id: 4,
        title: "Daur Ulang Sampah Elektronik",
        description: "Jelajahi cara membuang perangkat lama dengan benar.",
        bannerSrc: "/images/banner.png",
        source: "Tech Planet",
    },
];

const ArticleCard = ({ article }: { article: Article }) => {
    const router = useRouter();

    const onArticleClick = () => {
        toast.info(`Membuka artikel: ${article.title}. Detail halaman belum siap.`);
    };

    return (
        <article
            key={article.id}
            onClick={onArticleClick}
            className="rounded-2xl p-3 shadow-lg transition-all cursor-pointer hover:shadow-xl bg-white"
        >
            <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
                <Image
                    src={article.bannerSrc}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                />
            </div>
            <h3 className="font-semibold text-base mb-1">{article.title}</h3>
            <p className="text-sm text-black/70">{article.description}</p>
            {article.source && (
                <p className="text-xs text-gray-500 mt-2">Sumber: {article.source}</p>
            )}
        </article>
    );
};


export default function InspirasiPage() {
    const router = useRouter();
    const articles = useMemo(() => ALL_ARTICLES, []);

    return (
        <ScrollContainer
            headerTitle="Inspirasi & Wawasan"
            leftContainer={
                <button
                    onClick={() => router.back()}
                    aria-label="Kembali"
                    className="h-9 w-9 grid place-items-center text-black"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            }
        >
            <div className="mx-auto max-w-lg pb-10">
                <p className="mb-6 text-base text-black/70">
                    Temukan langkah-langkah praktis dan wawasan mendalam untuk mengurangi jejak karbon Anda.
                </p>

                <div className="space-y-6">
                    {articles.map((a) => (
                        <ArticleCard key={a.id} article={a} />
                    ))}
                </div>
            </div>
        </ScrollContainer>
    );
}