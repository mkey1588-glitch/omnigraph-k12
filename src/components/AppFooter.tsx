"use client";

import React from "react";
import { usePlatform } from "./PlatformProvider";
import { FOOTER_COPY } from "@/lib/i18n/ui-common";

export function AppFooter() {
  const { pick } = usePlatform();

  return (
    <footer className="no-print border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-2">
        <span>{pick(FOOTER_COPY.left)}</span>
        <span>{pick(FOOTER_COPY.right)}</span>
      </div>
    </footer>
  );
}
