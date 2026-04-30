import { cn } from "@/lib/utils";

type StatusChipProps = {
  label: string;
  tone?: "neutral" | "success" | "danger" | "warning";
};

export function StatusChip({ label, tone = "neutral" }: StatusChipProps) {
  return <span className={cn("status-chip", `tone-${tone}`)}>{label}</span>;
}

