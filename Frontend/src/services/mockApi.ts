import { mockTransactions, mockUsers } from "@/data/mockData";
import type { AuthResponse, CreateUserPayload, ExpensePayload, MockUser, ProfilePayload, Transaction, User } from "@/types";

const delay = <T,>(value: T, ms = 250) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

let users: MockUser[] = [...mockUsers];
let transactions: Transaction[] = [...mockTransactions];

const sanitizeUser = (mockUser: MockUser): User => {
  const user = { ...mockUser };
  delete (user as Partial<MockUser>).password;
  return user;
};

export const mockApi = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const user = users.find(
      (candidate) =>
        (candidate.username.toLowerCase() === identifier.toLowerCase() ||
          candidate.email.toLowerCase() === identifier.toLowerCase()) &&
        candidate.password === password,
    );

    if (!user) {
      throw new Error("Username/email or password is incorrect.");
    }

    return delay({
      token: `mock-jwt-${user.id}-${Date.now()}`,
      user: sanitizeUser(user),
    });
  },

  async getUsers(): Promise<User[]> {
    return delay(users.map(sanitizeUser));
  },

  async updateProfile(userId: string, payload: ProfilePayload): Promise<User> {
    users = users.map((user) => (user.id === userId ? { ...user, ...payload } : user));
    const updated = users.find((user) => user.id === userId);
    if (!updated) throw new Error("User not found.");
    return delay(sanitizeUser(updated));
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    if (users.some((user) => user.username === payload.username || user.email === payload.email)) {
      throw new Error("A user with that username or email already exists.");
    }

    const created: MockUser = {
      ...payload,
      id: `u-${Date.now()}`,
      role: payload.role || "member",
      avatarUrl:
        payload.avatarUrl ||
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
    };
    users = [created, ...users];
    return delay(sanitizeUser(created));
  },

  async deleteUser(userId: string): Promise<void> {
    const target = users.find((user) => user.id === userId);
    if (!target) throw new Error("User not found.");
    if (target.role === "admin") throw new Error("The admin account cannot be deleted.");

    users = users.filter((user) => user.id !== userId);
    transactions = transactions.filter((transaction) => transaction.userId !== userId);
    return delay(undefined);
  },

  async getTransactions(): Promise<Transaction[]> {
    return delay([...transactions].sort((a, b) => b.date.localeCompare(a.date)));
  },

  async addTransaction(payload: ExpensePayload, userId: string): Promise<Transaction> {
    const transaction = {
      ...payload,
      userId,
      amount: Number(payload.amount),
      id: `t-${Date.now()}`,
    };
    transactions = [transaction, ...transactions];
    return delay(transaction);
  },
};
