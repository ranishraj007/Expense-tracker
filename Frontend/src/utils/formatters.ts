import { format, parseISO } from "date-fns";

export const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDate(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
}
