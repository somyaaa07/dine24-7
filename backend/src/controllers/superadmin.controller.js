import { Tenant, User, Role, Order, AuditLog, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ALL_FEATURES, ALL_FEATURE_KEYS, getEffectiveFeatures } from '../config/plan.js';

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
      return { ...t.toJSON(), userCount, orderCount, effective_features: getEffectiveFeatures(t) };
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
      data: {
        ...tenant.toJSON(),
        effective_features: getEffectiveFeatures(tenant),
        stats: { users, orders, revenue: revenue || 0 }
      }
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

// Send the complete feature list — the frontend uses it to create the checkbox list.
export const getFeatureCatalog = async (req, res) => {
  return res.status(200).json({ success: true, data: ALL_FEATURES });
};

// Create a new tenant (restaurant) — along with its owner account.
// This duplicates the registration flow, but it is triggered by the super admin
// without a trial and directly uses the selected plan/status.
export const createTenant = async (req, res) => {
  const {
    resturant_name,
    owner_name,
    email,
    password,
    plan = 'starter',
    status = 'trial',
    enabled_features = null,
  } = req.body;

  if (!resturant_name || !owner_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'resturant_name, owner_name, email, and password are required'
    });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }
  const validPlans   = ['starter', 'growth', 'enterprise'];
  const validStatus  = ['trial', 'active', 'suspended', 'cancelled'];
  if (!validPlans.includes(plan))     return res.status(400).json({ success: false, message: 'Invalid plan' });
  if (!validStatus.includes(status))  return res.status(400).json({ success: false, message: 'Invalid status' });
  if (enabled_features !== null) {
    if (!Array.isArray(enabled_features) || enabled_features.some((f) => !ALL_FEATURE_KEYS.includes(f))) {
      return res.status(400).json({ success: false, message: 'enabled_features contains an invalid feature key' });
    }
  }

  const transaction = await sequelize.transaction();
  try {
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    let subdomain = resturant_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const existingTenant = await Tenant.findOne({ where: { subdomain }, transaction });
    if (existingTenant) subdomain = `${subdomain}-${Date.now()}`;

    const newTenant = await Tenant.create(
      {
        id: uuidv4(),
        name: resturant_name,
        subdomain,
        plan,
        status,
        enabled_features,
        trial_ends_at: status === 'trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
      },
      { transaction }
    );

    const roles = await Role.bulkCreate(
      [
        { name: 'owner',   tenant_id: newTenant.id, permissions: { all: true } },
        { name: 'manager', tenant_id: newTenant.id, permissions: JSON.stringify({ order: true, inventory: true, reports: true, staff: true, menu: true, tables: true }) },
        { name: 'waiter',  tenant_id: newTenant.id, permissions: JSON.stringify({ order: true, tables: true, menu: ['read'] }) },
        { name: 'chef',    tenant_id: newTenant.id, permissions: JSON.stringify({ kitchen: true, menu: ['read'] }) },
      ],
      { transaction }
    );
    const ownerRole = roles.find((r) => r.name === 'owner');

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create(
      {
        id: uuidv4(),
        tenant_id: newTenant.id,
        name: owner_name,
        email,
        password_hash,
        role_id: ownerRole.id,
        is_active: true,
      },
      { transaction }
    );

    await AuditLog.create(
      { tenant_id: newTenant.id, user_id: user.id, action: 'TENANT_CREATED_BY_SUPER_ADMIN', ip_address: req.ip },
      { transaction }
    );

    await transaction.commit();

  return res.status(201).json({
  success: true,
  message: 'Tenant created successfully',
  data: {
    tenant: { ...newTenant.toJSON(), effective_features: getEffectiveFeatures(newTenant) },
    owner: { id: user.id, name: user.name, email: user.email },
    credentials: { email, password }
  }
});
  } catch (error) {
    await transaction.rollback();
    console.error('createTenant failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// This determines which features are specifically available to a tenant.
// An empty array means "no features" (everything is blocked).
// null means "use the plan default features again".
export const updateTenantFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled_features } = req.body;

    if (enabled_features !== null) {
      if (!Array.isArray(enabled_features)) {
        return res.status(400).json({ success: false, message: 'enabled_features ek array (ya null) hona chahiye' });
      }
      const invalid = enabled_features.filter((f) => !ALL_FEATURE_KEYS.includes(f));
      if (invalid.length > 0) {
        return res.status(400).json({ success: false, message: `Invalid feature keys: ${invalid.join(', ')}` });
      }
    }

    const tenant = await Tenant.findByPk(id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    await tenant.update({ enabled_features });

    return res.status(200).json({
      success: true,
      message: 'Tenant features have been updated',
      data: { ...tenant.toJSON(), effective_features: getEffectiveFeatures(tenant) }
    });
  } catch (error) {
    console.error('updateTenantFeatures failed:', error);
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