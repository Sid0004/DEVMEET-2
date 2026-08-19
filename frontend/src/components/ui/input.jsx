import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-0 text-sm text-neutral-900 dark:text-white transition-colors outline-none leading-none flex items-center placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
