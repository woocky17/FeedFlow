import { HTMLAttributes } from "react";
import { cardClassName } from "@/components/atoms/card";

type EntityRowProps = HTMLAttributes<HTMLDivElement>;

export function EntityRow({ className = "", ...rest }: EntityRowProps) {
  return (
    <div
      className={cardClassName({
        variant: "interactive",
        radius: "xl",
        padding: "none",
        extra: `flex items-center justify-between px-4 py-3 ${className}`,
      })}
      {...rest}
    />
  );
}
