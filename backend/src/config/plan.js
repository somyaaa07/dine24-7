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