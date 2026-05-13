import { Router } from "express";
import { createExpense, deleteExpense, getExpense, listExpenses, updateExpense } from "../controllers/expenses.controller.js";
import { validate } from "../middleware/validate.js";
import { createExpenseSchema, expenseIdSchema, listExpensesSchema, updateExpenseSchema } from "../schemas/expense.schema.js";

const router = Router();

router.get("/", validate(listExpensesSchema), listExpenses);
router.get("/:id", validate(expenseIdSchema), getExpense);
router.post("/", validate(createExpenseSchema), createExpense);
router.put("/:id", validate(updateExpenseSchema), updateExpense);
router.delete("/:id", validate(expenseIdSchema), deleteExpense);

export default router;
