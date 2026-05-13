export type UserRole = "admin" | "member";
export type TransactionType = "credit" | "debit";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
};

export type MockUser = User & {
  password: string;
};

export type Transaction = {
  id: string;
  userId: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
};

export type AuthResponse<UserShape = User> = {
  token: string;
  user: UserShape;
};

export type ExpensePayload = {
  amount: number;
  description: string;
  date: string;
  category: string;
  type: TransactionType;
};

export type ProfilePayload = Partial<
  Pick<User, "name" | "phone" | "username" | "email" | "avatarUrl"> & {
    password: string;
    oldPassword: string;
  }
>;

export type CreateUserPayload = Pick<User, "name" | "phone" | "username" | "email"> & {
  password: string;
  avatarUrl?: string;
  role?: UserRole;
};

export type TransactionFilters = {
  date: string;
  category: string;
  type: "all" | TransactionType;
  sort: "newest" | "oldest" | "amount-high" | "amount-low";
};
