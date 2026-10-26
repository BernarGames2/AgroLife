import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-5 sm:p-6", className)} {...props} />;
}

export function Notice({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("rounded-2xl border bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}
