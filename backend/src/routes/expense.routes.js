import express from "express";
import * as expenseController from '../controllers/expense.controller.js';
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/summary',authMiddleware,expenseController.getExpenseSummmary);
router.get('/',authMiddleware,expenseController.getAllExpenses);
router.post('/',authMiddleware,expenseController.createExpense);
router.put('/:id',authMiddleware,expenseController.updateExpense);
router.delete('/:id',authMiddleware,expenseController.deleteExpense);

export default router;