"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultValue,
  className
}: {
  tabs: { value: string; label: string; content: ReactNode }[];
  defaultValue?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1 rounded-md bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActive(tab.value)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              active === tab.value ? "bg-background shadow-panel" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs.find((tab) => tab.value === active)?.content}</div>
    </div>
  );
}
