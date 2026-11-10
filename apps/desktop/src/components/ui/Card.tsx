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
      "macos-glass shadow-sm",
    elevated:
      "macos-popup-glass shadow-lg",
    flat:
      "bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50",
    bordered:
      "bg-transparent border border-slate-200/80 dark:border-slate-800/80",
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
