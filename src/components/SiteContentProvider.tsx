"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultContent, type SiteContent } from "@/lib/siteContent";

const SiteContentContext = createContext<SiteContent>(defaultContent);

/** Provides the editable content (fetched on the server in the root layout) to client components. */
export function SiteContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export const useSiteContent = () => useContext(SiteContentContext);
