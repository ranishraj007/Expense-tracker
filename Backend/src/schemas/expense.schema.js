import { z } from "zod";

const categorySchema = z.enum([
  "Groceries",
  "School",
  "Utilities",
  "Transport",
  "Health",
  "Dining",
  "Salary",
  "Gift",
  "Savings",
  "Food",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
]);
const typeSchema = z.enum(["CREDIT", "DEBIT"]).or(z.enum(["credit", "debit"]).transform((value) => value.toUpperCase()));
const statusSchema = z
  .enum(["COMPLETED", "PENDING"])
  .or(z.enum(["completed", "pending"]).transform((value) => value.toUpperCase()));

const pendingPersonSchema = {
  status: statusSchema.default("COMPLETED"),
  personName: z.string().trim().min(2).optional(),
  personPhone: z.string().trim().min(6).optional(),
  dueDate: z.string().datetime().or(z.string().date()).optional(),
};

export const expenseIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const listExpensesSchema = z.object({
  params: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
  query: z.object({
    startDate: z.string().datetime().or(z.string().date()).optional(),
    endDate: z.string().datetime().or(z.string().date()).optional(),
    category: categorySchema.optional(),
    type: typeSchema.optional(),
    status: statusSchema.optional(),
    all: z.enum(["true", "false"]).optional(),
  }),
});

export const createExpenseSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    amount: z.coerce.number().positive(),
    description: z.string().min(2),
    date: z.string().datetime().or(z.string().date()),
    category: categorySchema,
    type: typeSchema,
    ...pendingPersonSchema,
  }).superRefine((payload, ctx) => {
    if (payload.status !== "PENDING") return;

    if (!payload.personName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["personName"], message: "Person name is required for pending entries." });
    }
    if (!payload.personPhone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["personPhone"], message: "Phone number is required for pending entries." });
    }
    if (!payload.dueDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dueDate"], message: "Date to pay is required for pending entries." });
    }
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).passthrough(),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    description: z.string().min(2).optional(),
    date: z.string().datetime().or(z.string().date()).optional(),
    dueDate: z.string().datetime().or(z.string().date()).nullable().optional(),
    category: categorySchema.optional(),
    type: typeSchema.optional(),
    status: statusSchema.optional(),
    personName: z.string().trim().min(2).nullable().optional(),
    personPhone: z.string().trim().min(6).nullable().optional(),
  }),
});
