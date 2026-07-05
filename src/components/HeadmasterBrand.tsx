import { cn } from "@/lib/utils";

export function HeadmasterMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="headmaster-mark-stroke" x1="8" y1="14" x2="58" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1498FF" />
          <stop offset="0.42" stopColor="#7C3AED" />
          <stop offset="0.76" stopColor="#FF2D8F" />
          <stop offset="1" stopColor="#FFB020" />
        </linearGradient>
        <radialGradient id="headmaster-mark-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 32) rotate(90) scale(30)">
          <stop stopColor="#7C3AED" stopOpacity="0.45" />
          <stop offset="1" stopColor="#2563FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#0D0F14" />
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#headmaster-mark-glow)" />
      <path
        d="M18 20L32 12L46 20V44L32 52L18 44V20Z"
        stroke="url(#headmaster-mark-stroke)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 12V52M18 32H27M37 32H46M18 20L27 26V38L18 44M46 20L37 26V38L46 44"
        stroke="url(#headmaster-mark-stroke)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="20" r="4.2" fill="#1498FF" />
      <circle cx="18" cy="44" r="4.2" fill="#1498FF" />
      <circle cx="32" cy="12" r="4.2" fill="#4D5DFF" />
      <circle cx="32" cy="52" r="4.2" fill="#7C3AED" />
      <circle cx="46" cy="20" r="4.2" fill="#FF2D8F" />
      <circle cx="46" cy="44" r="4.2" fill="#FF7A3D" />
      <circle cx="32" cy="32" r="6.2" fill="#0D0F14" stroke="url(#headmaster-mark-stroke)" strokeWidth="3" />
    </svg>
  );
}

export function HeadmasterLockup({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <HeadmasterMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <div className="min-w-0">
        <div className="font-display text-[0.92rem] font-semibold uppercase tracking-[0.28em] text-foreground">
          Headmaster<span className="brand-gradient-text tracking-[0.12em]">UI</span>
        </div>
        {!compact && <div className="brand-gradient-text text-[0.64rem] font-semibold uppercase tracking-[0.55em]">AI Interface</div>}
      </div>
    </div>
  );
}
