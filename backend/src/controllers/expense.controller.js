import { Expense } from '../models/index.js';
import { Op } from 'sequelize';

export const getAllExpenses = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { month, year, category } = req.query;

    const where = { tenant_id };
    if (category) where.category = category;

    if (month && year) {
      const m         = String(month).padStart(2, '0');
      const startDate = `${year}-${m}-01`;
      const lastDay   = new Date(year, month, 0).getDate();
      const endDate   = `${year}-${m}-${String(lastDay).padStart(2,'0')}`;

      where.expense_date = { [Op.between]: [startDate, endDate] };
    }

    const expenses = await Expense.findAll({
      where,
      order: [['expense_date', 'DESC']]
    });

    const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

    return res.status(200).json({ success: true, data: expenses, total });

  } catch (error) {
    console.error('getAllExpenses failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'month aur year zaroori hain' });
    }

    const m         = String(month).padStart(2, '0');
    const startDate = `${year}-${m}-01`;
    const lastDay   = new Date(year, month, 0).getDate();
    const endDate   = `${year}-${m}-${String(lastDay).padStart(2,'0')}`;

    const expenses = await Expense.findAll({
      where: {
        tenant_id,
        expense_date: { [Op.between]: [startDate, endDate] }
      }
    });

    const summary = {};
    for (const exp of expenses) {
      if (!summary[exp.category]) summary[exp.category] = 0;
      summary[exp.category] += parseFloat(exp.amount);
    }

    const total = Object.values(summary).reduce((s, v) => s + v, 0);

    return res.status(200).json({ success: true, data: { summary, total } });

  } catch (error) {
    console.error('getExpenseSummary failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { title, category, amount, expense_date, payment_method, note } = req.body;

    if (!title || !amount || !expense_date) {
      return res.status(400).json({ success: false, message: 'Title, amount, date zaroori hain' });
    }

    const expense = await Expense.create({
      tenant_id,
      title,
      category:       category       || 'other',
      amount,
      expense_date,
      payment_method: payment_method || 'cash',
      note:           note           || null,
      added_by:       req.user.user_id
    });

    return res.status(201).json({ success: true, message: 'Expense add ho gaya', data: expense });

  } catch (error) {
    console.error('createExpense failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { id }    = req.params;

    const expense = await Expense.findOne({ where: { id, tenant_id } });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense nahi mila' });

    const { title, category, amount, expense_date, payment_method, note } = req.body;

    await expense.update({
      ...(title          !== undefined && { title }),
      ...(category       !== undefined && { category }),
      ...(amount         !== undefined && { amount }),
      ...(expense_date   !== undefined && { expense_date }),
      ...(payment_method !== undefined && { payment_method }),
      ...(note           !== undefined && { note })
    });

    return res.status(200).json({ success: true, message: 'Expense update ho gaya', data: expense });

  } catch (error) {
    console.error('updateExpense failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { id }    = req.params;

    const expense = await Expense.findOne({ where: { id, tenant_id } });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense nahi mila' });

    await expense.destroy();

    return res.status(200).json({ success: true, message: 'Expense delete ho gaya' });

  } catch (error) {
    console.error('deleteExpense failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};