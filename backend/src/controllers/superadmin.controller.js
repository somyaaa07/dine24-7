import { Tenant, User, Role, Order, AuditLog, Branch, Tables, sequelize } from '../models/index.js';
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

// Last 14 days of paid orders + revenue, grouped by day — real data for the
// dashboard trend chart (never fabricate chart data with fake numbers).
export const getPlatformTrend = async (req, res) => {
  try {
    const days = 14;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const rows = await Order.findAll({
      where: { status: 'paid', createdAt: { [Op.gte]: since } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      raw: true,
    });

    const byDate = {};
    rows.forEach((r) => {
      byDate[r.date] = { orders: Number(r.orders), revenue: Number(r.revenue || 0) };
    });

    // Fill in every day (even zero-order days) so the x-axis is continuous.
    const trend = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      trend.push({ date: key, orders: byDate[key]?.orders || 0, revenue: byDate[key]?.revenue || 0 });
    }

    return res.status(200).json({ success: true, data: trend });
  } catch (error) {
    console.error('getPlatformTrend failed:', error);
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

// ============ BRANCH MANAGEMENT ============

// All branches across every restaurant, with the parent restaurant attached
// and a quick performance snapshot (orders + revenue) per branch.
export const getAllBranches = async (req, res) => {
  try {
    const { tenant_id, is_active, search } = req.query;
    const where = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true';

    const branches = await Branch.findAll({
      where,
      include: [{ model: Tenant, attributes: ['id', 'name', 'subdomain', 'plan', 'status'] }],
      order: [['createdAt', 'DESC']],
    });

    let branchStats = await Promise.all(
      branches.map(async (b) => {
        const orderCount = await Order.count({ where: { branch_id: b.id } });
        const revenue = await Order.sum('total_amount', { where: { branch_id: b.id, status: 'paid' } });
        return { ...b.toJSON(), orderCount, revenue: revenue || 0 };
      })
    );

    if (search) {
      const q = search.toLowerCase();
      branchStats = branchStats.filter(
        (b) => b.name?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, data: branchStats, total: branchStats.length });
  } catch (error) {
    console.error('getAllBranches failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// One branch, with its restaurant, table count, and order/revenue stats.
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id, {
      include: [{ model: Tenant, attributes: ['id', 'name', 'subdomain', 'plan', 'status'] }],
    });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    const orderCount = await Order.count({ where: { branch_id: id } });
    const paidOrders = await Order.count({ where: { branch_id: id, status: 'paid' } });
    const revenue = await Order.sum('total_amount', { where: { branch_id: id, status: 'paid' } });
    const tableCount = await Tables.count({ where: { branch_id: id } });

    return res.status(200).json({
      success: true,
      data: { ...branch.toJSON(), stats: { orderCount, paidOrders, revenue: revenue || 0, tableCount } },
    });
  } catch (error) {
    console.error('getBranchById failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Activate or suspend a branch (e.g. a branch running into repeated issues,
// without touching the rest of that restaurant's branches).
export const updateBranchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be true or false' });
    }

    const branch = await Branch.findByPk(id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    await branch.update({ is_active });

    await AuditLog.create({
      tenant_id: branch.tenant_id,
      user_id: req.user.user_id,
      action: 'BRANCH_STATUS_CHANGED_BY_SUPER_ADMIN',
      ip_address: req.ip,
      details: { branch_id: branch.id, branch_name: branch.name, is_active },
    });

    return res
      .status(200)
      .json({ success: true, message: `Branch ${is_active ? 'activated' : 'suspended'}`, data: branch });
  } catch (error) {
    console.error('updateBranchStatus failed:', error);
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

// ============ USER MANAGEMENT ============

// Every user across every restaurant — owners, managers, waiters, chefs —
// with their restaurant and role attached. Filter by tenant, role, or status.
export const getAllUsers = async (req, res) => {
  try {
    const { tenant_id, role, is_active, search } = req.query;
    const where = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true';

    const roleInclude = { model: Role, attributes: ['id', 'name'] };
    if (role) roleInclude.where = { name: role };

    let users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Tenant, attributes: ['id', 'name', 'subdomain'] }, roleInclude],
      order: [['createdAt', 'DESC']],
    });

    users = users.map((u) => u.toJSON());

    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }

    return res.status(200).json({ success: true, data: users, total: users.length });
  } catch (error) {
    console.error('getAllUsers failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// One user's full profile plus their last 20 audit-log events (logins, actions).
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Tenant, attributes: ['id', 'name', 'subdomain', 'plan', 'status'] },
        { model: Role, attributes: ['id', 'name', 'permissions'] },
      ],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const recentActivity = await AuditLog.findAll({
      where: { user_id: id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    return res.status(200).json({ success: true, data: { ...user.toJSON(), recentActivity } });
  } catch (error) {
    console.error('getUserById failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Activate or suspend a user account platform-wide (revokes their access
// immediately regardless of what their restaurant owner has set).
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be true or false' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.id === req.user.user_id && !is_active) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });
    }

    await user.update({ is_active });

    await AuditLog.create({
      tenant_id: user.tenant_id,
      user_id: req.user.user_id,
      action: 'USER_STATUS_CHANGED_BY_SUPER_ADMIN',
      ip_address: req.ip,
      details: { target_user_id: user.id, target_email: user.email, is_active },
    });

    return res
      .status(200)
      .json({ success: true, message: `User ${is_active ? 'activated' : 'suspended'}`, data: user });
  } catch (error) {
    console.error('updateUserStatus failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reassign a user to a different role — restricted to roles that belong to
// that same user's restaurant, since roles are tenant-scoped.
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;
    if (!role_id) return res.status(400).json({ success: false, message: 'role_id is required' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const role = await Role.findByPk(role_id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    if (String(role.tenant_id) !== String(user.tenant_id)) {
      return res
        .status(400)
        .json({ success: false, message: "That role does not belong to this user's restaurant" });
    }

    const oldRoleId = user.role_id;
    await user.update({ role_id });

    await AuditLog.create({
      tenant_id: user.tenant_id,
      user_id: req.user.user_id,
      action: 'USER_ROLE_CHANGED_BY_SUPER_ADMIN',
      ip_address: req.ip,
      details: { target_user_id: user.id, from_role_id: oldRoleId, to_role_id: role_id },
    });

    return res.status(200).json({ success: true, message: 'Role updated', data: user });
  } catch (error) {
    console.error('updateUserRole failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};