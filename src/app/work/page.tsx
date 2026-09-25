import type { Metadata } from "next";
import { pageHeaders } from "@/content";
import PageHeader from "@/components/ui/PageHeader";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";

export const metadata: Metadata = {
  title: pageHeaders.work.title,
  description: pageHeaders.work.heading,
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHeader path="work" {...pageHeaders.work} />
      <Experience />
      <Projects />
    </>
  );
}
