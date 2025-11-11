"use client";

import type { PropsWithChildren } from "react";

export default function SettingsSection({ children }: PropsWithChildren) {
  return (
    <ul
      className="rounded-2xl "
    >
      {children}
    </ul>
  );
}
