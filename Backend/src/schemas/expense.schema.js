import { z } from "zod";

const categorySchema = z.enum(["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"]);
const typeSchema = z.enum(["CREDIT", "DEBIT"]).or(z.enum(["credit", "debit"]).transform((value) => value.toUpperCase()));

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
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({}).passthrough(),
  body: z.object({
    amount: z.coerce.number().positive().optional(),
    description: z.string().min(2).optional(),
    date: z.string().datetime().or(z.string().date()).optional(),
    category: categorySchema.optional(),
    type: typeSchema.optional(),
  }),
});
