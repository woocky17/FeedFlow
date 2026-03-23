interface ErrorTextProps {
  message?: string;
}

export function ErrorText({ message }: ErrorTextProps) {
  if (!message) return null;

  return <p className="text-sm text-red-500">{message}</p>;
}
