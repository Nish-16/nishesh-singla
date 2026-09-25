import { nav } from "@/content";
import Providers from "@/components/Providers";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { getSiteContent } from "@/lib/siteContent.server";

/** Public site shell. Editable content is read from Firestore (cached, refreshed on admin save). */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const content = await getSiteContent();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-on-accent"
      >
        {nav.skip}
      </a>
      <Providers content={content}>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </Providers>
    </>
  );
}
