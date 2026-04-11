import { cn } from "@/lib/utils";

export type ProgressBarTone = "emerald" | "sky" | "amber" | "rose" | "violet";
export type ProgressBarSize = "sm" | "md";

type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  label?: string;
  className?: string;
  trackClassName?: string;
};

const TONE_CLASSES: Record<ProgressBarTone, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
};

const SIZE_CLASSES: Record<ProgressBarSize, string> = {
  sm: "h-1",
  md: "h-1.5",
};

export function ProgressBar({
  value,
  max = 100,
  tone = "emerald",
  size = "md",
  label,
  className,
  trackClassName,
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max;
  const clamped = Math.max(0, Math.min(safeMax, value));
  const percent = (clamped / safeMax) * 100;

  return (
    <div
      data-slot="progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-label={label ?? `${Math.round(percent)}% complete`}
      className={cn(
        "w-full overflow-hidden rounded-full bg-muted",
        SIZE_CLASSES[size],
        trackClassName,
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          TONE_CLASSES[tone],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
