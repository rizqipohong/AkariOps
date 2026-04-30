export function cn(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

export function titleCase(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

