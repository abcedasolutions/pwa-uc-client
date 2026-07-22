import type { ReactNode } from "react";

type KpiColor =
  | "blue"
  | "green"
  | "amber"
  | "emerald"
  | "red"
  | "purple";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  color?: KpiColor;
  tooltip?: string;
}

const colorClasses: Record<
  KpiColor,
  {
    icon: string;
    bg: string;
  }
> = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
  },
};

export function KpiCard({
  title,
  value,
  icon,
  description,
  color = "blue",
  tooltip,
}: KpiCardProps) {
  const styles = colorClasses[color];

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="mt-2 text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2   title={tooltip}
                className="mt-2 text-3xl font-bold text-slate-900 leading-tight">
                {value}         
            </h2>

          {description && (
            <p className="mt-2 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`
            ${styles.bg}
            ${styles.icon}
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            text-2xl
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}