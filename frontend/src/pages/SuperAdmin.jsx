import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PLAN_COLORS   = { starter: { bg: '#EDF1F5', color: '#3B5170' }, growth: { bg: '#F0F7EE', color: '#3F7D33' }, enterprise: { bg: '#F5EEF3', color: '#7A4B6B' } };
const STATUS_COLORS = { trial: { bg: '#FBF3E6', color: '#8B5F2A' }, active: { bg: '#F0F7EE', color: '#3F7D33' }, suspended: { bg: '#FBEEEB', color: '#B33F2C' }, cancelled: { bg: '#F0EDE4', color: '#7A7264' } };

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('overview');
  const [stats,    setStats]    = useState(null);
  const [tenants,  setTenants]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState({ type:'', text:'' });
  const [filter,   setFilter]   = useState({ status:'', plan:'' });

  const fetchStats = async () => {
    try { const r = await api.get('/super-admin/stats'); setStats(r.data.data); }
    catch(e) { console.error(e); }
  };

  const fetchTenants = async () => {
    try {
      let url = '/super-admin/tenants?';
      if (filter.status) url += `status=${filter.status}&`;
      if (filter.plan)   url += `plan=${filter.plan}`;
      const r = await api.get(url);
      setTenants(r.data.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchStats(), fetchTenants()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { fetchTenants(); }, [filter]);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:'', text:'' }), 3000); };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/super-admin/tenants/${id}/status`, { status });
      showMsg('success', `Status updated to ${status}`);
      fetchTenants(); fetchStats();
    } catch(e) { showMsg('error','Failed'); }
  };

  const handlePlanChange = async (id, plan) => {
    try {
      await api.put(`/super-admin/tenants/${id}/plan`, { plan });
      showMsg('success', `Plan updated to ${plan}`);
      fetchTenants(); fetchStats();
    } catch(e) { showMsg('error','Failed'); }
  };

  const handleCancel = async (id, name) => {
    if (!window.confirm(`Cancel ${name}? This will suspend their account.`)) return;
    try {
      await api.delete(`/super-admin/tenants/${id}`);
      showMsg('success', 'Tenant cancelled');
      fetchTenants(); fetchStats();
    } catch(e) { showMsg('error','Failed'); }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rsa-outline-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        border-radius: 4px;
        padding: 9px 16px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .rsa-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rsa-tab {
        font-family: 'JetBrains Mono', monospace;
        padding: 10px 18px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: #7A7264;
        margin-bottom: -1px;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .rsa-tab:hover { color: #1A1815; }
      .rsa-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rsa-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rsa-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rsa-plan-card { transition: transform 0.15s ease; }
      .rsa-plan-card:hover { transform: translateY(-2px); }

      .rsa-filter-select {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12.5px;
        color: #1A1815;
        outline: none;
        background: #FFFFFF;
        cursor: pointer;
        transition: border-color 0.15s ease;
      }
      .rsa-filter-select:focus { border-color: #A97E44; }

      .rsa-tenant-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rsa-tenant-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rsa-action-select {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 5px 8px;
        font-size: 11.5px;
        color: #1A1815;
        outline: none;
        cursor: pointer;
        background: #FFFFFF;
        transition: border-color 0.15s ease;
      }
      .rsa-action-select:focus { border-color: #A97E44; }

      .rsa-cancel-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rsa-cancel-btn:hover { background: #F6DFD9; }

      @media (max-width: 640px) {
        .rsa-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rsa-filters { flex-wrap: wrap; }
        .rsa-total-count { margin-left: 0 !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING…
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <GlobalStyle />

      <div className="rsa-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>PLATFORM CONTROL</span>
          <h1 style={s.title}>⚡ Super Admin</h1>
          <p style={s.subtitle}>Platform management dashboard</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="rsa-outline-btn">← My Dashboard</button>
      </div>

      {msg.text && <div style={{ ...s.msg, ...(msg.type==='success'?s.msgOk:s.msgErr) }}>{msg.text}</div>}

      <div style={s.tabs}>
        {['overview','tenants'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rsa-tab ${tab === t ? 'rsa-tab-active' : ''}`}
          >
            {t === 'overview' ? '📊 Platform Overview' : '🏢 All Tenants'}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <div>
          <div style={s.statsGrid}>
            <div className="rsa-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Restaurants</p>
              <p style={s.statValue}>{stats.tenants.total}</p>
              <p style={s.statSub}>+{stats.tenants.new_today} today</p>
            </div>
            <div className="rsa-stat-card" style={{ ...s.statCard, background:'#F0F7EE' }}>
              <div style={{ ...s.statClip, background: '#3F7D33' }} />
              <p style={s.statLabel}>Active</p>
              <p style={{ ...s.statValue, color:'#3F7D33' }}>{stats.tenants.active}</p>
            </div>
            <div className="rsa-stat-card" style={{ ...s.statCard, background:'#FBF3E6' }}>
              <div style={{ ...s.statClip, background: '#A97E44' }} />
              <p style={s.statLabel}>On Trial</p>
              <p style={{ ...s.statValue, color:'#8B5F2A' }}>{stats.tenants.trial}</p>
            </div>
            <div className="rsa-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Platform Revenue</p>
              <p style={s.statValue}>₹{parseFloat(stats.platform.total_revenue||0).toLocaleString()}</p>
            </div>
            <div className="rsa-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Orders</p>
              <p style={s.statValue}>{stats.platform.total_orders}</p>
            </div>
            <div className="rsa-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Users</p>
              <p style={s.statValue}>{stats.platform.total_users}</p>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Restaurants by Plan</h3>
            <div style={s.planGrid}>
              {(stats.by_plan || []).map(p => (
                <div key={p.plan} className="rsa-plan-card" style={{ ...s.planCard, background: PLAN_COLORS[p.plan]?.bg || '#F0EDE4' }}>
                  <p style={{ ...s.planName, color: PLAN_COLORS[p.plan]?.color || '#7A7264' }}>{p.plan?.toUpperCase()}</p>
                  <p style={s.planCount}>{p.dataValues?.count || p.count}</p>
                  <p style={s.planLabel}>restaurants</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TENANTS */}
      {tab === 'tenants' && (
        <div>
          <div className="rsa-filters" style={s.filters}>
            <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="rsa-filter-select">
              <option value="">All Status</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={filter.plan} onChange={e => setFilter({...filter, plan: e.target.value})} className="rsa-filter-select">
              <option value="">All Plans</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <span className="rsa-total-count" style={s.totalCount}>{tenants.length} restaurants</span>
          </div>

          <div style={s.tenantList}>
            {tenants.map(tenant => (
              <div key={tenant.id} className="rsa-tenant-card" style={s.tenantCard}>
                <div style={s.tenantClip} />
                <div style={s.tenantLeft}>
                  <div style={s.tenantAvatar}>{tenant.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 style={s.tenantName}>{tenant.name}</h3>
                    <p style={s.tenantSub}>{tenant.subdomain}.debox.com</p>
                    <div style={s.tenantMeta}>
                      <span>👤 {tenant.userCount} users</span>
                      <span>📦 {tenant.orderCount} orders</span>
                      <span>📅 {new Date(tenant.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div style={s.tenantRight}>
                  <div style={s.badges}>
                    <span style={{ ...s.statusBadge, background: STATUS_COLORS[tenant.status]?.bg || '#F0EDE4', color: STATUS_COLORS[tenant.status]?.color || '#7A7264' }}>
                      {tenant.status}
                    </span>
                    <span style={{ ...s.planBadge, background: PLAN_COLORS[tenant.plan]?.bg || '#F0EDE4', color: PLAN_COLORS[tenant.plan]?.color || '#7A7264' }}>
                      {tenant.plan}
                    </span>
                  </div>

                  <div style={s.tenantActions}>
                    <select value={tenant.status}
                      onChange={e => handleStatusChange(tenant.id, e.target.value)}
                      className="rsa-action-select">
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <select value={tenant.plan}
                      onChange={e => handlePlanChange(tenant.id, e.target.value)}
                      className="rsa-action-select">
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <button onClick={() => handleCancel(tenant.id, tenant.name)} className="rsa-cancel-btn">Cancel</button>
                  </div>
                </div>
              </div>
            ))}
            {tenants.length === 0 && <div style={s.emptyState}><p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>No tenants found</p></div>}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { padding:'32px', background:'#F7F5F0', minHeight:'100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F7F5F0' },

  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  eyebrow: { display:'inline-block', fontSize:'11px', fontWeight:'700', letterSpacing:'0.14em', color:'#A97E44', marginBottom:'6px' },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'30px', letterSpacing:'0.01em', color:'#1A1815', margin:0 },
  subtitle: { fontSize:'12.5px', color:'#7A7264', margin:'6px 0 0' },

  msg: { padding:'10px 16px', borderRadius:'4px', fontSize:'12.5px', fontWeight:'500', marginBottom:'16px' },
  msgOk: { background:'#F0F7EE', border:'1px solid #CFE3C6', color:'#3F7D33' },
  msgErr: { background:'#FBEEEB', border:'1px solid #EBC7BC', color:'#B33F2C' },

  tabs: { display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid #E9E3D6' },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'14px', marginBottom:'22px' },
  statCard: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'16px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  statLabel: { fontSize:'10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color:'#7A7264', margin:'0 0 9px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'24px', letterSpacing: '0.01em', color:'#1A1815', margin:0 },
  statSub: { fontSize:'11px', color:'#B9B0A0', margin:'5px 0 0' },

  card: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'20px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', marginBottom:'16px', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'19px', letterSpacing: '0.01em', color:'#1A1815', margin:'0 0 16px' },

  planGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' },
  planCard: { borderRadius:'6px', padding:'18px', textAlign:'center' },
  planName: { fontSize:'11px', fontWeight:'700', margin:'0 0 10px', letterSpacing:'0.1em' },
  planCount: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'34px', letterSpacing: '0.01em', color:'#1A1815', margin:0 },
  planLabel: { fontSize:'11px', color:'#7A7264', margin:'6px 0 0' },

  filters: { display:'flex', gap:'10px', marginBottom:'18px', alignItems:'center' },
  totalCount: { fontSize:'12px', color:'#7A7264', marginLeft:'auto' },

  tenantList: { display:'flex', flexDirection:'column', gap:'12px' },
  tenantCard: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'16px 16px 16px 20px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', position: 'relative', overflow: 'hidden' },
  tenantClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  tenantLeft: { display:'flex', gap:'12px', alignItems:'center' },
  tenantAvatar: { width:'42px', height:'42px', borderRadius:'4px', background:'#A97E44', color:'#1A1815', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: "'Bebas Neue', sans-serif", fontSize:'18px', flexShrink:0 },
  tenantName: { fontSize:'14.5px', fontWeight:'700', color:'#1A1815', margin:'0 0 2px' },
  tenantSub: { fontSize:'11.5px', color:'#B9B0A0', margin:'0 0 6px' },
  tenantMeta: { display:'flex', gap:'12px', fontSize:'11.5px', color:'#7A7264', flexWrap: 'wrap' },
  tenantRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'9px' },
  badges: { display:'flex', gap:'6px' },
  statusBadge: { fontSize:'10.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', textTransform:'capitalize' },
  planBadge: { fontSize:'10.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', textTransform:'capitalize' },
  tenantActions: { display:'flex', gap:'6px', alignItems:'center', flexWrap: 'wrap' },

  emptyState: { textAlign:'center', padding:'60px', background:'#FFFFFF', border: '1px dashed #E9E3D6', borderRadius:'6px' },
};

export default SuperAdmin;