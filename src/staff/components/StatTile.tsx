import { Card, CardContent } from "@/components/ui/card";

/** A big number with a label, for the money summaries. */
export default function StatTile({
  label,
  value,
  sub,
  strong,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <Card className={`gap-0 py-0 ${strong ? "border-brand/40 bg-brand/5" : ""} ${className}`}>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-brand-dark">{value}</p>
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}
