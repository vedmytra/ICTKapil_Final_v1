import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("glass-card rounded-card p-5", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-grey">{label}</span>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      {delta && (
        <span className={cn("text-xs font-medium", positive ? "text-profit" : "text-loss")}>
          {delta}
        </span>
      )}
    </Card>
  );
}
