import type { Metadata } from "next";
import { pageHeaders } from "@/content";
import PageHeader from "@/components/ui/PageHeader";
import Skills from "@/components/sections/Skills";
import Research from "@/components/sections/Research";

export const metadata: Metadata = {
  title: pageHeaders.skills.title,
  description: pageHeaders.skills.heading,
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <>
      <PageHeader path="skills" {...pageHeaders.skills} />
      <Skills />
      <Research />
    </>
  );
}
