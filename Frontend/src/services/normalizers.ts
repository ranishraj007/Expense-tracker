import type { Transaction, TransactionStatus, TransactionType, User } from "@/types";

export type ApiUser = Omit<User, "role" | "avatarUrl"> & {
  role: string;
  avatarUrl?: string | null;
  profileImage?: string | null;
};

export type ApiExpense = Omit<Transaction, "date" | "dueDate" | "type" | "status"> & {
  date: string;
  dueDate?: string | null;
  type: string;
  status?: string | null;
};

export const normalizeUser = (user: ApiUser): User => ({
  ...user,
  avatarUrl: user.avatarUrl || user.profileImage || "",
  role: user.role.toLowerCase() === "admin" ? "admin" : "member",
});

export const normalizeTransaction = (expense: ApiExpense): Transaction => ({
  ...expense,
  date: expense.date.slice(0, 10),
  dueDate: expense.dueDate ? expense.dueDate.slice(0, 10) : null,
  type: expense.type.toLowerCase() as TransactionType,
  status: (expense.status || "COMPLETED").toLowerCase() as TransactionStatus,
});
