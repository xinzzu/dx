import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollContainer from "@/components/nav/ScrollContainer";
import HelpCenterClient from "@/components/help/HelpCenterClient";

type RawHelpCategory = {
  category_name: string;
  icon?: string;
  items?: Array<{ question: string; answer: string; id?: string }>;
};

type HelpItem = {
  id: string;
  question: string;
  answer: string;
};

type Category = {
  category_name: string;
  icon?: string;
  items: HelpItem[];
};

// 1. Definisi Props untuk Search Params (Next.js 15)
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function makeId(base: string, idx: number) {
  return `${base.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${idx}`;
}

export default async function HelpCenterPage(props: Props) {
  // 2. Ambil searchParams
  const searchParams = await props.searchParams;
  
  // 3. Tentukan link kembali (default ke "/" jika tidak ada param)
  const backTo = (searchParams?.backTo as string) || "/";

  // Try relative API path first (works for client-side and some Next server setups).
  // If Node/Server environment rejects relative URLs, fall back to the absolute
  // public API endpoint so the page still loads.
  let res: Response | null = null;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://cahayamu.id/api/v1"}/help-center`, { cache: "no-store" });
  } catch (e) {
    // Fallback jika fetch gagal
    console.error("Help center fetch error:", e);
    res = null;
  }

  // Jika fetch gagal atau response tidak ok
  if (!res || !res.ok) {
    return (
      <ScrollContainer
        headerTitle="Pusat Bantuan"
        leftContainer={
          <Link href={backTo} aria-label="Kembali" className="h-9 w-9 grid place-items-center">
            <Image src="/arrow-left.svg" alt="" width={18} height={18} />
          </Link>
        }
      >
        <main className="bg-white text-black mx-auto max-w-2xl py-6 min-h-screen">
          <div className="mt-8 text-center text-gray-500">Gagal memuat Pusat Bantuan.</div>
        </main>
      </ScrollContainer>
    );
  }

  const payload = await res.json();
  // backend may return either array or { data: [...] }
  const raw: RawHelpCategory[] = Array.isArray(payload)
    ? (payload as RawHelpCategory[])
    : Array.isArray(payload?.data)
    ? (payload.data as RawHelpCategory[])
    : [];

  const categories: Category[] = raw.map((cat, cIdx) => ({
    category_name: cat.category_name,
    icon: cat.icon,
    items: (cat.items ?? []).map((it, idx) => ({ 
      id: it.id ?? makeId(cat.category_name + "-" + it.question, idx), 
      question: it.question, 
      answer: it.answer 
    })),
  }));

  return (
    <ScrollContainer
      headerTitle="Pusat Bantuan"
      leftContainer={
        <Link href={backTo} aria-label="Kembali" className="h-9 w-9 grid place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </Link>
      }
    >
      <main className="bg-white text-black mx-auto max-w-2xl py-6 min-h-screen">
        {/* Delegate interactive behavior (search, accordion, sanitization) to a client component */}
        <HelpCenterClient categories={categories} />
      </main>
    </ScrollContainer>
  );
}