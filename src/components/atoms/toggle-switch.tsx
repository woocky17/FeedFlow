"use client";

import { ButtonHTMLAttributes } from "react";

interface ToggleSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  className = "",
  disabled,
  ...rest
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-amber-500" : "bg-slate-200"
      } ${className}`}
      {...rest}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
