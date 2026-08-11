import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PLANS = {
  starter:    { label: 'Starter',    price: '₹999/mo',  color: '#5B7A99', bg: '#EEF3F7' },
  growth:     { label: 'Growth',     price: '₹2499/mo', color: '#4C8064', bg: '#EFF6F1' },
  enterprise: { label: 'Enterprise', price: '₹4999/mo', color: '#7C5C8C', bg: '#F5EFF7' },
};

const STATUS = {
  trial:     { label: 'Trial',     color: '#C08A3E', bg: '#FBF3E6' },
  active:    { label: 'Active',    color: '#4C8064', bg: '#EFF6F1' },
  suspended: { label: 'Suspended', color: '#B33F2C', bg: '#FBEEEB' },
  cancelled: { label: 'Cancelled', color: '#9A9280', bg: '#F1EEE7' },
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

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('overview');
  const [stats,    setStats]    = useState(null);
  const [tenants,  setTenants]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState({ type: '', text: '' });
  const [filter,   setFilter]   = useState({ status: '', plan: '' });
  const [search,   setSearch]   = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tenantForm,     setTenantForm]     = useState(EMPTY_TENANT_FORM);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const fetchStats = async () => {
    try { const r = await api.get('/super-admin/stats'); setStats(r.data.data); }
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

  useEffect(() => {
    const load = async () => { await Promise.all([fetchStats(), fetchTenants()]); setLoading(false); };
    load();
  }, []);

  useEffect(() => { fetchTenants(); }, [filter]);

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

  const filtered = tenants.filter(t =>
    !search ||
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .sa-nav-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        padding: 7px 13px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .sa-nav-btn:hover { border-color: #A97E44; background: #FBF8F2; color: #A97E44; }

      .sa-primary-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #1A1815;
        color: #F7F5F0;
        border: none;
        border-radius: 4px;
        padding: 9px 18px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .sa-primary-btn:hover { background: #333029; }

      .sa-tab-btn {
        font-family: 'JetBrains Mono', monospace;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 10px 18px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.03em;
        color: #7A7264;
        cursor: pointer;
        margin-bottom: -1px;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .sa-tab-btn:hover { color: #A97E44; }
      .sa-tab-active { color: #A97E44 !important; border-bottom-color: #A97E44 !important; }

      .sa-tenant-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .sa-tenant-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .sa-plan-card { transition: transform 0.15s ease; }
      .sa-plan-card:hover { transform: translateY(-2px); }

      .sa-select {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 11px;
        background: #fff;
        color: #1A1815;
        cursor: pointer;
        outline: none;
      }
      .sa-input {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 13px;
        background: #fff;
        color: #1A1815;
        outline: none;
        box-sizing: border-box;
        width: 100%;
      }
      .sa-input:focus, .sa-select:focus { border-color: #A97E44; }

      @media (max-width: 900px) {
        .sa-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .sa-plan-grid  { grid-template-columns: 1fr !important; }
        .sa-form-grid  { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 560px) {
        .sa-stats-grid { grid-template-columns: 1fr !important; }
        .sa-form-grid  { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING CONTROL CENTER…
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <GlobalStyle />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>⚡ SUPER ADMIN</span>
          <h1 style={styles.pageTitle}>Platform Control Center</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="sa-nav-btn">← My Dashboard</button>
      </div>

      {msg.text && (
        <div style={{
          ...styles.msg,
          ...(msg.type === 'success'
            ? { background: '#EFF6F1', border: '1px solid #C7DECD', color: '#4C8064' }
            : { background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' })
        }}>
          {msg.text}
        </div>
      )}

      {/* Credentials Modal — after create */}
      {createdCredentials && (
        <div style={styles.modalOverlay} onClick={() => setCreatedCredentials(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✅ Restaurant Created</h2>
              <button onClick={() => setCreatedCredentials(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.credBox}>
                <p style={styles.credBoxTitle}>Login Credentials — Save These</p>
                <div style={styles.credRow}><span style={styles.credLabel}>Restaurant</span><span style={styles.credValue}>{createdCredentials.tenant?.name}</span></div>
                <div style={styles.credRow}><span style={styles.credLabel}>Plan</span><span style={styles.credValue}>{createdCredentials.tenant?.plan}</span></div>
                <div style={styles.credRow}><span style={styles.credLabel}>Owner Name</span><span style={styles.credValue}>{createdCredentials.owner?.name}</span></div>
                <div style={styles.credRow}><span style={styles.credLabel}>Login Email</span><span style={styles.credValue}>{createdCredentials.credentials?.email}</span></div>
                <div style={styles.credRow}><span style={styles.credLabel}>Password</span><span style={styles.credValue}>{createdCredentials.credentials?.password}</span></div>
              </div>
              <button onClick={() => setCreatedCredentials(null)} className="sa-primary-btn" style={{ width: '100%', padding: '11px', fontSize: '12px' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTenant(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedTenant.name}</h2>
              <button onClick={() => setSelectedTenant(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalRow}><span style={styles.modalLabel}>Subdomain</span><span>{selectedTenant.subdomain}.debox.com</span></div>
              <div style={styles.modalRow}><span style={styles.modalLabel}>Email</span><span>{selectedTenant.email || '—'}</span></div>
              <div style={styles.modalRow}><span style={styles.modalLabel}>Users</span><span>{selectedTenant.userCount || 0}</span></div>
              <div style={styles.modalRow}><span style={styles.modalLabel}>Orders</span><span>{selectedTenant.orderCount || 0}</span></div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Current Plan</span>
                <span style={{ ...styles.badge, background: PLANS[selectedTenant.plan]?.bg, color: PLANS[selectedTenant.plan]?.color }}>{selectedTenant.plan}</span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Status</span>
                <span style={{ ...styles.badge, background: STATUS[selectedTenant.status]?.bg, color: STATUS[selectedTenant.status]?.color }}>{selectedTenant.status}</span>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>Change Plan — features update automatically</h4>
                <div style={styles.modalActions}>
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => handlePlanChange(selectedTenant.id, key)}
                      className="sa-nav-btn"
                      style={{
                        background: selectedTenant.plan === key ? plan.color : plan.bg,
                        color: selectedTenant.plan === key ? '#fff' : plan.color,
                        border: `1px solid ${plan.color}`,
                      }}
                    >
                      {plan.label} · {plan.price}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>Account Status</h4>
                <div style={styles.modalActions}>
                  <button onClick={() => handleStatusChange(selectedTenant.id, 'active')} className="sa-nav-btn"
                    style={{ background: '#EFF6F1', color: '#4C8064', border: '1px solid #C7DECD' }}>✅ Activate</button>
                  <button onClick={() => handleStatusChange(selectedTenant.id, 'trial')} className="sa-nav-btn"
                    style={{ background: '#FBF3E6', color: '#C08A3E', border: '1px solid #F0DCB0' }}>🕐 Trial</button>
                  <button onClick={() => handleStatusChange(selectedTenant.id, 'suspended')} className="sa-nav-btn"
                    style={{ background: '#FBEEEB', color: '#B33F2C', border: '1px solid #EBC7BC' }}>🚫 Suspend</button>
                </div>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSectionTitle}>Features in the {PLANS[selectedTenant.plan]?.label} plan</h4>
                <div style={styles.featureGrid}>
                  {ALL_FEATURES.map(f => {
                    const has = (PLAN_FEATURES[selectedTenant.plan] || []).includes(f);
                    return (
                      <div key={f} style={{ ...styles.featureChip, background: has ? '#EFF6F1' : '#F1EEE7', color: has ? '#4C8064' : '#B9B0A0' }}>
                        {has ? '✅' : '❌'} {f}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[{ id: 'overview', label: '📊 Overview' }, { id: 'tenants', label: '🏢 Restaurants' }, { id: 'plans', label: '💎 Plans' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`sa-tab-btn ${tab === t.id ? 'sa-tab-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <div>
          <div className="sa-stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statClip} />
              <p style={styles.statLabel}>Total Restaurants</p>
              <p style={styles.statValue}>{stats.tenants.total}</p>
              <p style={styles.statSub}>+{stats.tenants.new_today} today</p>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statClip, background: '#4C8064' }} />
              <p style={styles.statLabel}>Active</p>
              <p style={{ ...styles.statValue, color: '#4C8064' }}>{stats.tenants.active}</p>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statClip, background: '#C08A3E' }} />
              <p style={styles.statLabel}>Trial</p>
              <p style={{ ...styles.statValue, color: '#C08A3E' }}>{stats.tenants.trial}</p>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statClip} />
              <p style={styles.statLabel}>Platform Revenue</p>
              <p style={styles.statValue}>₹{parseFloat(stats.platform.total_revenue || 0).toLocaleString()}</p>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statClip} />
              <p style={styles.statLabel}>Total Orders</p>
              <p style={styles.statValue}>{stats.platform.total_orders}</p>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statClip} />
              <p style={styles.statLabel}>Total Users</p>
              <p style={styles.statValue}>{stats.platform.total_users}</p>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.perforation} />
            <h3 style={styles.cardTitle}>Plan Distribution</h3>
            <div className="sa-plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
              {Object.entries(PLANS).map(([key, plan]) => {
                const count = (stats.by_plan || []).find(p => p.plan === key)?.dataValues?.count || 0;
                const pct = Math.round((count / (stats.tenants.total || 1)) * 100);
                return (
                  <div key={key} className="sa-plan-card" style={styles.planDistCard}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: plan.color }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ ...styles.badge, background: plan.bg, color: plan.color }}>{plan.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#B9B0A0' }}>{plan.price}</span>
                    </div>
                    <p style={{ ...styles.statValue, color: plan.color, fontSize: '30px' }}>{count}</p>
                    <div style={styles.progressTrack}>
                      <div style={{ height: '5px', borderRadius: '999px', background: plan.color, width: `${pct}%` }} />
                    </div>
                    <p style={{ fontSize: '11px', color: '#B9B0A0', margin: '6px 0 0', fontFamily: "'JetBrains Mono', monospace" }}>{pct}% of total</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TENANTS */}
      {tab === 'tenants' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={styles.filterRow}>
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

          {/* Create Tenant Form */}
          {showCreateForm && (
            <div style={styles.formCard}>
              <div style={styles.perforation} />
              <h3 style={styles.cardTitle}>Create New Restaurant</h3>
              <form onSubmit={handleCreateTenant}>
                <div className="sa-form-grid" style={styles.formGrid3}>
                  <div style={styles.field}>
                    <label style={styles.label}>Restaurant Name *</label>
                    <input value={tenantForm.restaurant_name} onChange={e => setTenantForm({ ...tenantForm, restaurant_name: e.target.value })} className="sa-input" required placeholder="The Spice Kitchen" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Subdomain *</label>
                    <input value={tenantForm.subdomain} onChange={e => setTenantForm({ ...tenantForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="sa-input" required placeholder="spice-kitchen" />
                    <span style={{ fontSize: '11px', color: '#B9B0A0', fontFamily: "'JetBrains Mono', monospace" }}>{tenantForm.subdomain || 'xxx'}.debox.com</span>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Restaurant Email</label>
                    <input type="email" value={tenantForm.email} onChange={e => setTenantForm({ ...tenantForm, email: e.target.value })} className="sa-input" placeholder="info@restaurant.com" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Phone</label>
                    <input value={tenantForm.phone} onChange={e => setTenantForm({ ...tenantForm, phone: e.target.value })} className="sa-input" placeholder="9876543210" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Owner Name *</label>
                    <input value={tenantForm.owner_name} onChange={e => setTenantForm({ ...tenantForm, owner_name: e.target.value })} className="sa-input" required placeholder="Ramesh Kumar" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Owner Email *</label>
                    <input type="email" value={tenantForm.owner_email} onChange={e => setTenantForm({ ...tenantForm, owner_email: e.target.value })} className="sa-input" required placeholder="owner@restaurant.com" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Owner Password *</label>
                    <input type="text" value={tenantForm.owner_password} onChange={e => setTenantForm({ ...tenantForm, owner_password: e.target.value })} className="sa-input" required placeholder="Min 8 characters" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Plan</label>
                    <select value={tenantForm.plan} onChange={e => setTenantForm({ ...tenantForm, plan: e.target.value })} className="sa-input">
                      {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.price}</option>)}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Status</label>
                    <select value={tenantForm.status} onChange={e => setTenantForm({ ...tenantForm, status: e.target.value })} className="sa-input">
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button type="submit" className="sa-primary-btn">Create Restaurant</button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="sa-nav-btn">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div style={styles.tenantList}>
            {filtered.map(tenant => {
              const pl = PLANS[tenant.plan] || PLANS.starter;
              const st = STATUS[tenant.status] || STATUS.trial;
              return (
                <div key={tenant.id} className="sa-tenant-card" style={styles.tenantCard}>
                  <div style={styles.tenantLeft}>
                    <div style={{ ...styles.tenantAvatar, background: pl.color }}>{tenant.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 style={styles.tenantName}>{tenant.name}</h3>
                      <p style={styles.tenantSub}>{tenant.subdomain}.debox.com</p>
                      <div style={styles.tenantMeta}>
                        {tenant.email && <span>✉️ {tenant.email}</span>}
                        <span>👤 {tenant.userCount || 0}</span>
                        <span>📦 {tenant.orderCount || 0} orders</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.tenantRight}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ ...styles.badge, background: pl.bg, color: pl.color }}>{pl.label}</span>
                      <span style={{ ...styles.badge, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select value={tenant.plan} onChange={e => handlePlanChange(tenant.id, e.target.value)} className="sa-select">
                        {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <select value={tenant.status} onChange={e => handleStatusChange(tenant.id, e.target.value)} className="sa-select">
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <button onClick={() => setSelectedTenant(tenant)} className="sa-nav-btn" style={{ color: '#A97E44', borderColor: '#A97E44' }}>Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={styles.emptyState}>
                <p>No restaurants yet — use "+ New Restaurant" to add one</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PLANS */}
      {tab === 'plans' && (
        <div className="sa-plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} className="sa-plan-card" style={styles.planDistCard}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: plan.color }} />
              <h3 style={{ color: plan.color, fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.01em', margin: '0 0 4px' }}>{plan.label}</h3>
              <p style={{ color: '#7A7264', fontSize: '13px', margin: '0 0 16px', fontFamily: "'JetBrains Mono', monospace" }}>{plan.price}</p>
              {ALL_FEATURES.map(f => {
                const has = (PLAN_FEATURES[key] || []).includes(f);
                return (
                  <div key={f} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px dashed #E9E3D6', fontSize: '13px', color: has ? '#1A1815' : '#B9B0A0' }}>
                    <span>{f}</span><span>{has ? '✅' : '❌'}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page:     { padding: '28px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  eyebrow:  { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '4px' },
  pageTitle:{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },

  msg: { padding: '10px 16px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' },

  tabs: { display: 'flex', gap: '4px', marginBottom: '22px', borderBottom: '1px solid #E9E3D6' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '14px' },
  statCard:  { background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '16px 16px 14px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip:  { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  statLabel: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7264', margin: '0 0 8px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  statSub:   { fontSize: '11px', color: '#B9B0A0', margin: '4px 0 0' },

  card:      { background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', marginBottom: '16px', position: 'relative' },
  cardTitle: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.03em', color: '#1A1815', margin: '0 0 16px' },
  perforation: { position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px', background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' },

  planDistCard:  { background: '#fff', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '16px', position: 'relative', overflow: 'hidden' },
  progressTrack: { background: '#F1EEE7', borderRadius: '999px', height: '5px', marginTop: '10px' },

  badge: { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', fontFamily: "'JetBrains Mono', monospace" },

  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },

  formCard:  { background: '#fff', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '20px', marginBottom: '16px', position: 'relative' },
  formGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' },
  field:     { display: 'flex', flexDirection: 'column', gap: '4px' },
  label:     { fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7A7264' },

  tenantList:  { display: 'flex', flexDirection: 'column', gap: '10px' },
  tenantCard:  { background: '#fff', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)' },
  tenantLeft:  { display: 'flex', gap: '12px', alignItems: 'center' },
  tenantAvatar:{ width: '44px', height: '44px', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', flexShrink: 0 },
  tenantName:  { fontSize: '15px', fontWeight: '700', color: '#1A1815', margin: '0 0 2px' },
  tenantSub:   { fontSize: '12px', color: '#B9B0A0', margin: '0 0 6px' },
  tenantMeta:  { display: 'flex', gap: '10px', fontSize: '11px', color: '#7A7264', flexWrap: 'wrap' },
  tenantRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },

  emptyState: { textAlign: 'center', padding: '60px', color: '#B9B0A0', background: '#fff', borderRadius: '6px', border: '1px solid #E9E3D6', fontSize: '13px' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(26,24,21,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modal:       { background: '#F7F5F0', borderRadius: '8px', width: '560px', maxWidth: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(26,24,21,0.25)', fontFamily: "'JetBrains Mono', monospace" },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #E9E3D6', position: 'sticky', top: 0, background: '#F7F5F0' },
  modalTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', color: '#1A1815', margin: 0 },
  closeBtn:    { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#7A7264' },
  modalBody:   { padding: '18px 22px' },
  modalRow:    { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '9px 0', borderTop: '1px dashed #E9E3D6', color: '#1A1815' },
  modalLabel:  { fontWeight: '700', color: '#7A7264', fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase' },
  modalSection:{ borderTop: '1px solid #E9E3D6', margin: '16px 0 0', paddingTop: '16px' },
  modalSectionTitle: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 10px', color: '#7A7264' },
  modalActions:{ display: 'flex', gap: '8px', flexWrap: 'wrap' },
  featureGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  featureChip: { borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: '600' },

  credBox:      { background: '#EFF6F1', border: '1px solid #C7DECD', borderRadius: '6px', padding: '16px', marginBottom: '16px' },
  credBoxTitle: { fontWeight: '700', color: '#4C8064', margin: '0 0 12px', fontSize: '12px', letterSpacing: '0.03em' },
  credRow:      { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed #C7DECD', fontSize: '13px' },
  credLabel:    { color: '#4C8064', fontWeight: '600' },
  credValue:    { color: '#1A1815', fontWeight: '700' },
};

export default SuperAdmin;