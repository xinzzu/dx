import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan | 1000 Cahaya",
  description: "Syarat dan ketentuan penggunaan platform 1000 Cahaya.",
};

type LegalDocResponse = {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: {
    content: string;
    published_at: string;
    title: string;
    version: string;
  };
};

async function getTermsData(): Promise<LegalDocResponse["data"] | null> {
  try {
    const res = await fetch(
      "https://cahayamu.id/api/v1/legal-docs/TERMS_CONDITIONS",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const json = (await res.json()) as LegalDocResponse;
    return json.data;
  } catch (error) {
    return null;
  }
}

// Helper untuk memecah HTML menjadi array section
function parseSections(htmlContent: string) {
  const parts = htmlContent.split(/(?=<p[^>]*>\s*\d+\.)/g);

  return parts
    .map((part) => {
      const endOfTitleIndex = part.indexOf("</p>");
      if (endOfTitleIndex === -1) return null;

      const titleHtml = part.substring(0, endOfTitleIndex + 4);
      const bodyHtml = part.substring(endOfTitleIndex + 4);
      const titleText = titleHtml.replace(/<[^>]+>/g, "").trim();

      return {
        title: titleText,
        content: bodyHtml,
      };
    })
    .filter((item) => item !== null && item.title !== "" && item.content.trim() !== "");
}

// 1. Definisikan Props untuk menangkap searchParams (Next.js 15 Style)
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SyaratKetentuanPage(props: Props) {
  // 2. Ambil data dan parameter secara paralel
  const dataPromise = getTermsData();
  const paramsPromise = props.searchParams;
  
  const [data, searchParams] = await Promise.all([dataPromise, paramsPromise]);

  // 3. Tentukan link kembali. Jika ada 'backTo', gunakan itu. Jika tidak, ke "/"
  const backTo = (searchParams?.backTo as string) || "/";

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-white rounded-full shadow-sm">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Gagal memuat dokumen
          </h1>
          <Link
            href={backTo} // Gunakan variabel dinamis
            className="inline-block text-sm text-emerald-600 font-medium hover:underline"
          >
            &larr; Kembali
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = data.published_at
    ? format(new Date(data.published_at), "d MMMM yyyy", { locale: id })
    : "-";

  const sections = parseSections(data.content);

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-50/60 to-transparent -z-10 pointer-events-none" />

      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={backTo} // Gunakan variabel dinamis di sini juga
            className="group flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">
              Kembali
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-1000-cahaya.svg"
              alt="Logo 1000 Cahaya"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-bold text-gray-900 tracking-tight">
              1000 Cahaya
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 ring-4 ring-gray-50">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {data.title}
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Harap baca dokumen ini dengan saksama untuk memahami hak,
              kewajiban, dan ketentuan penggunaan layanan kami.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500 pt-2">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-gray-700">
                Versi {data.version}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-gray-700">
                Diperbarui {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Content Cards List */}
        <div className="space-y-6 relative">
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-emerald-100/50 hidden md:block -z-10" />

            {sections.map((section, idx) => (
            <article
              key={idx}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50/80 select-none pointer-events-none z-0 group-hover:text-emerald-50/50 transition-colors">
                {idx + 1}
              </div>

              <div className="relative z-10 p-6 sm:p-8 flex gap-6 md:gap-8">
                <div className="hidden md:flex flex-col items-center shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-colors duration-300">
                        {idx + 1}
                    </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold border border-emerald-100">
                        {idx + 1}
                    </span>
                    {section?.title.replace(/^\d+\.\s*/, "")}
                  </h2>
                  
                  <div
                    className="
                      prose prose-emerald max-w-none
                      prose-p:text-gray-600 prose-p:leading-relaxed
                      prose-li:text-gray-600
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                    "
                    dangerouslySetInnerHTML={{ __html: section?.content || "" }}
                  />
                </div>
              </div>
            </article>
          ))}

          {sections.length === 0 && (
             <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div 
                    className="prose prose-emerald max-w-none"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
             </article>
          )}
        </div>

        <div className="mt-16 border-t border-gray-200 pt-8 text-center space-y-6">
          <div className="flex justify-center">
             <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Terima kasih telah membaca</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
                Dokumen ini dibuat untuk melindungi hak Anda dan memastikan layanan kami berjalan dengan baik.
            </p>
          </div>
          <div className="text-xs text-gray-400 pt-4">
            &copy; {new Date().getFullYear()} 1000 Cahaya. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </main>
    </div>
  );
}