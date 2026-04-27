type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const SIZE: Record<LogoSize, { box: string; svg: number }> = {
  sm: { box: "h-8 w-8 rounded-lg", svg: 18 },
  md: { box: "h-9 w-9 rounded-xl", svg: 20 },
  lg: { box: "h-10 w-10 rounded-xl", svg: 22 },
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  const { box, svg } = SIZE[size];

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 ${box} ${className}`.trim()}
    >
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 11a9 9 0 0 1 9 9" />
        <path d="M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" />
      </svg>
    </div>
  );
}
