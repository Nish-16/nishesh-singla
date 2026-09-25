"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks";

/** Re-mounts on every navigation: a short fade/slide between pages. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
