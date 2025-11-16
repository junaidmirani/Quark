export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240">
      <defs>
        <linearGradient id="unigrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c5cff" />
          <stop offset="100%" stopColor="#9cb4ff" />
        </linearGradient>
      </defs>

      {/* <rect x="45" y="45" width="150" height="150" rx="28"
            stroke="rgba(0,0,0,0.1)" strokeWidth="10" fill="none" /> */}

      <path d="M85 75 H155 V135 Q155 165 125 165 H85 Z"
            fill="none" stroke="url(#unigrad)" strokeWidth="12"
            strokeLinecap="round" strokeLinejoin="round" />

      <path d="M105 105 C140 105 140 145 165 155"
            stroke="url(#unigrad)" strokeWidth="6"
            fill="none" strokeLinecap="round" opacity="0.85" />

      <circle cx="165" cy="155" r="7" fill="#4c5cff" opacity="0.9" />
      <circle cx="95" cy="155" r="5" fill="#9cb4ff" opacity="0.8" />
      <circle cx="115" cy="115" r="6" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
