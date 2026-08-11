import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PLAN_COLORS = { starter:'#eff6ff', growth:'#f0fdf4', enterprise:'#fdf4ff' };
const STATUS_COLORS = { trial:'#fefce8', active:'#f0fdf4', suspended:'#fef2f2', cancelled:'#f1f5f9' };
const STATUS_TEXT = { trial:'#d97706', active:'#16a34a', suspended:'#dc2626', cancelled:'#94a3b8' };

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

  if (loading) return <div style={s.centered}><p>Loading...</p></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>⚡ Super Admin</h1>
          <p style={s.subtitle}>Platform management dashboard</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={s.outlineBtn}>← My Dashboard</button>
      </div>

      {msg.text && <div style={{ ...s.msg, ...(msg.type==='success'?s.msgOk:s.msgErr) }}>{msg.text}</div>}

      <div style={s.tabs}>
        {['overview','tenants'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab===t?s.tabActive:{}) }}>
            {t === 'overview' ? '📊 Platform Overview' : '🏢 All Tenants'}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <div>
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <p style={s.statLabel}>Total Restaurants</p>
              <p style={s.statValue}>{stats.tenants.total}</p>
              <p style={s.statSub}>+{stats.tenants.new_today} today</p>
            </div>
            <div style={{...s.statCard, background:'#f0fdf4'}}>
              <p style={s.statLabel}>Active</p>
              <p style={{...s.statValue, color:'#16a34a'}}>{stats.tenants.active}</p>
            </div>
            <div style={{...s.statCard, background:'#fefce8'}}>
              <p style={s.statLabel}>On Trial</p>
              <p style={{...s.statValue, color:'#d97706'}}>{stats.tenants.trial}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>Platform Revenue</p>
              <p style={s.statValue}>₹{parseFloat(stats.platform.total_revenue||0).toLocaleString()}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>Total Orders</p>
              <p style={s.statValue}>{stats.platform.total_orders}</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statLabel}>Total Users</p>
              <p style={s.statValue}>{stats.platform.total_users}</p>
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Restaurants by Plan</h3>
            <div style={s.planGrid}>
              {(stats.by_plan || []).map(p => (
                <div key={p.plan} style={{...s.planCard, background: PLAN_COLORS[p.plan]||'#f1f5f9'}}>
                  <p style={s.planName}>{p.plan?.toUpperCase()}</p>
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
          <div style={s.filters}>
            <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} style={s.filterSelect}>
              <option value="">All Status</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={filter.plan} onChange={e => setFilter({...filter, plan: e.target.value})} style={s.filterSelect}>
              <option value="">All Plans</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <span style={s.totalCount}>{tenants.length} restaurants</span>
          </div>

          <div style={s.tenantList}>
            {tenants.map(tenant => (
              <div key={tenant.id} style={s.tenantCard}>
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
                    <span style={{...s.statusBadge, background: STATUS_COLORS[tenant.status]||'#f1f5f9', color: STATUS_TEXT[tenant.status]||'#64748b'}}>
                      {tenant.status}
                    </span>
                    <span style={{...s.planBadge, background: PLAN_COLORS[tenant.plan]||'#f1f5f9'}}>
                      {tenant.plan}
                    </span>
                  </div>

                  <div style={s.tenantActions}>
                    <select value={tenant.status}
                      onChange={e => handleStatusChange(tenant.id, e.target.value)}
                      style={s.actionSelect}>
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <select value={tenant.plan}
                      onChange={e => handlePlanChange(tenant.id, e.target.value)}
                      style={s.actionSelect}>
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <button onClick={() => handleCancel(tenant.id, tenant.name)} style={s.cancelBtn}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
            {tenants.length === 0 && <div style={s.emptyState}><p>No tenants found</p></div>}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { padding:'24px', background:'#f8fafc', minHeight:'100vh' },
  centered: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  title: { fontSize:'24px', fontWeight:'700', color:'#1e293b', margin:0 },
  subtitle: { fontSize:'13px', color:'#64748b', margin:'4px 0 0' },
  outlineBtn: { background:'#fff', border:'1px solid #d1d5db', color:'#374151', borderRadius:'8px', padding:'9px 18px', fontSize:'14px', cursor:'pointer' },
  msg: { padding:'10px 16px', borderRadius:'8px', fontSize:'14px', marginBottom:'16px' },
  msgOk: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a' },
  msgErr: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626' },
  tabs: { display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid #e2e8f0' },
  tab: { padding:'8px 20px', background:'none', border:'none', borderBottom:'2px solid transparent', cursor:'pointer', fontSize:'14px', color:'#64748b', marginBottom:'-1px' },
  tabActive: { borderBottomColor:'#2563eb', color:'#2563eb', fontWeight:'600' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px', marginBottom:'20px' },
  statCard: { background:'#fff', borderRadius:'10px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  statLabel: { fontSize:'12px', color:'#64748b', margin:'0 0 6px' },
  statValue: { fontSize:'22px', fontWeight:'700', color:'#1e293b', margin:0 },
  statSub: { fontSize:'12px', color:'#94a3b8', margin:'4px 0 0' },
  card: { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'16px' },
  cardTitle: { fontSize:'15px', fontWeight:'600', color:'#1e293b', margin:'0 0 16px' },
  planGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' },
  planCard: { borderRadius:'8px', padding:'16px', textAlign:'center' },
  planName: { fontSize:'12px', fontWeight:'700', color:'#475569', margin:'0 0 8px', letterSpacing:'1px' },
  planCount: { fontSize:'32px', fontWeight:'700', color:'#1e293b', margin:0 },
  planLabel: { fontSize:'12px', color:'#64748b', margin:'4px 0 0' },
  filters: { display:'flex', gap:'10px', marginBottom:'16px', alignItems:'center' },
  filterSelect: { border:'1px solid #d1d5db', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', outline:'none' },
  totalCount: { fontSize:'13px', color:'#64748b', marginLeft:'auto' },
  tenantList: { display:'flex', flexDirection:'column', gap:'10px' },
  tenantCard: { background:'#fff', borderRadius:'10px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' },
  tenantLeft: { display:'flex', gap:'12px', alignItems:'center' },
  tenantAvatar: { width:'44px', height:'44px', borderRadius:'10px', background:'#2563eb', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', flexShrink:0 },
  tenantName: { fontSize:'15px', fontWeight:'600', color:'#1e293b', margin:'0 0 2px' },
  tenantSub: { fontSize:'12px', color:'#94a3b8', margin:'0 0 6px' },
  tenantMeta: { display:'flex', gap:'12px', fontSize:'12px', color:'#64748b' },
  tenantRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' },
  badges: { display:'flex', gap:'6px' },
  statusBadge: { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', textTransform:'capitalize' },
  planBadge: { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', textTransform:'capitalize', color:'#475569' },
  tenantActions: { display:'flex', gap:'6px', alignItems:'center' },
  actionSelect: { border:'1px solid #d1d5db', borderRadius:'6px', padding:'5px 8px', fontSize:'12px', outline:'none', cursor:'pointer' },
  cancelBtn: { background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', cursor:'pointer' },
  emptyState: { textAlign:'center', padding:'60px', color:'#94a3b8' },
};

export default SuperAdmin;