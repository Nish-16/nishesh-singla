import "server-only";
import { CONTENT_COLLECTION, CONTENT_DOC, CONTENT_TAG, defaultContent, parseContentJson, type SiteContent } from "./siteContent";

/**
 * Reads the content document via the Firestore REST API (public read, see firestore.rules).
 * Cached and tagged so /api/revalidate can refresh it right after an admin save.
 * Any failure (not configured, doc missing, network) falls back to the defaults in content.ts.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId) return defaultContent;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${CONTENT_COLLECTION}/${CONTENT_DOC}${apiKey ? `?key=${apiKey}` : ""}`;
  try {
    const res = await fetch(url, { cache: "force-cache", next: { tags: [CONTENT_TAG], revalidate: 3600 } });
    if (!res.ok) return defaultContent;
    const doc = (await res.json()) as { fields?: { data?: { stringValue?: string } } };
    const json = doc.fields?.data?.stringValue;
    return json ? parseContentJson(json) : defaultContent;
  } catch {
    return defaultContent;
  }
}
