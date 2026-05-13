import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "credit" | "debit" | "muted";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary",
    credit: "bg-emerald-100 text-emerald-700",
    debit: "bg-rose-100 text-rose-700",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  );
}
