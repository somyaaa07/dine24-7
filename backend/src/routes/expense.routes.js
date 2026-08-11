import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';

// Explicitly import karo — * se nahi
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../controllers/expense.controller.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();
router.use(authMiddleware,requireFeature('expenses'));
// summary pehle — /:id se pehle
router.get('/summary', authMiddleware, getExpenseSummary);
router.get('/',        authMiddleware, getAllExpenses);
router.post('/',       authMiddleware, createExpense);
router.put('/:id',     authMiddleware, updateExpense);
router.delete('/:id',  authMiddleware, deleteExpense);

export default router;