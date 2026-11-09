import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "bordered";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const variants = {
    default:
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs",
    elevated:
      "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-md",
    flat:
      "bg-slate-50 dark:bg-slate-900/60 border-none",
    bordered:
      "bg-transparent border border-slate-200 dark:border-slate-800",
  };

  return (
    <div
      className={twMerge(
        clsx("rounded-xl p-5 transition-all", variants[variant], className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
