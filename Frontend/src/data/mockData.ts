import { format, subDays } from "date-fns";
import type { MockUser, Transaction } from "@/types";

const today = new Date();

export const mockUsers: MockUser[] = [
  {
    id: "u-admin",
    name: "Administrator",
    username: "admin",
    email: "admin@example.com",
    password: "admin",
    phone: "+977 9800000000",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "u-parent",
    name: "Arjun Sharma",
    username: "arjun",
    email: "arjun@example.com",
    password: "family123",
    phone: "+977 9800000002",
    role: "member",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  },
];

export const categories = ["Groceries", "School", "Utilities", "Transport", "Health", "Dining", "Salary", "Gift", "Savings"];

export const mockTransactions: Transaction[] = [
  { id: "t1", userId: "u-admin", date: format(today, "yyyy-MM-dd"), description: "Weekly vegetables", category: "Groceries", type: "debit", amount: 42 },
  { id: "t2", userId: "u-parent", date: format(today, "yyyy-MM-dd"), description: "Bus card top-up", category: "Transport", type: "debit", amount: 18 },
  { id: "t3", userId: "u-admin", date: format(subDays(today, 1), "yyyy-MM-dd"), description: "Monthly salary", category: "Salary", type: "credit", amount: 2200 },
  { id: "t5", userId: "u-parent", date: format(subDays(today, 2), "yyyy-MM-dd"), description: "Electricity bill", category: "Utilities", type: "debit", amount: 88 },
  { id: "t6", userId: "u-admin", date: format(subDays(today, 3), "yyyy-MM-dd"), description: "Family dinner", category: "Dining", type: "debit", amount: 63 },
  { id: "t7", userId: "u-parent", date: format(subDays(today, 4), "yyyy-MM-dd"), description: "Clinic visit", category: "Health", type: "debit", amount: 75 },
  { id: "t9", userId: "u-admin", date: format(subDays(today, 6), "yyyy-MM-dd"), description: "Emergency savings", category: "Savings", type: "credit", amount: 300 },
  { id: "t10", userId: "u-parent", date: `${today.getFullYear()}-04-12`, description: "Water bill", category: "Utilities", type: "debit", amount: 30 },
  { id: "t11", userId: "u-admin", date: `${today.getFullYear()}-03-24`, description: "Bonus", category: "Salary", type: "credit", amount: 400 },
  { id: "t13", userId: "u-parent", date: `${today.getFullYear()}-01-18`, description: "Winter jackets", category: "Health", type: "debit", amount: 160 },
];
