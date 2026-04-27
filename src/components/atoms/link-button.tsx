import Link from "next/link";
import { ComponentProps } from "react";
import { buttonClassName, ButtonSize, ButtonVariant } from "./button";

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function LinkButton({
  variant,
  size,
  className = "",
  ...rest
}: LinkButtonProps) {
  return <Link className={buttonClassName({ variant, size, extra: className })} {...rest} />;
}
