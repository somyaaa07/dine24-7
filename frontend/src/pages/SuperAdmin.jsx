import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../api';

// ============================================================
// Design tokens — your original cream / amber / earthy palette,
// unchanged. Only new charts, motion, and layout are added.
// ============================================================
const C = {
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

const PLANS = {
  starter:    { label: 'Starter',    price: '₹999/mo',  color: C.blue,   bg: C.blueBg },
  growth:     { label: 'Growth',     price: '₹2499/mo', color: C.green,  bg: C.greenBg },
  enterprise: { label: 'Enterprise', price: '₹4999/mo', color: C.violet, bg: C.violetBg },
};

const STATUS = {
  trial:     { label: 'Trial',     color: C.warn,  bg: C.warnBg },
  active:    { label: 'Active',    color: C.green, bg: C.greenBg },
  suspended: { label: 'Suspended', color: C.red,   bg: C.redBg },
  cancelled: { label: 'Cancelled', color: C.faint, bg: '#F1EEE7' },
};

const PLAN_FEATURES = {
  starter:    ['Dashboard','Tables','Menu','POS','Suppliers','Reservations','Expenses'],
  growth:     ['Dashboard','Tables','Menu','POS','KDS','Inventory','Recipes','Suppliers','Purchase Orders','Customers','Reservations','Employees','Expenses','Reports','Notifications','QR Ordering'],
  enterprise: ['Dashboard','Tables','Menu','POS','KDS','Inventory','Recipes','Suppliers','Purchase Orders','Customers','Reservations','Employees','Expenses','Reports','Analytics','Notifications','QR Ordering','Multi Branch'],
};

const ALL_FEATURES = ['Dashboard','Tables','Menu','POS','KDS','Inventory','Recipes','Suppliers','Purchase Orders','Customers','Reservations','Employees','Expenses','Reports','Analytics','Notifications','QR Ordering','Multi Branch'];

const EMPTY_TENANT_FORM = {
  restaurant_name: '', subdomain: '', email: '', phone: '',
  owner_name: '', owner_email: '', owner_password: '',
  plan: 'starter', status: 'active'
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview',    icon: IconGrid },
  { id: 'tenants',  label: 'Restaurants', icon: IconStore },
  { id: 'branches', label: 'Branches',    icon: IconMapPin },
  { id: 'users',    label: 'Users',       icon: IconUsers },
  { id: 'plans',    label: 'Plans',       icon: IconGem },
];

// ============================================================
// Tiny inline icon set — no icon library dependency.
// ============================================================
function IconGrid({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconStore({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 9l1.5-5h15L21 9" /><path d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" />
      <path d="M5 9v10h14V9" /><path d="M9 21v-6h6v6" />
    </svg>
  );
}
function IconMapPin({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function IconUsers({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17.5" cy="8.5" r="2.5" /><path d="M15.7 14.3c2.6.6 4.3 2.6 4.3 5.7" />
    </svg>
  );
}
function IconGem({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6 3h12l3 5-9 13L3 8z" /><path d="M3 8h18M9 3l-2 5 5 13 5-13-2-5M7 8l5 13 5-13" />
    </svg>
  );
}
function IconArrowLeft({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}
function IconStoreSmall({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 9l1.5-5h15L21 9" /><path d="M5 9v10h14V9" /><path d="M9 21v-6h6v6" />
    </svg>
  );
}

// ============================================================
// Small helpers
// ============================================================
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function AnimatedNumber({ value, prefix = '', duration = 700 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const to = Number(value) || 0;
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{prefix}{display.toLocaleString('en-IN')}</>;
}

function PulseDot({ color = C.green }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

function StatCard({ label, value, prefix = '', icon: Icon, accent = C.amber, live = false, sub }) {
  return (
    <div className="relative bg-white border border-[#E9E3D6] rounded-lg p-4 overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)] hover:shadow-[0_4px_14px_rgba(26,24,21,0.06)] transition-shadow">
      <div className="absolute top-0 left-0 w-[4px] h-full" style={{ background: accent }} />
      <div className="flex items-center justify-between mb-2 pl-1.5">
        <span className="text-[10px] font-bold tracking-wider text-[#7A7264] uppercase">{label}</span>
        {live ? <PulseDot color={accent} /> : Icon && <Icon className="w-4 h-4" style={{ color: accent }} />}
      </div>
      <p className="pl-1.5 text-[28px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}>
        <AnimatedNumber value={value} prefix={prefix} />
      </p>
      {sub && <p className="pl-1.5 text-[11px] text-[#B9B0A0] mt-1.5">{sub}</p>}
    </div>
  );
}

function Badge({ color, bg, children }) {
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

function GhostBtn({ children, onClick, color, bg, border, active }) {
  return (
    <button
      onClick={onClick}
      className="sa-nav-btn"
      style={{ background: active ? color : bg, color: active ? '#fff' : color, borderColor: border || color }}
    >
      {children}
    </button>
  );
}

// Clickable chip shown on every branch card — makes the tenant a branch
// belongs to obvious at a glance, and opens that tenant's detail modal.
function TenantChip({ tenant, onClick }) {
  const plan = PLANS[tenant?.plan] || { color: C.faint, bg: '#F1EEE7' };
  return (
    <button
      onClick={onClick}
      title="View parent restaurant"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-transform hover:-translate-y-[1px]"
      style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.color}44` }}
    >
      <IconStoreSmall className="w-3 h-3" />
      {tenant?.name || 'Unknown restaurant'}
    </button>
  );
}

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('overview');
  const [stats,    setStats]    = useState(null);
  const [trend,    setTrend]    = useState([]);
  const [tenants,  setTenants]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState({ type: '', text: '' });
  const [filter,   setFilter]   = useState({ status: '', plan: '' });
  const [search,   setSearch]   = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tenantForm,     setTenantForm]     = useState(EMPTY_TENANT_FORM);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [branches,      setBranches]      = useState([]);
  const [branchFilter,  setBranchFilter]  = useState({ is_active: '' });
  const [branchSearch,  setBranchSearch]  = useState('');

  const [users,       setUsers]       = useState([]);
  const [userFilter,  setUserFilter]  = useState({ role: '', is_active: '' });
  const [userSearch,  setUserSearch]  = useState('');

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = async () => {
    try { const r = await api.get('/super-admin/stats'); setStats(r.data.data); }
    catch (e) { console.error(e); }
  };

  const fetchTrend = async () => {
    try { const r = await api.get('/super-admin/trend'); setTrend(r.data.data); }
    catch (e) { console.error(e); }
  };

  const fetchTenants = async () => {
    try {
      let url = '/super-admin/tenants?';
      if (filter.status) url += `status=${filter.status}&`;
      if (filter.plan)   url += `plan=${filter.plan}`;
      const r = await api.get(url);
      setTenants(r.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchBranches = async () => {
    try {
      let url = '/super-admin/branches?';
      if (branchFilter.is_active !== '') url += `is_active=${branchFilter.is_active}&`;
      if (branchSearch) url += `search=${encodeURIComponent(branchSearch)}`;
      const r = await api.get(url);
      setBranches(r.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      let url = '/super-admin/users?';
      if (userFilter.role) url += `role=${userFilter.role}&`;
      if (userFilter.is_active !== '') url += `is_active=${userFilter.is_active}&`;
      if (userSearch) url += `search=${encodeURIComponent(userSearch)}`;
      const r = await api.get(url);
      setUsers(r.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => { await Promise.all([fetchStats(), fetchTenants(), fetchTrend()]); setLoading(false); };
    load();
  }, []);

  useEffect(() => { fetchTenants(); }, [filter]);
  useEffect(() => { if (tab === 'branches') fetchBranches(); }, [tab, branchFilter]);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, userFilter]);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000); };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        resturant_name: tenantForm.restaurant_name,
        owner_name:     tenantForm.owner_name,
        email:          tenantForm.owner_email,
        password:       tenantForm.owner_password,
        plan:           tenantForm.plan,
        status:         tenantForm.status,
      };
      const res = await api.post('/super-admin/tenants', payload);
      showMsg('success', `"${tenantForm.restaurant_name}" created successfully!`);
      setCreatedCredentials(res.data.data);
      setTenantForm(EMPTY_TENANT_FORM);
      setShowCreateForm(false);
      fetchTenants(); fetchStats();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Create failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/super-admin/tenants/${id}/status`, { status });
      showMsg('success', `Status → ${status}`);
      fetchTenants(); fetchStats();
      if (selectedTenant?.id === id) setSelectedTenant(prev => ({ ...prev, status }));
    } catch (e) { showMsg('error', 'Failed'); }
  };

  const handlePlanChange = async (id, plan) => {
    try {
      await api.put(`/super-admin/tenants/${id}/plan`, { plan });
      showMsg('success', `Plan → ${plan} — features updated!`);
      fetchTenants(); fetchStats();
      if (selectedTenant?.id === id) setSelectedTenant(prev => ({ ...prev, plan }));
    } catch (e) { showMsg('error', 'Failed'); }
  };

  const handleBranchStatusChange = async (id, is_active) => {
    try {
      await api.put(`/super-admin/branches/${id}/status`, { is_active });
      showMsg('success', `Branch ${is_active ? 'activated' : 'suspended'}`);
      fetchBranches();
    } catch (e) { showMsg('error', e.response?.data?.message || 'Failed'); }
  };

  const handleUserStatusChange = async (id, is_active) => {
    try {
      await api.put(`/super-admin/users/${id}/status`, { is_active });
      showMsg('success', `User ${is_active ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (e) { showMsg('error', e.response?.data?.message || 'Failed'); }
  };

  // Opens the full tenant-detail modal from a branch card's tenant chip —
  // reuses the existing tenant detail endpoint + modal.
  const openTenantFromBranch = async (tenant) => {
    if (!tenant?.id) return;
    try {
      const r = await api.get(`/super-admin/tenants/${tenant.id}`);
      setSelectedTenant(r.data.data);
    } catch (e) { showMsg('error', 'Could not load restaurant details'); }
  };

  const filtered = tenants.filter(t =>
    !search ||
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBranches = branchSearch
    ? branches.filter(b =>
        b.name?.toLowerCase().includes(branchSearch.toLowerCase()) ||
        b.address?.toLowerCase().includes(branchSearch.toLowerCase())
      )
    : branches;

  const filteredUsers = userSearch
    ? users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : users;

  // Group branches by "city" (last comma-segment of the address) for the
  // radar distribution view — a stand-in for a real map until lat/lng exist.
  const cityGroups = useMemo(() => {
    const groups = {};
    branches.forEach(b => {
      const parts = (b.address || '').split(',').map(s => s.trim()).filter(Boolean);
      const city = parts.length ? parts[parts.length - 1] : 'Unknown';
      if (!groups[city]) groups[city] = { city, branches: [], orderCount: 0, revenue: 0, activeCount: 0 };
      groups[city].branches.push(b);
      groups[city].orderCount += b.orderCount || 0;
      groups[city].revenue += Number(b.revenue || 0);
      if (b.is_active) groups[city].activeCount += 1;
    });
    return Object.values(groups).sort((a, b) => b.orderCount - a.orderCount);
  }, [branches]);

  const planData = (stats?.by_plan || []).map(p => ({
    plan: p.plan,
    count: Number(p.count ?? p.dataValues?.count ?? 0),
  }));

  const GlobalStyle = () => (
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F0]">
        <GlobalStyle />
        <p className="text-[13px] tracking-wider text-[#7A7264]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          LOADING CONTROL CENTER…
        </p>
      </div>
    );
  }

  const activeLabel = NAV_ITEMS.find(n => n.id === tab)?.label || 'Overview';

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1815]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <GlobalStyle />

      {/* Sidebar */}
      <aside className="w-[230px] shrink-0 bg-white border-r border-[#E9E3D6] flex flex-col">
        <div className="px-5 py-6 border-b border-[#E9E3D6]">
          <div className="flex items-center gap-2">
            <PulseDot color={C.amber} />
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#A97E44]">DINE24-7</span>
          </div>
          <h1 className="mt-2 text-[26px] text-[#1A1815] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}>
            Control Tower
          </h1>
          <p className="mt-2 text-[11px] text-[#B9B0A0] tabular-nums">
            {now.toLocaleTimeString('en-IN', { hour12: false })} · {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold tracking-wide transition-colors ${
                tab === item.id ? 'bg-[#FBF8F2] text-[#1A1815]' : 'text-[#9A9280] hover:text-[#4A453D] hover:bg-[#FBF8F2]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${tab === item.id ? 'text-[#A97E44]' : 'text-[#C7BFAE] group-hover:text-[#A97E44]'}`} />
              {item.label}
              {tab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A97E44]" />}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#E9E3D6]">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-semibold text-[#9A9280] hover:text-[#1A1815] hover:bg-[#FBF8F2] transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" /> My Dashboard
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1360px] mx-auto px-8 py-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#A97E44]">⚡ SUPER ADMIN</span>
              <h2 className="text-[26px] text-[#1A1815] mt-0.5 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}>
                {activeLabel}
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E9E3D6]">
              <PulseDot color={C.green} />
              <span className="text-[10px] font-bold tracking-wider text-[#4C8064]">LIVE</span>
            </div>
          </div>

          {msg.text && (
            <div className="mb-5 px-4 py-2.5 rounded-lg text-[13px] font-semibold border"
              style={msg.type === 'success'
                ? { background: C.greenBg, borderColor: C.greenBorder, color: C.green }
                : { background: C.redBg, borderColor: C.redBorder, color: C.red }}>
              {msg.text}
            </div>
          )}

          {/* Credentials modal */}
          {createdCredentials && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setCreatedCredentials(null)}>
              <div className="bg-[#F7F5F0] border border-[#E9E3D6] rounded-lg w-[520px] max-w-full max-h-[85vh] overflow-auto shadow-[0_20px_60px_rgba(26,24,21,0.25)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#E9E3D6] sticky top-0 bg-[#F7F5F0]">
                  <h2 className="text-[20px] text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>✅ Restaurant Created</h2>
                  <button onClick={() => setCreatedCredentials(null)} className="text-[#7A7264] hover:text-[#1A1815]">✕</button>
                </div>
                <div className="p-6">
                  <div className="rounded-lg p-4 mb-4 space-y-1" style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}` }}>
                    <p className="text-[12px] font-bold mb-2 tracking-wide" style={{ color: C.green }}>Login Credentials — Save These</p>
                    {[
                      ['Restaurant', createdCredentials.tenant?.name],
                      ['Plan', createdCredentials.tenant?.plan],
                      ['Owner Name', createdCredentials.owner?.name],
                      ['Login Email', createdCredentials.credentials?.email],
                      ['Password', createdCredentials.credentials?.password],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-[13px] border-t border-dashed pt-1.5" style={{ borderColor: C.greenBorder }}>
                        <span style={{ color: C.green, fontWeight: 600 }}>{label}</span><span className="text-[#1A1815] font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCreatedCredentials(null)} className="w-full py-2.5 rounded-lg bg-[#1A1815] text-[#F7F5F0] text-[12px] font-bold">Done</button>
                </div>
              </div>
            </div>
          )}

          {/* Tenant detail modal */}
          {selectedTenant && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTenant(null)}>
              <div className="bg-[#F7F5F0] border border-[#E9E3D6] rounded-lg w-[560px] max-w-full max-h-[85vh] overflow-auto shadow-[0_20px_60px_rgba(26,24,21,0.25)]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#E9E3D6] sticky top-0 bg-[#F7F5F0]">
                  <h2 className="text-[20px] text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{selectedTenant.name}</h2>
                  <button onClick={() => setSelectedTenant(null)} className="text-[#7A7264] hover:text-[#1A1815]">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    {[
                      ['Subdomain', `${selectedTenant.subdomain}.debox.com`],
                      ['Email', selectedTenant.email || '—'],
                      ['Users', selectedTenant.userCount ?? selectedTenant.stats?.users ?? 0],
                      ['Orders', selectedTenant.orderCount ?? selectedTenant.stats?.orders ?? 0],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-[13px] py-2 border-t border-dashed border-[#E9E3D6]">
                        <span className="text-[#7A7264] uppercase text-[11px] font-bold tracking-wide">{label}</span><span className="text-[#1A1815]">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-[13px] py-2 border-t border-dashed border-[#E9E3D6]">
                      <span className="text-[#7A7264] uppercase text-[11px] font-bold tracking-wide">Current Plan</span>
                      <Badge color={PLANS[selectedTenant.plan]?.color} bg={PLANS[selectedTenant.plan]?.bg}>{selectedTenant.plan}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-[13px] py-2 border-t border-dashed border-[#E9E3D6]">
                      <span className="text-[#7A7264] uppercase text-[11px] font-bold tracking-wide">Status</span>
                      <Badge color={STATUS[selectedTenant.status]?.color} bg={STATUS[selectedTenant.status]?.bg}>{selectedTenant.status}</Badge>
                    </div>
                  </div>

                  <div className="border-t border-[#E9E3D6] pt-4">
                    <h4 className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-2">Change Plan — features update automatically</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(PLANS).map(([key, plan]) => (
                        <GhostBtn key={key} color={plan.color} bg={plan.bg} active={selectedTenant.plan === key} onClick={() => handlePlanChange(selectedTenant.id, key)}>
                          {plan.label} · {plan.price}
                        </GhostBtn>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#E9E3D6] pt-4">
                    <h4 className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-2">Account Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <GhostBtn color={C.green} bg={C.greenBg} border={C.greenBorder} active={selectedTenant.status === 'active'} onClick={() => handleStatusChange(selectedTenant.id, 'active')}>✅ Activate</GhostBtn>
                      <GhostBtn color={C.warn} bg={C.warnBg} border={C.warnBorder} active={selectedTenant.status === 'trial'} onClick={() => handleStatusChange(selectedTenant.id, 'trial')}>🕐 Trial</GhostBtn>
                      <GhostBtn color={C.red} bg={C.redBg} border={C.redBorder} active={selectedTenant.status === 'suspended'} onClick={() => handleStatusChange(selectedTenant.id, 'suspended')}>🚫 Suspend</GhostBtn>
                    </div>
                  </div>

                  <div className="border-t border-[#E9E3D6] pt-4">
                    <h4 className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-2">Features in the {PLANS[selectedTenant.plan]?.label} plan</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_FEATURES.map(f => {
                        const has = (PLAN_FEATURES[selectedTenant.plan] || []).includes(f);
                        return (
                          <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: has ? C.greenBg : '#F1EEE7', color: has ? C.green : C.faint }}>
                            {has ? '✅' : '❌'} {f}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OVERVIEW */}
          {tab === 'overview' && stats && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
                <StatCard label="Restaurants" value={stats.tenants.total} icon={IconStore} accent={C.blue} sub={`+${stats.tenants.new_today} today`} />
                <StatCard label="Active" value={stats.tenants.active} accent={C.green} live />
                <StatCard label="Trial" value={stats.tenants.trial} accent={C.warn} />
                <StatCard label="Revenue" value={stats.platform.total_revenue} prefix="₹" accent={C.green} live />
                <StatCard label="Orders" value={stats.platform.total_orders} accent={C.violet} live />
                <StatCard label="Users" value={stats.platform.total_users} icon={IconUsers} accent={C.amber} />
              </div>

              <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 mb-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-bold tracking-wide text-[#1A1815]">14-Day Revenue &amp; Orders</h3>
                  <span className="text-[10px] text-[#B9B0A0]">Live order data</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={trend}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={C.border} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis yAxisId="rev" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={46} tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                    <YAxis yAxisId="ord" orientation="right" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} labelStyle={{ color: C.muted }} />
                    <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke={C.green} fill="url(#revGrad)" strokeWidth={2} />
                    <Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders" stroke={C.blue} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
                <h3 className="text-[12px] font-bold tracking-wide text-[#1A1815] mb-4">Plan Distribution</h3>
                <div className="flex items-center gap-8 flex-wrap">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={planData} dataKey="count" nameKey="plan" innerRadius={44} outerRadius={64} paddingAngle={3} stroke="none">
                        {planData.map(entry => <Cell key={entry.plan} fill={PLANS[entry.plan]?.color || C.faint} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 min-w-[180px] space-y-2.5">
                    {planData.map(p => (
                      <div key={p.plan} className="flex items-center justify-between text-[12px]">
                        <span className="flex items-center gap-2 text-[#4A453D] capitalize">
                          <span className="w-2 h-2 rounded-full" style={{ background: PLANS[p.plan]?.color }} />
                          {PLANS[p.plan]?.label || p.plan}
                        </span>
                        <span className="font-bold text-[#1A1815] tabular-nums">{p.count}</span>
                      </div>
                    ))}
                    {planData.length === 0 && <p className="text-[#B9B0A0] text-[12px]">No restaurants yet</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TENANTS */}
          {tab === 'tenants' && (
            <div>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="sa-input" style={{ minWidth: '200px' }} />
                  <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="sa-select">
                    <option value="">All Status</option>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={filter.plan} onChange={e => setFilter({ ...filter, plan: e.target.value })} className="sa-select">
                    <option value="">All Plans</option>
                    {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <button onClick={() => setShowCreateForm(!showCreateForm)} className="sa-primary-btn">+ New Restaurant</button>
              </div>

              {showCreateForm && (
                <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 mb-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
                  <h3 className="text-[12px] font-bold tracking-wide text-[#1A1815] mb-4">Create New Restaurant</h3>
                  <form onSubmit={handleCreateTenant}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Field label="Restaurant Name *"><input value={tenantForm.restaurant_name} onChange={e => setTenantForm({ ...tenantForm, restaurant_name: e.target.value })} className="sa-input" required placeholder="The Spice Kitchen" /></Field>
                      <Field label="Subdomain *">
                        <input value={tenantForm.subdomain} onChange={e => setTenantForm({ ...tenantForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="sa-input" required placeholder="spice-kitchen" />
                        <span className="text-[10px] text-[#B9B0A0]">{tenantForm.subdomain || 'xxx'}.debox.com</span>
                      </Field>
                      <Field label="Restaurant Email"><input type="email" value={tenantForm.email} onChange={e => setTenantForm({ ...tenantForm, email: e.target.value })} className="sa-input" placeholder="info@restaurant.com" /></Field>
                      <Field label="Phone"><input value={tenantForm.phone} onChange={e => setTenantForm({ ...tenantForm, phone: e.target.value })} className="sa-input" placeholder="9876543210" /></Field>
                      <Field label="Owner Name *"><input value={tenantForm.owner_name} onChange={e => setTenantForm({ ...tenantForm, owner_name: e.target.value })} className="sa-input" required placeholder="Ramesh Kumar" /></Field>
                      <Field label="Owner Email *"><input type="email" value={tenantForm.owner_email} onChange={e => setTenantForm({ ...tenantForm, owner_email: e.target.value })} className="sa-input" required placeholder="owner@restaurant.com" /></Field>
                      <Field label="Owner Password *"><input type="text" value={tenantForm.owner_password} onChange={e => setTenantForm({ ...tenantForm, owner_password: e.target.value })} className="sa-input" required placeholder="Min 8 characters" /></Field>
                      <Field label="Plan">
                        <select value={tenantForm.plan} onChange={e => setTenantForm({ ...tenantForm, plan: e.target.value })} className="sa-input">
                          {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.price}</option>)}
                        </select>
                      </Field>
                      <Field label="Status">
                        <select value={tenantForm.status} onChange={e => setTenantForm({ ...tenantForm, status: e.target.value })} className="sa-input">
                          <option value="active">Active</option><option value="trial">Trial</option>
                        </select>
                      </Field>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="sa-primary-btn">Create Restaurant</button>
                      <button type="button" onClick={() => setShowCreateForm(false)} className="sa-nav-btn">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-2.5">
                {filtered.map(tenant => {
                  const pl = PLANS[tenant.plan] || PLANS.starter;
                  const st = STATUS[tenant.status] || STATUS.trial;
                  return (
                    <div key={tenant.id} className="sa-card">
                      <div className="flex gap-3 items-center">
                        <div className="w-11 h-11 rounded-md flex items-center justify-center text-white text-[20px] shrink-0" style={{ background: pl.color, fontFamily: "'Bebas Neue', sans-serif" }}>
                          {tenant.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-[#1A1815]">{tenant.name}</h3>
                          <p className="text-[12px] text-[#B9B0A0]">{tenant.subdomain}.debox.com</p>
                          <div className="flex gap-3 text-[11px] text-[#7A7264] mt-1 flex-wrap">
                            {tenant.email && <span>✉️ {tenant.email}</span>}
                            <span>👤 {tenant.userCount || 0}</span>
                            <span>📦 {tenant.orderCount || 0} orders</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1.5"><Badge color={pl.color} bg={pl.bg}>{pl.label}</Badge><Badge color={st.color} bg={st.bg}>{st.label}</Badge></div>
                        <div className="flex gap-1.5">
                          <select value={tenant.plan} onChange={e => handlePlanChange(tenant.id, e.target.value)} className="sa-select">
                            {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <select value={tenant.status} onChange={e => handleStatusChange(tenant.id, e.target.value)} className="sa-select">
                            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <button onClick={() => setSelectedTenant(tenant)} className="sa-nav-btn">Details</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && <EmptyState text='No restaurants yet — use "+ New Restaurant" to add one' />}
              </div>
            </div>
          )}

          {/* BRANCHES */}
          {tab === 'branches' && (
            <div>
              <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 mb-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-bold tracking-wide text-[#1A1815]">Branch Distribution</h3>
                  <span className="text-[10px] text-[#B9B0A0]">Grouped by city · bubble size = order volume</span>
                </div>
                <div className="flex gap-6 flex-wrap lg:flex-nowrap">
                  <div className="relative w-full max-w-[340px] aspect-square mx-auto shrink-0">
                    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
                      {[70, 120, 170].map(r => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke={C.border} strokeWidth="1" />)}
                      <circle cx="200" cy="200" r="3" fill={C.amber} />
                    </svg>
                    <div
                      className="absolute inset-0 rounded-full animate-spin pointer-events-none"
                      style={{
                        animationDuration: '6s',
                        background: `conic-gradient(from 0deg, ${C.amber}26, transparent 35%)`,
                        maskImage: 'radial-gradient(circle, black 60%, transparent 92%)',
                        WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 92%)',
                      }}
                    />
                    {cityGroups.map(g => {
                      const hash = hashCode(g.city);
                      const angle = (hash % 360) * Math.PI / 180;
                      const radiusPct = 0.28 + ((hash % 100) / 100) * 0.62;
                      const maxR = 170;
                      const cx = 200 + Math.cos(angle) * maxR * radiusPct;
                      const cy = 200 + Math.sin(angle) * maxR * radiusPct;
                      const size = Math.min(54, Math.max(20, 14 + Math.sqrt(g.orderCount || 1) * 6));
                      const allActive = g.activeCount === g.branches.length;
                      const noneActive = g.activeCount === 0;
                      const color = noneActive ? C.red : allActive ? C.green : C.warn;
                      return (
                        <div
                          key={g.city}
                          title={`${g.city} — ${g.branches.length} branch(es), ${g.orderCount} orders, ₹${g.revenue.toLocaleString('en-IN')}`}
                          className="absolute rounded-full flex items-center justify-center text-[9px] font-bold cursor-default transition-transform hover:scale-110"
                          style={{
                            left: `${(cx / 400) * 100}%`, top: `${(cy / 400) * 100}%`,
                            width: size, height: size, transform: 'translate(-50%, -50%)',
                            background: `${color}22`, border: `1.5px solid ${color}`, color,
                          }}
                        >
                          {g.branches.length}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex-1 min-w-[220px] space-y-2">
                    {cityGroups.map(g => (
                      <div key={g.city} className="flex items-center justify-between text-[12px] px-3 py-2.5 rounded-lg bg-[#FBF8F2] border border-[#E9E3D6]">
                        <div>
                          <p className="text-[#1A1815] font-semibold">{g.city}</p>
                          <p className="text-[#B9B0A0] text-[10px]">{g.branches.length} branch{g.branches.length !== 1 ? 'es' : ''} · {g.activeCount} active</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold tabular-nums" style={{ color: C.green }}>₹{g.revenue.toLocaleString('en-IN')}</p>
                          <p className="text-[#B9B0A0] text-[10px]">{g.orderCount} orders</p>
                        </div>
                      </div>
                    ))}
                    {cityGroups.length === 0 && <p className="text-[#B9B0A0] text-[12px]">No branches yet</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  <input value={branchSearch} onChange={e => setBranchSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBranches()} placeholder="Search branch or address…" className="sa-input" style={{ minWidth: '220px' }} />
                  <select value={branchFilter.is_active} onChange={e => setBranchFilter({ ...branchFilter, is_active: e.target.value })} className="sa-select">
                    <option value="">All Branches</option><option value="true">Active</option><option value="false">Suspended</option>
                  </select>
                  <button onClick={fetchBranches} className="sa-nav-btn">Search</button>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredBranches.map(branch => (
                  <div key={branch.id} className="sa-card">
                    <div className="flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-md flex items-center justify-center text-white text-[20px] shrink-0" style={{ background: branch.is_active ? C.green : C.red, fontFamily: "'Bebas Neue', sans-serif" }}>
                        {branch.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-[15px] font-bold text-[#1A1815]">{branch.name}</h3>
                          {branch.is_main && <span className="text-[10px] text-[#A97E44] font-bold">MAIN</span>}
                          <TenantChip tenant={branch.Tenant} onClick={() => openTenantFromBranch(branch.Tenant)} />
                        </div>
                        <p className="text-[12px] text-[#B9B0A0]">{branch.address}</p>
                        <div className="flex gap-3 text-[11px] text-[#7A7264] mt-1 flex-wrap">
                          <span>📦 {branch.orderCount || 0} orders</span>
                          <span>💰 ₹{parseFloat(branch.revenue || 0).toLocaleString('en-IN')}</span>
                          {branch.phone && <span>📞 {branch.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge color={branch.is_active ? C.green : C.red} bg={branch.is_active ? C.greenBg : C.redBg}>{branch.is_active ? 'Active' : 'Suspended'}</Badge>
                      <GhostBtn
                        color={branch.is_active ? C.red : C.green}
                        bg={branch.is_active ? C.redBg : C.greenBg}
                        border={branch.is_active ? C.redBorder : C.greenBorder}
                        onClick={() => handleBranchStatusChange(branch.id, !branch.is_active)}
                      >
                        {branch.is_active ? 'Suspend' : 'Activate'}
                      </GhostBtn>
                    </div>
                  </div>
                ))}
                {filteredBranches.length === 0 && <EmptyState text="No branches found" />}
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} placeholder="Search name or email…" className="sa-input" style={{ minWidth: '220px' }} />
                  <select value={userFilter.role} onChange={e => setUserFilter({ ...userFilter, role: e.target.value })} className="sa-select">
                    <option value="">All Roles</option><option value="owner">Owner</option><option value="manager">Manager</option><option value="waiter">Waiter</option><option value="chef">Chef</option>
                  </select>
                  <select value={userFilter.is_active} onChange={e => setUserFilter({ ...userFilter, is_active: e.target.value })} className="sa-select">
                    <option value="">All Status</option><option value="true">Active</option><option value="false">Suspended</option>
                  </select>
                  <button onClick={fetchUsers} className="sa-nav-btn">Search</button>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredUsers.map(u => (
                  <div key={u.id} className="sa-card">
                    <div className="flex gap-3 items-center">
                      <div className="w-11 h-11 rounded-md flex items-center justify-center text-white text-[20px] shrink-0" style={{ background: u.is_active ? C.blue : C.red, fontFamily: "'Bebas Neue', sans-serif" }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#1A1815]">{u.name}</h3>
                        <p className="text-[12px] text-[#B9B0A0]">{u.email}</p>
                        <div className="flex gap-2 flex-wrap mt-1">
                          <TenantChip tenant={u.Tenant} onClick={() => openTenantFromBranch(u.Tenant)} />
                          <span className="text-[11px] text-[#7A7264] self-center">🎭 {u.Role?.name || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge color={u.is_active ? C.green : C.red} bg={u.is_active ? C.greenBg : C.redBg}>{u.is_active ? 'Active' : 'Suspended'}</Badge>
                      <GhostBtn
                        color={u.is_active ? C.red : C.green}
                        bg={u.is_active ? C.redBg : C.greenBg}
                        border={u.is_active ? C.redBorder : C.greenBorder}
                        onClick={() => handleUserStatusChange(u.id, !u.is_active)}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </GhostBtn>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && <EmptyState text="No users found" />}
              </div>
            </div>
          )}

          {/* PLANS */}
          {tab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PLANS).map(([key, plan]) => (
                <div key={key} className="relative bg-white border border-[#E9E3D6] rounded-lg p-5 overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
                  <div className="absolute top-0 left-0 w-full h-[4px]" style={{ background: plan.color }} />
                  <h3 className="text-[24px] mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", color: plan.color }}>{plan.label}</h3>
                  <p className="text-[13px] text-[#B9B0A0] mb-4 tabular-nums">{plan.price}</p>
                  {ALL_FEATURES.map(f => {
                    const has = (PLAN_FEATURES[key] || []).includes(f);
                    return (
                      <div key={f} className="flex justify-between py-1.5 border-t border-dashed border-[#E9E3D6] text-[13px]" style={{ color: has ? C.ink : C.faint }}>
                        <span>{f}</span><span>{has ? '✅' : '❌'}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .sa-nav-btn {
          font-family: 'JetBrains Mono', monospace;
          background: #FFFFFF; border: 1px solid #D8D1C2; color: #1A1815;
          padding: 7px 13px; border-radius: 4px; cursor: pointer;
          font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .sa-nav-btn:hover { border-color: #A97E44; background: #FBF8F2; color: #A97E44; }
        .sa-primary-btn {
          font-family: 'JetBrains Mono', monospace;
          background: #1A1815; color: #F7F5F0; border: none; border-radius: 4px;
          padding: 9px 18px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; transition: background 0.15s ease;
        }
        .sa-primary-btn:hover { background: #333029; }
        .sa-select {
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid #D8D1C2; border-radius: 4px; padding: 6px 8px;
          font-size: 11px; background: #fff; color: #1A1815; cursor: pointer; outline: none;
        }
        .sa-input {
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid #D8D1C2; border-radius: 4px; padding: 8px 12px;
          font-size: 13px; background: #fff; color: #1A1815; outline: none;
          box-sizing: border-box; width: 100%;
        }
        .sa-input:focus, .sa-select:focus { border-color: #A97E44; }
        .sa-input::placeholder { color: #B9B0A0; }
        .sa-card {
          background: #fff; border-radius: 6px; border: 1px solid #E9E3D6; padding: 16px;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
          box-shadow: 0 1px 2px rgba(26,24,21,0.03); transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sa-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }
      `}</style>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold tracking-wide text-[#7A7264] uppercase">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-16 text-[#B9B0A0] bg-white rounded-lg border border-[#E9E3D6] text-[13px]">
      <p>{text}</p>
    </div>
  );
}

export default SuperAdmin;