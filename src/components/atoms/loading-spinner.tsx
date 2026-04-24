type SpinnerSize = "sm" | "md" | "lg";
type SpinnerColor = "amber" | "slate" | "white";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const colorMap: Record<SpinnerColor, string> = {
  amber: "text-amber-500",
  slate: "text-slate-400",
  white: "text-white",
};

export function LoadingSpinner({ size = "md", color = "amber", className = "" }: LoadingSpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${colorMap[color]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
