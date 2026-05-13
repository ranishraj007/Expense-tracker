import type { Transaction, TransactionType, User } from "@/types";

export type ApiUser = Omit<User, "role" | "avatarUrl"> & {
  role: string;
  avatarUrl?: string | null;
  profileImage?: string | null;
};

export type ApiExpense = Omit<Transaction, "date" | "type"> & {
  date: string;
  type: string;
};

export const normalizeUser = (user: ApiUser): User => ({
  ...user,
  avatarUrl: user.avatarUrl || user.profileImage || "",
  role: user.role.toLowerCase() === "admin" ? "admin" : "member",
});

export const normalizeTransaction = (expense: ApiExpense): Transaction => ({
  ...expense,
  date: expense.date.slice(0, 10),
  type: expense.type.toLowerCase() as TransactionType,
});
