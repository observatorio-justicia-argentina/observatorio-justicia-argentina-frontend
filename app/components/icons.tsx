// Lightweight inline SVG icons (Lucide-style, MIT-safe).
// Kept inline to avoid adding a runtime dependency.

interface IconProps {
  className?: string;
  "aria-hidden"?: boolean;
}

const base = "shrink-0";

export function ScaleIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

export function FolderIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M6 14v-4m0 4 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function ChartIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

export function SearchIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function AlertIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function XIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function CheckIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function DocumentIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

export function ExternalLinkIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function ChevronDownIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * Stylized silhouette of the Argentine continental mainland.
 * Hand-simplified country outline — wide northern border, Misiones tip,
 * Buenos Aires bulge, narrowing Patagonia, Tierra del Fuego point.
 */
export function ArgentinaIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      className={`${base} ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M13.6 2.2 C 14.6 2.5, 15.6 3.2, 16.4 3.9 L 18.2 4.8 L 17.8 6 L 16.8 6.6 L 17 8 C 17.3 9, 17.8 10, 18 11.1 C 17.4 12.2, 16.2 12.9, 15 13.6 C 14 14.5, 13.4 15.6, 13.4 17 C 13.3 18.4, 13 19.8, 12.7 21.2 L 12.2 22.5 L 11.6 21.3 C 11.2 20, 10.8 18.6, 10.4 17.2 C 10 15.8, 9.7 14.4, 9.8 13 C 10 11.4, 10.2 9.8, 9.7 8.2 C 9.3 6.8, 9.4 5.4, 10.2 4.2 C 11 3.2, 12.2 2.5, 13.6 2.2 Z" />
    </svg>
  );
}
