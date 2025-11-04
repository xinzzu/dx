"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  paths: string[];
  children: ReactNode;
};

export default function HideOnPaths({ paths, children }: Props) {
  const pathname = usePathname();

  // Check if current path matches any pattern in the list
  const shouldHide = paths.some(pattern => {
    // Exact match
    if (pattern === pathname) {
      return true;
    }
    
    // Pattern match with [id] or other dynamic segments
    // Convert pattern like "/app/profile/manajemen-bangunan/[id]/edit" 
    // to regex like /^\/app\/profile\/manajemen-bangunan\/[^/]+\/edit$/
    const regexPattern = pattern
      .replace(/\[([^\]]+)\]/g, '[^/]+') // Replace [id] with [^/]+ (any chars except /)
      .replace(/\//g, '\\/'); // Escape forward slashes
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });

  if (shouldHide) {
    return null;
  }

  // Jika tidak, render komponen 'children'-nya.
  return <>{children}</>;
}