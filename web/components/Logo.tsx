// e4's mark: a pawn on an amber tile. Drawn by hand, a few hundred bytes.
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#ffb020" />
      <g fill="#2a1d06">
        <circle cx="16" cy="9.6" r="4.2" />
        <path d="M12.2 14.6h7.6l-.9 2.2c1.6 1.7 2.6 4.1 2.9 6.7H10.2c.3-2.6 1.3-5 2.9-6.7z" />
        <rect x="8.4" y="23.6" width="15.2" height="3.6" rx="1.8" />
      </g>
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-xl font-black tracking-tight">
        e4<span className="font-extrabold text-muted">.learnchess</span>
      </span>
    </span>
  );
}
