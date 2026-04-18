export type TagVariant = "neutral" | "gold" | "success" | "danger" | "warning" | "violet";

const VARIANTS: Record<TagVariant, string> = {
  neutral: "border-border-strong text-cream-muted",
  gold: "border-gold/50 text-gold",
  success: "border-success/50 text-success",
  danger: "border-danger/50 text-danger",
  warning: "border-warning/50 text-warning",
  violet: "border-violet/50 text-violet",
};

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

/**
 * Rubber-stamp metadata badge. Unified rectangular shape, transparent fill,
 * border + text colored by variant, uppercase with tight tracking. Used for
 * province labels, status chips, counts, "FICTICIO" markers, etc.
 */
export function Tag({ children, variant = "neutral", className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border bg-transparent px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
