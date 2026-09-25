import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

// Not linked anywhere and kept out of search engines. Access is enforced by email/password sign-in +
// Firestore rules + the /api/revalidate token check — the URL being unlisted is not the protection.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminApp />;
}
