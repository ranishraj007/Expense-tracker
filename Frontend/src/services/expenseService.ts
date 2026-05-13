import api from "@/services/api";
import { mockApi } from "@/services/mockApi";
import { type ApiExpense, normalizeTransaction } from "@/services/normalizers";
import { type ApiEnvelope, unwrapApiData } from "@/services/response";
import type { ExpensePayload, Transaction } from "@/types";

const useMock = import.meta.env.VITE_USE_MOCK_API === "true";

export const expenseService = {
  async list(options?: { all?: boolean }): Promise<Transaction[]> {
    if (useMock) return mockApi.getTransactions();

    const { data } = await api.get<ApiEnvelope<ApiExpense[]> | ApiExpense[]>("/expenses", {
      params: options?.all ? { all: "true" } : undefined,
    });
    return unwrapApiData(data).map(normalizeTransaction);
  },

  async listAll(): Promise<Transaction[]> {
    return this.list({ all: true });
  },

  async create(payload: ExpensePayload, userId: string): Promise<Transaction> {
    if (useMock) return mockApi.addTransaction(payload, userId);

    const { data } = await api.post<ApiEnvelope<ApiExpense> | ApiExpense>("/expenses", payload);
    return normalizeTransaction(unwrapApiData(data));
  },
};
