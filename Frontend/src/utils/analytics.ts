import { eachDayOfInterval, endOfYear, format, getMonth, isSameMonth, isSameYear, parseISO, startOfYear, subDays } from "date-fns";
import type { Transaction } from "@/types";

export function buildDailyExpenses(transactions: Transaction[]) {
  const today = new Date();
  const days = eachDayOfInterval({ start: subDays(today, 6), end: today });

  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const total = transactions
      .filter((transaction) => transaction.type === "debit" && transaction.date === key)
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    return {
      day: format(day, "EEE"),
      amount: total,
    };
  });
}

export function buildMonthlyExpenses(transactions: Transaction[]) {
  const now = new Date();
  const months = eachDayOfInterval({ start: startOfYear(now), end: endOfYear(now) })
    .filter((day) => format(day, "d") === "1")
    .map((day) => ({
      month: format(day, "MMM"),
      amount: transactions
        .filter((transaction) => {
          const parsed = parseISO(transaction.date);
          return transaction.type === "debit" && isSameYear(parsed, now) && getMonth(parsed) === getMonth(day);
        })
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    }));

  return months;
}

export function getCurrentMonthTotals(transactions: Transaction[]) {
  const now = new Date();
  return transactions.reduce(
    (totals, transaction) => {
      if (!isSameMonth(parseISO(transaction.date), now)) return totals;
      totals[transaction.type] += Number(transaction.amount);
      return totals;
    },
    { credit: 0, debit: 0 },
  );
}
