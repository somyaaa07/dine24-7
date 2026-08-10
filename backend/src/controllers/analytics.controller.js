import { Order, OrderItem, Customer, Tables, InventoryItem } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../models/index.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const today = new Date(); today.setHours(0,0,0,0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

    const [todayOrders, weekOrders, monthOrders] = await Promise.all([
      Order.findAll({ where: { tenant_id, status:'paid', createdAt: { [Op.gte]: today } } }),
      Order.findAll({ where: { tenant_id, status:'paid', createdAt: { [Op.gte]: weekAgo } } }),
      Order.findAll({ where: { tenant_id, status:'paid', createdAt: { [Op.gte]: monthAgo } } })
    ]);

    const sum = arr => arr.reduce((s,o) => s + parseFloat(o.total_amount), 0);

    return res.status(200).json({
      success: true,
      data: {
        today:  { revenue: sum(todayOrders),  orders: todayOrders.length },
        week:   { revenue: sum(weekOrders),   orders: weekOrders.length },
        month:  { revenue: sum(monthOrders),  orders: monthOrders.length },
        avg_order_value: monthOrders.length > 0 ? sum(monthOrders) / monthOrders.length : 0
      }
    });
  } catch (error) {
    console.error('getDashboardAnalytics failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPeakHours = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);

    const orders = await Order.findAll({
      where: { tenant_id, status: 'paid', createdAt: { [Op.gte]: monthAgo } }
    });

    const hourlyData = Array(24).fill(0).map((_, h) => ({ hour: h, orders: 0, revenue: 0 }));

    for (const order of orders) {
      const h = new Date(order.createdAt).getHours();
      hourlyData[h].orders++;
      hourlyData[h].revenue += parseFloat(order.total_amount);
    }

    const peakHour = hourlyData.reduce((max, h) => h.orders > max.orders ? h : max, hourlyData[0]);

    return res.status(200).json({
      success: true,
      data: { hourly: hourlyData, peak_hour: peakHour }
    });
  } catch (error) {
    console.error('getPeakHours failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRevenueByDay = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { days = 30 } = req.query;
    const from = new Date(); from.setDate(from.getDate() - parseInt(days));

    const orders = await Order.findAll({
      where: { tenant_id, status: 'paid', createdAt: { [Op.gte]: from } },
      order: [['createdAt', 'ASC']]
    });

    const daily = {};
    for (const o of orders) {
      const d = o.createdAt.toISOString().split('T')[0];
      if (!daily[d]) daily[d] = { date: d, revenue: 0, orders: 0 };
      daily[d].revenue += parseFloat(o.total_amount);
      daily[d].orders++;
    }

    return res.status(200).json({ success: true, data: Object.values(daily) });
  } catch (error) {
    console.error('getRevenueByDay failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTableUtilization = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const tables = await Tables.findAll({ where: { tenant_id, is_active: true } });
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);

    const orders = await Order.findAll({
      where: { tenant_id, status: 'paid', table_id: { [Op.ne]: null }, createdAt: { [Op.gte]: monthAgo } }
    });

    const tableStats = {};
    for (const o of orders) {
      if (!tableStats[o.table_id]) tableStats[o.table_id] = { orders: 0, revenue: 0 };
      tableStats[o.table_id].orders++;
      tableStats[o.table_id].revenue += parseFloat(o.total_amount);
    }

    const result = tables.map(t => ({
      id: t.id, table_number: t.table_number, section: t.section, capacity: t.capacity,
      orders: tableStats[t.id]?.orders || 0,
      revenue: tableStats[t.id]?.revenue || 0
    })).sort((a,b) => b.orders - a.orders);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('getTableUtilization failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomerInsights = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const customers = await Customer.findAll({ where: { tenant_id, is_active: true } });

    const totalCustomers = customers.length;
    const newThisMonth = customers.filter(c => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const avgSpend = totalCustomers > 0
      ? customers.reduce((s,c) => s + parseFloat(c.total_spent || 0), 0) / totalCustomers
      : 0;

    const repeatCustomers = customers.filter(c => c.total_visits > 1).length;
    const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: { totalCustomers, newThisMonth, avgSpend, repeatCustomers, retentionRate: retentionRate.toFixed(1) }
    });
  } catch (error) {
    console.error('getCustomerInsights failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};