import * as React from "react";
import { cn, clamp } from "@/lib/utils";

export function Progress({
  value = 0,
  className
}: {
  value?: number;
  className?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full bg-primary transition-all" style={{ width: `${clamp(value, 0, 100)}%` }} />
    </div>
  );
}
