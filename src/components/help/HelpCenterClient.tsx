"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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

// Komponen Accordion Item Terpisah
const AccordionItem = ({
  item,
  isOpen,
  onToggle,
  query,
}: {
  item: HelpItem;
  isOpen: boolean;
  onToggle: () => void;
  query: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  // Helpers untuk highlight
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlightText = (text: string, q: string) => {
    if (!q) return text;
    try {
      const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
      return text.replace(re, "<mark class='bg-yellow-200 rounded-sm'>$1</mark>");
    } catch {
      return text;
    }
  };
  const stripScripts = (html: string) => {
     if (!html) return html;
     let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
     out = out.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
     out = out.replace(/href\s*=\s*(["'])javascript:[^"']*\1/gi, "");
     return out;
   };
  
  const cleanedAnswer = stripScripts(item.answer || "");
  const highlightedQuestion = highlightText(item.question, query);

  return (
    <li id={item.id} className="border-b border-gray-100 last:border-0">
      <div
        className="group flex w-full cursor-pointer items-center justify-between py-4 text-left"
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
      >
        <span
          className="text-sm font-medium text-gray-900 group-hover:text-[var(--color-primary)] transition-colors pr-4"
          dangerouslySetInnerHTML={{ __html: highlightedQuestion }}
        />
        <div className="flex items-center gap-3 shrink-0">
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180 text-[var(--color-primary)]" : ""
            }`}
          />
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: height, opacity: isOpen ? 1 : 0.5 }}
      >
        <div ref={contentRef} className="pb-4 text-sm text-gray-600 leading-relaxed">
           <div dangerouslySetInnerHTML={{ __html: cleanedAnswer }} className="prose prose-sm max-w-none text-gray-600" />
        </div>
      </div>
    </li>
  );
};

export default function HelpCenterClient({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // open from hash
  useEffect(() => {
    try {
      const h = window.location.hash?.replace(/^#/, "") || null;
      if (h) {
        setOpenId(h);
        setTimeout(() => {
          document.getElementById(h)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSkeleton(false), 220);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter((it) =>
          (it.question + " " + it.answer).toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, query]);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    try {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState({}, document.title, url.toString());
    } catch {}
  };

  return (
    <div className="px-4 pb-20">
      <div className="sticky top-0 z-10 bg-white pb-4 pt-2">
        <div className="relative">
          <input
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
            placeholder="Cari bantuan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showSkeleton ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-12 w-full bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-gray-900 font-medium">Tidak ditemukan</h3>
          <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((cat) => (
            <section key={cat.category_name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                {cat.icon ? (
                  <img src={cat.icon} alt="" className="h-6 w-6 object-contain" />
                ) : (
                  <div className="h-6 w-6 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-[var(--color-primary)] text-xs font-bold">
                    {cat.category_name[0]}
                  </div>
                )}
                <h2 className="font-semibold text-lg text-gray-900">{cat.category_name}</h2>
              </div>
              
              <ul>
                {cat.items.map((it) => (
                  <AccordionItem
                    key={it.id}
                    item={it}
                    isOpen={openId === it.id}
                    onToggle={() => handleToggle(it.id)}
                    query={query}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}