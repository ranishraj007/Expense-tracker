import { useCallback, useEffect, useState } from "react";
import { expenseService } from "@/services/expenseService";
import type { ExpensePayload, Transaction } from "@/types";

export function useExpenses(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTransactions(await expenseService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load expenses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const addExpense = useCallback(
    async (payload: ExpensePayload) => {
      if (!userId) throw new Error("You must be logged in to add an expense.");
      const created = await expenseService.create(payload, userId);
      setTransactions((current) => [created, ...current]);
      return created;
    },
    [userId],
  );

  return { transactions, isLoading, error, reload: loadTransactions, addExpense };
}
