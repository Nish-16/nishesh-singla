import type { Metadata } from "next";
import { pageHeaders } from "@/content";
import PageHeader from "@/components/ui/PageHeader";
import Contact from "@/components/sections/Contact";
import TerminalSection from "@/components/sections/TerminalSection";

export const metadata: Metadata = {
  title: pageHeaders.contact.title,
  description: pageHeaders.contact.heading,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader path="contact" {...pageHeaders.contact} />
      <Contact />
      <TerminalSection />
    </>
  );
}
