import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return <select className={cn("h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10", className)} {...props}>{children}</select>;
}
