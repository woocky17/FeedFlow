import { LabelHTMLAttributes } from "react";

export function Label({ children, className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
}
