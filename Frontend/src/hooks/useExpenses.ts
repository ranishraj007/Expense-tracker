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

  const updateExpense = useCallback(async (transactionId: string, payload: ExpensePayload) => {
    const updated = await expenseService.update(transactionId, payload);
    setTransactions((current) => current.map((transaction) => (transaction.id === transactionId ? updated : transaction)));
    return updated;
  }, []);

  const deleteExpense = useCallback(async (transactionId: string) => {
    const deletedId = await expenseService.remove(transactionId);
    setTransactions((current) => current.filter((transaction) => transaction.id !== deletedId));
    return deletedId;
  }, []);

  return { transactions, isLoading, error, reload: loadTransactions, addExpense, updateExpense, deleteExpense };
}
