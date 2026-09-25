import { revalidateTag } from "next/cache";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { CONTENT_TAG } from "@/lib/siteContent";

// Google's public keys for Firebase Auth ID tokens.
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

/**
 * Called by /admin after saving: verifies the caller's Firebase ID token belongs to the admin,
 * then invalidates the cached site content so the public page shows the edit immediately.
 */
export async function POST(request: Request) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!projectId || !adminEmail || !token) return Response.json({ ok: false }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    const email = String(payload.email ?? "").toLowerCase();
    if (email !== adminEmail) return Response.json({ ok: false }, { status: 403 });
  } catch {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
