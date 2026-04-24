import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <p className="text-slate-400">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-300">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
