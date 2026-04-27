interface MariaAvatarProps {
  size?: number;
  className?: string;
}

export function MariaAvatar({ size = 96, className = '' }: MariaAvatarProps) {
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
        <clipPath id={`avatarClip${size}`}>
          <circle cx="48" cy="48" r="46" />
        </clipPath>
        <linearGradient id={`bg${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D97E" />
          <stop offset="100%" stopColor="#00A862" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="46" fill={`url(#bg${size})`} />
      <g clipPath={`url(#avatarClip${size})`}>
        <ellipse cx="48" cy="48" rx="22" ry="26" fill="#D4A78C" />
        <path
          d="M22 42 Q22 22 48 18 Q74 22 74 42 L74 60 Q66 50 64 38 Q48 46 32 38 Q30 50 22 60 Z"
          fill="#2E2419"
        />
        <path d="M38 46 Q42 44 46 46" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 46 Q54 44 58 46" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M44 60 Q48 63 52 60" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M30 96 C 33 80, 40 74, 48 74 C 56 74, 63 80, 66 96 Z" fill="#FAFAF7" />
      </g>
    </svg>
  );
}
