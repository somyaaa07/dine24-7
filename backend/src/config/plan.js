// src/config/plans.js
// Har plan mein kya kya features hain

export const PLANS = {
  starter: {
    name:        'Starter',
    price:        999,
    currency:    '₹',
    period:      'month',
    max_users:   3,
    max_tables:  10,
    max_branches: 1,
    features: [
      'tables',
      'menu',
      'pos',
      'orders',
      'suppliers',
      'reservations',
      'expenses',
      'dashboard',
    ]
  },

  growth: {
    name:        'Growth',
    price:        2499,
    currency:    '₹',
    period:      'month',
    max_users:   10,
    max_tables:  30,
    max_branches: 1,
    features: [
      'tables',
      'menu',
      'pos',
      'orders',
      'kds',
      'inventory',
      'recipes',
      'suppliers',
      'purchase_orders',
      'customers',
      'reservations',
      'employees',
      'expenses',
      'reports',
      'notifications',
      'qr_ordering',
      'dashboard',
    ]
  },

  enterprise: {
    name:        'Enterprise',
    price:        4999,
    currency:    '₹',
    period:      'month',
    max_users:   -1,   // unlimited
    max_tables:  -1,   // unlimited
    max_branches: 5,
    features: [
      'tables',
      'menu',
      'pos',
      'orders',
      'kds',
      'inventory',
      'recipes',
      'suppliers',
      'purchase_orders',
      'customers',
      'reservations',
      'employees',
      'expenses',
      'reports',
      'analytics',
      'notifications',
      'qr_ordering',
      'dashboard',
      'multi_branch',
    ]
  }
};

// Feature ke naam → route mapping
export const FEATURE_ROUTES = {
  tables:         '/tables',
  menu:           '/menu',
  pos:            '/pos',
  orders:         '/orders',
  kds:            '/kds',
  inventory:      '/inventory',
  recipes:        '/recipes',
  suppliers:      '/suppliers',
  purchase_orders:'/purchase-orders',
  customers:      '/customers',
  reservations:   '/reservations',
  employees:      '/employees',
  expenses:       '/expenses',
  reports:        '/reports',
  analytics:      '/analytics',
  notifications:  '/notifications',
  qr_ordering:    '/qr',
  dashboard:      '/dashboard',
};

export const getPlanFeatures = (planName) => {
  return PLANS[planName]?.features || PLANS.starter.features;
};

export const hasFeature = (planName, feature) => {
  const features = getPlanFeatures(planName);
  return features.includes(feature);
};

// Har feature ka poora catalog — super admin isi list se checkbox banata hai
// jab kisi tenant ko individually feature de/le raha ho.
export const ALL_FEATURES = [
  { key: 'tables',           label: 'Tables' },
  { key: 'menu',              label: 'Menu' },
  { key: 'pos',                label: 'POS' },
  { key: 'orders',            label: 'Orders' },
  { key: 'kds',                label: 'Kitchen Display (KDS)' },
  { key: 'inventory',        label: 'Inventory' },
  { key: 'recipes',           label: 'Recipes' },
  { key: 'suppliers',        label: 'Suppliers' },
  { key: 'purchase_orders',  label: 'Purchase Orders' },
  { key: 'customers',        label: 'Customers' },
  { key: 'reservations',     label: 'Reservations' },
  { key: 'employees',        label: 'Employees' },
  { key: 'expenses',          label: 'Expenses' },
  { key: 'reports',           label: 'Reports' },
  { key: 'analytics',        label: 'Analytics' },
  { key: 'notifications',    label: 'Notifications' },
  { key: 'qr_ordering',      label: 'QR Ordering' },
  { key: 'dashboard',        label: 'Dashboard' },
  { key: 'multi_branch',     label: 'Multi Branch' },
];

export const ALL_FEATURE_KEYS = ALL_FEATURES.map((f) => f.key);

// Tenant ke effective features nikalo:
// - Agar super admin ne is tenant ke liye custom features set kiye hain
//   (tenant.enabled_features array me kuch hai), to WAHI final list hai.
// - Warna tenant ke plan ke default features use ho jayenge.
export const getEffectiveFeatures = (tenant) => {
  if (!tenant) return [];
  if (Array.isArray(tenant.enabled_features) && tenant.enabled_features.length > 0) {
    return tenant.enabled_features;
  }
  return getPlanFeatures(tenant.plan);
};

// Ek tenant object (Sequelize instance ya plain object) ke against
// check karo ki feature allowed hai ya nahi — plan + super-admin override dono.
export const tenantHasFeature = (tenant, feature) => {
  return getEffectiveFeatures(tenant).includes(feature);
};