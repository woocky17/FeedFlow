import { SVGProps } from "react";

export type IconName =
  | "edit"
  | "trash"
  | "heart"
  | "book"
  | "x"
  | "plus"
  | "check"
  | "compare"
  | "external"
  | "feed"
  | "categories"
  | "sources"
  | "bell"
  | "settings";

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
  external: {
    strokeWidth: 2.5,
    paths: [{ d: "M7 17L17 7M17 7H8M17 7v9" }],
  },
  feed: {
    paths: [
      {
        d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2",
      },
    ],
  },
  categories: {
    paths: [
      {
        d: "M7 7h.01M7 3h5a1.969 1.969 0 011.414.586l7 7a2 2 0 010 2.828l-7 7A2 2 0 0112 21H7a4 4 0 01-4-4V7a4 4 0 014-4z",
      },
    ],
  },
  sources: {
    paths: [
      {
        d: "M4 11a9 9 0 019 9M4 4a16 16 0 0116 16M5 19a1 1 0 100-2 1 1 0 000 2z",
      },
    ],
  },
  bell: {
    paths: [
      {
        d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      },
    ],
  },
  settings: {
    paths: [
      { d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
      { d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
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
