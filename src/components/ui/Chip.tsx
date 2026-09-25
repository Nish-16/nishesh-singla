export default function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "second" }) {
  const tones = {
    default: "border-line bg-surface-2 text-muted",
    accent: "border-accent/40 bg-accent/5 text-accent",
    second: "border-second/50 bg-second/10 text-second",
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] leading-5 ${tones[tone]}`}>
      {children}
    </span>
  );
}
