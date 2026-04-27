interface ErrorTextProps {
  message?: string;
  className?: string;
}

export function ErrorText({ message, className = "" }: ErrorTextProps) {
  if (!message) return null;

  return <p className={`text-sm text-red-500 ${className}`.trim()}>{message}</p>;
}
