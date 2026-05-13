import { prisma } from "../lib/prisma.js";
import { parseDate } from "../utils/dates.js";
import { sendError, sendSuccess } from "../utils/responses.js";

function expenseWhereForUser(req, filters = {}) {
  const where = {};
  const adminAll = req.user.role === "ADMIN" && filters.all === "true";

  if (!adminAll) where.userId = req.user.id;
  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = parseDate(filters.startDate);
    if (filters.endDate) where.date.lte = parseDate(filters.endDate);
  }

  return where;
}

async function findAccessibleExpense(req, id) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return null;
  if (expense.userId !== req.user.id && req.user.role !== "ADMIN") return false;
  return expense;
}

export async function listExpenses(req, res) {
  const expenses = await prisma.expense.findMany({
    where: expenseWhereForUser(req, req.validated.query),
    include: { user: { select: { id: true, name: true, username: true } } },
    orderBy: { date: "desc" },
  });

  return sendSuccess(res, expenses);
}

export async function getExpense(req, res) {
  const expense = await findAccessibleExpense(req, req.validated.params.id);
  if (expense === false) return sendError(res, 403, "You cannot access another user's expense.");
  if (!expense) return sendError(res, 404, "Expense not found.");

  return sendSuccess(res, expense);
}

export async function createExpense(req, res) {
  const payload = req.validated.body;
  const expense = await prisma.expense.create({
    data: {
      amount: payload.amount,
      description: payload.description,
      date: parseDate(payload.date),
      category: payload.category,
      type: payload.type,
      userId: req.user.id,
    },
  });

  return sendSuccess(res.status(201), expense, "Expense created.");
}

export async function updateExpense(req, res) {
  const expense = await findAccessibleExpense(req, req.validated.params.id);
  if (expense === false) return sendError(res, 403, "You cannot update another user's expense.");
  if (!expense) return sendError(res, 404, "Expense not found.");

  const payload = req.validated.body;
  const data = { ...payload };
  if (payload.date) data.date = parseDate(payload.date);

  const updated = await prisma.expense.update({ where: { id: expense.id }, data });
  return sendSuccess(res, updated, "Expense updated.");
}

export async function deleteExpense(req, res) {
  const expense = await findAccessibleExpense(req, req.validated.params.id);
  if (expense === false) return sendError(res, 403, "You cannot delete another user's expense.");
  if (!expense) return sendError(res, 404, "Expense not found.");

  await prisma.expense.delete({ where: { id: expense.id } });
  return sendSuccess(res, { id: expense.id }, "Expense deleted.");
}
