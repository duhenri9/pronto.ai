export function LogoLight() {
  return (
    <div className="flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pronto.IA">
        <rect x="0" y="0" width="120" height="120" rx="32" fill="#00D97E" />
        <circle cx="60" cy="60" r="26" fill="#0B1929" />
      </svg>
      <span className="font-display text-body-m font-medium tracking-heading text-neutral-900">
        Pronto<span className="font-serif italic">.</span>IA
      </span>
    </div>
  );
}
