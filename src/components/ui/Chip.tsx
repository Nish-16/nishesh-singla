export default function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "signal" | "warm" }) {
  const tones = {
    default: "border-line bg-surface-2 text-muted",
    signal: "border-signal/40 bg-signal/5 text-signal",
    warm: "border-warm/50 bg-warm/10 text-warm-bright",
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] leading-5 ${tones[tone]}`}>
      {children}
    </span>
  );
}
