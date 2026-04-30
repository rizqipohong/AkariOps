import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type PanelProps = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className }: PanelProps) {
  return <section className={cn("panel", className)}>{children}</section>;
}

