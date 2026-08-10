import { Tenant, User, Order, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Super admin middleware check
export const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin access only' });
  }
  next();
};

export const getAllTenants = async (req, res) => {
  try {
    const { status, plan } = req.query;
    const where = {};
    if (status) where.status = status;
    if (plan)   where.plan   = plan;

    const tenants = await Tenant.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    const tenantStats = await Promise.all(tenants.map(async (t) => {
      const userCount  = await User.count({ where: { tenant_id: t.id } });
      const orderCount = await Order.count({ where: { tenant_id: t.id, status: 'paid' } });
      return { ...t.toJSON(), userCount, orderCount };
    }));

    return res.status(200).json({ success: true, data: tenantStats, total: tenants.length });
  } catch (error) {
    console.error('getAllTenants failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const users  = await User.count({ where: { tenant_id: id } });
    const orders = await Order.count({ where: { tenant_id: id } });
    const revenue = await Order.sum('total_amount', { where: { tenant_id: id, status: 'paid' } });

    return res.status(200).json({
      success: true,
      data: { ...tenant.toJSON(), stats: { users, orders, revenue: revenue || 0 } }
    });
  } catch (error) {
    console.error('getTenantById failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ['trial','active','suspended','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const tenant = await Tenant.findByPk(id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    await tenant.update({ status });
    return res.status(200).json({ success: true, message: `Tenant status → ${status}`, data: tenant });
  } catch (error) {
    console.error('updateTenantStatus failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateTenantPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;
    const valid = ['starter','growth','enterprise'];
    if (!valid.includes(plan)) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const tenant = await Tenant.findByPk(id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    await tenant.update({ plan });
    return res.status(200).json({ success: true, message: `Plan updated to ${plan}`, data: tenant });
  } catch (error) {
    console.error('updateTenantPlan failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const totalTenants  = await Tenant.count();
    const activeTenants = await Tenant.count({ where: { status: 'active' } });
    const trialTenants  = await Tenant.count({ where: { status: 'trial' } });
    const totalRevenue  = await Order.sum('total_amount', { where: { status: 'paid' } });
    const totalOrders   = await Order.count({ where: { status: 'paid' } });
    const totalUsers    = await User.count();

    const today = new Date(); today.setHours(0,0,0,0);
    const newToday = await Tenant.count({ where: { createdAt: { [Op.gte]: today } } });

    const byPlan = await Tenant.findAll({
      attributes: ['plan', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['plan']
    });

    return res.status(200).json({
      success: true,
      data: {
        tenants: { total: totalTenants, active: activeTenants, trial: trialTenants, new_today: newToday },
        platform: { total_revenue: totalRevenue || 0, total_orders: totalOrders, total_users: totalUsers },
        by_plan: byPlan
      }
    });
  } catch (error) {
    console.error('getPlatformStats failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findByPk(id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    await tenant.update({ status: 'cancelled' });
    return res.status(200).json({ success: true, message: 'Tenant cancelled' });
  } catch (error) {
    console.error('deleteTenant failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};