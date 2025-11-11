// components/ScrollContainer.tsx
"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface ScrollContainerProps {
  headerTitle: string;
  headerSubTitle?: string;
  children: ReactNode;
  leftContainer?: ReactNode;
  rightContainer?: ReactNode;
  showBottomLine?: boolean;
}

export default function ScrollContainer({
  headerTitle,
  headerSubTitle,
  children,
  leftContainer,
  rightContainer,
  showBottomLine
}: ScrollContainerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll ke bawah
        setIsVisible(false);
      } else {
        // Scroll ke atas
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div
      ref={containerRef}
      className={showBottomLine ? 'mx-auto max-w-lg px-4 pb-[88px] pt-6' : "h-full w-full overflow-y-auto"}
    >
      <header
        className={`
        sticky top-0 bg-white z-10 h-auto overflow-hidden 
        ${showBottomLine
            ? 'text-center justify-center'
            : 'flex items-center justify-between px-4 py-2 border-b border-black/10'
          }
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      >
        {showBottomLine ? (
          <>
            <h1 className="text-2xl font-semibold text-black">
              {headerTitle}
            </h1>

            <p className="mt-1 text-sm text-black/60">
              {headerSubTitle}
            </p>
            <div
              className="mx-auto mt-2 h-[2px] w-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
          </>
        ) : (
          <>
            <div className="flex items-center w-1/4">
              {leftContainer}
            </div>
            <h1 className="text-l font-semibold text-gray-800 text-center flex-1">
              {headerTitle}
            </h1>

            <div className="flex items-center justify-end w-1/4">
              {rightContainer}
            </div>
          </>
        )}
      </header>

      <main className="p-4 text-gray-800">
        {children}
      </main>
    </div>
  );
}