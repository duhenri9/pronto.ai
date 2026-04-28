interface MariaAvatarProps {
  size?: number;
  className?: string;
}

export function MariaAvatar({ size = 96, className = '' }: MariaAvatarProps) {
  const id = `maria-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Maria, mentora do Pronto.IA"
      className={className}
    >
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="48" cy="48" r="46" />
        </clipPath>
        <linearGradient id={`skin-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4A78C" />
          <stop offset="100%" stopColor="#B5876A" />
        </linearGradient>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D97E" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FFD60A" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="46" fill={`url(#bg-${id})`} />
      <g clipPath={`url(#clip-${id})`}>
        {/* Shoulders / Blouse */}
        <path d="M16 96 C 20 72, 32 64, 48 64 C 64 64, 76 72, 80 96 Z" fill="#FAFAF7" />
        {/* Neck */}
        <path d="M42 62 L42 68 Q48 72 54 68 L54 62 Z" fill={`url(#skin-${id})`} stroke="#0A0A0A" strokeWidth="0.8" />
        {/* Hair back */}
        <path d="M22 52 Q22 18 48 14 Q74 18 74 52 L74 80 Q68 70 66 58 Q48 66 30 58 Q28 70 22 80 Z" fill="#2E2419" />
        {/* Face */}
        <ellipse cx="48" cy="54" rx="21" ry="25" fill={`url(#skin-${id})`} stroke="#0A0A0A" strokeWidth="1" />
        {/* Hair front */}
        <path d="M27 44 Q30 30 40 26 Q52 22 65 32 Q69 38 68 52 Q58 44 52 44 Q40 44 30 52 Q27 48 27 44 Z" fill="#2E2419" />
        {/* Eyebrows */}
        <path d="M37 48 Q41 46 45 48" fill="none" stroke="#0A0A0A" strokeWidth="1" strokeLinecap="round" />
        <path d="M51 48 Q55 46 59 48" fill="none" stroke="#0A0A0A" strokeWidth="1" strokeLinecap="round" />
        {/* Eyes (closed-smile style) */}
        <path d="M36 54 Q40 56 44 54" fill="none" stroke="#0A0A0A" strokeWidth="1" strokeLinecap="round" />
        <path d="M52 54 Q56 56 60 54" fill="none" stroke="#0A0A0A" strokeWidth="1" strokeLinecap="round" />
        {/* Nose */}
        <path d="M48 58 Q47 62 49 63" fill="none" stroke="#0A0A0A" strokeWidth="0.7" strokeLinecap="round" />
        {/* Mouth - gentle smile */}
        <path d="M42 68 Q48 72 54 68" fill="none" stroke="#0A0A0A" strokeWidth="0.9" strokeLinecap="round" />
        {/* Cheek blush */}
        <ellipse cx="37" cy="63" rx="3.5" ry="2" fill="#E8A089" opacity="0.5" />
        <ellipse cx="59" cy="63" rx="3.5" ry="2" fill="#E8A089" opacity="0.5" />
        {/* Earrings - gold accent */}
        <circle cx="28" cy="60" r="1.2" fill="#FFD60A" stroke="#0A0A0A" strokeWidth="0.4" />
        <circle cx="68" cy="60" r="1.2" fill="#FFD60A" stroke="#0A0A0A" strokeWidth="0.4" />
        {/* Collar accent */}
        <path d="M42 68 L48 74 L54 68" fill="none" stroke="#0A0A0A" strokeWidth="0.8" strokeLinejoin="round" />
        {/* Subtle green pin (brand connection) */}
        <circle cx="62" cy="80" r="2.5" fill="#00D97E" stroke="#0A0A0A" strokeWidth="0.6" />
      </g>
    </svg>
  );
}
