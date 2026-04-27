import { SVGProps } from "react";

export type IconName =
  | "edit"
  | "trash"
  | "heart"
  | "book"
  | "x"
  | "plus"
  | "check"
  | "compare";

interface IconDef {
  viewBox?: string;
  strokeWidth?: number;
  paths: Array<
    | { d: string }
    | { rect: { x: number; y: number; width: number; height: number; rx?: number } }
    | { polyline: string }
  >;
}

const ICONS: Record<IconName, IconDef> = {
  edit: {
    paths: [
      { d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" },
      { d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" },
    ],
  },
  trash: {
    paths: [
      { polyline: "3 6 5 6 21 6" },
      { d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" },
    ],
  },
  heart: {
    paths: [
      {
        d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
      },
    ],
  },
  book: {
    paths: [
      {
        d: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
      },
    ],
  },
  x: {
    paths: [{ d: "M6 18L18 6M6 6l12 12" }],
  },
  plus: {
    paths: [{ d: "M12 5v14M5 12h14" }],
  },
  check: {
    paths: [{ d: "M5 12l5 5L20 7" }],
  },
  compare: {
    strokeWidth: 2.5,
    paths: [
      { rect: { x: 3, y: 4, width: 7, height: 16, rx: 1 } },
      { rect: { x: 14, y: 4, width: 7, height: 16, rx: 1 } },
    ],
  },
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 16, filled = false, className = "", ...rest }: IconProps) {
  const def = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox={def.viewBox ?? "0 0 24 24"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={def.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {def.paths.map((p, i) => {
        if ("d" in p) return <path key={i} d={p.d} />;
        if ("polyline" in p) return <polyline key={i} points={p.polyline} />;
        if ("rect" in p) {
          const { x, y, width, height, rx } = p.rect;
          return <rect key={i} x={x} y={y} width={width} height={height} rx={rx} />;
        }
        return null;
      })}
    </svg>
  );
}
