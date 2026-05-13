import { prisma } from "../lib/prisma.js";
import { endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear } from "../utils/dates.js";
import { sendSuccess } from "../utils/responses.js";

function scope(req, allUsers = false) {
  return allUsers && req.user.role === "ADMIN" ? {} : { userId: req.user.id };
}

function sumByType(expenses) {
  return expenses.reduce(
    (totals, expense) => {
      totals[expense.type.toLowerCase()] += expense.amount;
      return totals;
    },
    { credit: 0, debit: 0 },
  );
}

export async function dailyAnalytics(req, res) {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  const expenses = await prisma.expense.findMany({
    where: { ...scope(req), date: { gte: start, lte: endOfDay(today) } },
  });

  const data = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const dayExpenses = expenses.filter((expense) => expense.date >= startOfDay(day) && expense.date <= endOfDay(day));
    return {
      date: day.toISOString().slice(0, 10),
      ...sumByType(dayExpenses),
    };
  });

  return sendSuccess(res, data);
}

export async function monthlyAnalytics(req, res) {
  const now = new Date();
  const expenses = await prisma.expense.findMany({
    where: { ...scope(req), date: { gte: startOfYear(now), lte: endOfYear(now) } },
  });

  const data = Array.from({ length: 12 }, (_, month) => {
    const monthExpenses = expenses.filter((expense) => expense.date.getMonth() === month);
    return {
      month: month + 1,
      ...sumByType(monthExpenses),
    };
  });

  return sendSuccess(res, data);
}

export async function summaryAnalytics(req, res) {
  const now = new Date();
  const expenses = await prisma.expense.findMany({
    where: { ...scope(req), date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
  });
  const totals = sumByType(expenses);

  return sendSuccess(res, {
    totalCredited: totals.credit,
    totalDebited: totals.debit,
    balance: totals.credit - totals.debit,
  });
}

export async function allUsersAnalytics(req, res) {
  const now = new Date();
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    include: { user: { select: { id: true, username: true, name: true } } },
  });
  const totals = sumByType(expenses);

  const byUser = expenses.reduce((acc, expense) => {
    const key = expense.userId;
    if (!acc[key]) {
      acc[key] = { user: expense.user, credit: 0, debit: 0, balance: 0 };
    }
    acc[key][expense.type.toLowerCase()] += expense.amount;
    acc[key].balance = acc[key].credit - acc[key].debit;
    return acc;
  }, {});

  return sendSuccess(res, {
    totalCredited: totals.credit,
    totalDebited: totals.debit,
    balance: totals.credit - totals.debit,
    users: Object.values(byUser),
  });
}
