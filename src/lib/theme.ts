export type ThemeName = "light" | "dark";

export interface Palette {
  canvas: string;
  surface: string;
  line: string;
  lineStrong: string;
  ink: string;
  muted: string;
  accent: string;
  second: string;
}

/** Mirrors the CSS variables in globals.css — used by canvas / three.js code, which can't read Tailwind classes. */
export const PALETTES: Record<ThemeName, Palette> = {
  dark: {
    canvas: "#0B0B0B",
    surface: "#151515",
    line: "#262626",
    lineStrong: "#3A3A3A",
    ink: "#F5F5F5",
    muted: "#8A8A8A",
    accent: "#C6F432",
    second: "#D4D4D4",
  },
  light: {
    canvas: "#F4F1EA",
    surface: "#FFFDF8",
    line: "#DCD5C7",
    lineStrong: "#C4BCAC",
    ink: "#161616",
    muted: "#6B6760",
    accent: "#BF4320",
    second: "#2F5D50",
  },
};

export const THEME_STORAGE_KEY = "theme";

/** Runs in <head> before paint: stored choice, else the OS preference. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
