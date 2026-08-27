// ============================================================
// Design tokens — original cream / amber / earthy palette, unchanged.
// ============================================================
export const C = {
  bg: '#F7F5F0', surface: '#FFFFFF', surfaceRaised: '#FBF8F2',
  border: '#E9E3D6', borderHover: '#A97E44',
  ink: '#1A1815', mid: '#4A453D', muted: '#7A7264', faint: '#B9B0A0',
  amber: '#A97E44',
  green: '#4C8064', greenBg: '#EFF6F1', greenBorder: '#C7DECD',
  warn: '#C08A3E', warnBg: '#FBF3E6', warnBorder: '#F0DCB0',
  red: '#B33F2C', redBg: '#FBEEEB', redBorder: '#EBC7BC',
  blue: '#5B7A99', blueBg: '#EEF3F7',
  violet: '#7C5C8C', violetBg: '#F5EFF7',
};

export const FONT_DISPLAY = "'Bebas Neue', sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";
export const FONT_BODY = "'Inter', sans-serif";

export const PLANS = {
  starter:    { label: 'Starter',    price: '₹999/mo',  color: C.blue,   bg: C.blueBg },
  growth:     { label: 'Growth',     price: '₹2499/mo', color: C.green,  bg: C.greenBg },
  enterprise: { label: 'Enterprise', price: '₹4999/mo', color: C.violet, bg: C.violetBg },
};

export const STATUS = {
  trial:     { label: 'Trial',     color: C.warn,  bg: C.warnBg },
  active:    { label: 'Active',    color: C.green, bg: C.greenBg },
  suspended: { label: 'Suspended', color: C.red,   bg: C.redBg },
  cancelled: { label: 'Cancelled', color: C.faint, bg: '#F1EEE7' },
};

export const PLAN_FEATURES = {
  starter:    ['Dashboard','Tables','Menu','POS','Suppliers','Reservations','Expenses'],
  growth:     ['Dashboard','Tables','Menu','POS','KDS','Inventory','Recipes','Suppliers','Purchase Orders','Customers','Reservations','Employees','Expenses','Reports','Notifications','QR Ordering'],
  enterprise: ['Dashboard','Tables','Menu','POS','KDS','Inventory','Recipes','Suppliers','Purchase Orders','Customers','Reservations','Employees','Expenses','Reports','Analytics','Notifications','QR Ordering','Multi Branch'],
};

export const ALL_FEATURES = ['Dashboard','Tables','Menu','POS','KDS','Inventory','Recipes','Suppliers','Purchase Orders','Customers','Reservations','Employees','Expenses','Reports','Analytics','Notifications','QR Ordering','Multi Branch'];

export const EMPTY_TENANT_FORM = {
  restaurant_name: '', subdomain: '', email: '', phone: '',
  owner_name: '', owner_email: '', owner_password: '',
  plan: 'starter', status: 'active',
};

// `implemented: true` items are wired to real pages/APIs. Everything else
// renders as disabled / "Coming Soon" per the brief — never invented.
export const NAV_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { id: 'overview', label: 'Overview',    icon: 'grid',   implemented: true },
      { id: 'tenants',  label: 'Restaurants', icon: 'store',  implemented: true, countKey: 'tenants' },
      { id: 'branches', label: 'Branches',    icon: 'mapPin', implemented: true, countKey: 'branches' },
      { id: 'users',    label: 'Users',       icon: 'users',  implemented: true, countKey: 'users' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'plans',         label: 'Plans',         icon: 'gem',      implemented: true },
      { id: 'subscriptions', label: 'Subscriptions', icon: 'card',     implemented: false },
      { id: 'payments',      label: 'Payments',      icon: 'wallet',   implemented: false },
      { id: 'reports',       label: 'Reports',       icon: 'chart',    implemented: false },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: 'settings', implemented: false },
    ],
  },
];

// ============================================================
// Approximate coordinates for major Indian cities — used to plot the
// branch-distribution map. Any address whose city can't be resolved
// falls into an "Other Locations" bucket, pinned near the geographic
// centre of India with a note in its tooltip. For exact placement
// long-term, capture lat/lng per branch (e.g. a places autocomplete
// field on branch creation) and read branch.latitude / branch.longitude
// directly — see utils/map.utils.js for the resolver that already
// prefers real coordinates when present.
// ============================================================
export const CITY_COORDS = {
  delhi: [28.6139, 77.2090], mumbai: [19.0760, 72.8777], bengaluru: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867], chennai: [13.0827, 80.2707], kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567], ahmedabad: [23.0225, 72.5714], jaipur: [26.9124, 75.7873],
  surat: [21.1702, 72.8311], lucknow: [26.8467, 80.9462], kanpur: [26.4499, 80.3319],
  nagpur: [21.1458, 79.0882], indore: [22.7196, 75.8577], thane: [19.2183, 72.9781],
  bhopal: [23.2599, 77.4126], visakhapatnam: [17.6868, 83.2185], patna: [25.5941, 85.1376],
  vadodara: [22.3072, 73.1812], ghaziabad: [28.6692, 77.4538], ludhiana: [30.9010, 75.8573],
  agra: [27.1767, 78.0081], nashik: [19.9975, 73.7898], faridabad: [28.4089, 77.3178],
  meerut: [28.9845, 77.7064], rajkot: [22.3039, 70.8022], varanasi: [25.3176, 82.9739],
  srinagar: [34.0837, 74.7973], amritsar: [31.6340, 74.8723], 'navi mumbai': [19.0330, 73.0297],
  prayagraj: [25.4358, 81.8463], ranchi: [23.3441, 85.3096], howrah: [22.5958, 88.2636],
  coimbatore: [11.0168, 76.9558], jabalpur: [23.1815, 79.9864], gwalior: [26.2183, 78.1828],
  vijayawada: [16.5062, 80.6480], jodhpur: [26.2389, 73.0243], madurai: [9.9252, 78.1198],
  raipur: [21.2514, 81.6296], kota: [25.2138, 75.8648], chandigarh: [30.7333, 76.7794],
  guwahati: [26.1445, 91.7362], gurugram: [28.4595, 77.0266], noida: [28.5355, 77.3910],
  kochi: [9.9312, 76.2673], bhubaneswar: [20.2961, 85.8245], dehradun: [30.3165, 78.0322],
  mysuru: [12.2958, 76.6394], thiruvananthapuram: [8.5241, 76.9366],
};

// Common alternate spellings people actually type into the address field.
export const CITY_ALIASES = {
  bangalore: 'bengaluru', gurgaon: 'gurugram', cochin: 'kochi',
  trivandrum: 'thiruvananthapuram', allahabad: 'prayagraj', calcutta: 'kolkata',
  bombay: 'mumbai', madras: 'chennai', mysore: 'mysuru', 'new delhi': 'delhi',
};

export const REVENUE_RANGES = [
  { id: '7d',  label: '7D',  days: 7 },
  { id: '14d', label: '14D', days: 14 },
  { id: '30d', label: '30D', days: 30 },
  { id: '90d', label: '90D', days: 90 },
  { id: '1y',  label: '1Y',  days: 365 },
];
