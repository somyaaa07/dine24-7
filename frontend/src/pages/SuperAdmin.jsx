import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PLAN_COLORS = { starter:'#eff6ff', growth:'#f0fdf4', enterprise:'#fdf4ff' };
const STATUS_COLORS = { trial:'#fefce8', active:'#f0fdf4', suspended:'#fef2f2', cancelled:'#f1f5f9' };
const STATUS_TEXT = { trial:'#d97706', active:'#16a34a', suspended:'#dc2626', cancelled:'#94a3b8' };

const EMPTY_CREATE_FORM = {
  resturant_name: '',
  owner_name: '',
  email: '',
  password: '',
  plan: 'starter',
  status: 'trial',
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState('overview');
  const [stats,    setStats]    = useState(null);
  const [tenants,  setTenants]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState({ type:'', text:'' });
  const [filter,   setFilter]   = useState({ status:'', plan:'' });

  // Poore platform ka feature catalog — checkbox list yahi se banti hai
  const [featureCatalog, setFeatureCatalog] = useState([]);

  // "+ New Tenant" modal
  const [showCreate,  setShowCreate]  = useState(false);
  const [createForm,  setCreateForm]  = useState(EMPTY_CREATE_FORM);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState('');

  // "Manage Features" modal — jis tenant ka panel khula hai uska id + draft selection
  const [featurePanelTenant, setFeaturePanelTenant] = useState(null); // tenant object
  const [featureDraft,       setFeatureDraft]       = useState([]);  // string[]
  const [featureUseCustom,   setFeatureUseCustom]   = useState(false); // false = plan defaults, true = custom override
  const [savingFeatures,     setSavingFeatures]     = useState(false);

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

  const fetchFeatureCatalog = async () => {
    try { const r = await api.get('/super-admin/features'); setFeatureCatalog(r.data.data); }
    catch(e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchStats(), fetchTenants(), fetchFeatureCatalog()]);
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
    } catch(e) { showMsg('error', e.response?.data?.message || 'Failed'); }
  };

  const handlePlanChange = async (id, plan) => {
    try {
      await api.put(`/super-admin/tenants/${id}/plan`, { plan });
      showMsg('success', `Plan updated to ${plan}`);
      fetchTenants(); fetchStats();
    } catch(e) { showMsg('error', e.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id, name) => {
    if (!window.confirm(`Cancel ${name}? This will suspend their account.`)) return;
    try {
      await api.delete(`/super-admin/tenants/${id}`);
      showMsg('success', 'Tenant cancelled');
      fetchTenants(); fetchStats();
    } catch(e) { showMsg('error', e.response?.data?.message || 'Failed'); }
  };

  // ── Create Tenant ──────────────────────────────────────────────
  const openCreateModal = () => { setCreateForm(EMPTY_CREATE_FORM); setCreateError(''); setShowCreate(true); };
  const closeCreateModal = () => { if (!creating) setShowCreate(false); };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.resturant_name.trim() || !createForm.owner_name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      return setCreateError('Sabhi fields bharna zaroori hai');
    }
    if (createForm.password.length < 8) {
      return setCreateError('Password kam se kam 8 characters ka hona chahiye');
    }

    try {
      setCreating(true);
      await api.post('/super-admin/tenants', createForm);
      showMsg('success', `${createForm.resturant_name} create ho gaya`);
      setShowCreate(false);
      fetchTenants(); fetchStats();
    } catch (e) {
      setCreateError(e.response?.data?.message || 'Tenant create nahi ho paya');
    } finally {
      setCreating(false);
    }
  };

  // ── Manage Features ────────────────────────────────────────────
  const openFeaturePanel = (tenant) => {
    const isCustom = Array.isArray(tenant.enabled_features) && tenant.enabled_features.length > 0;
    setFeaturePanelTenant(tenant);
    setFeatureUseCustom(isCustom);
    setFeatureDraft(isCustom ? tenant.enabled_features : (tenant.effective_features || []));
  };
  const closeFeaturePanel = () => { if (!savingFeatures) setFeaturePanelTenant(null); };

  const toggleFeature = (key) => {
    setFeatureDraft(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  const handleSaveFeatures = async () => {
    if (!featurePanelTenant) return;
    try {
      setSavingFeatures(true);
      // useCustom = false -> null bhejo, matlab "plan ke defaults use karo"
      // useCustom = true  -> jo bhi checkboxes select hain wahi final list hai
      const payload = { enabled_features: featureUseCustom ? featureDraft : null };
      await api.put(`/super-admin/tenants/${featurePanelTenant.id}/features`, payload);
      showMsg('success', `${featurePanelTenant.name} ke features update ho gaye`);
      setFeaturePanelTenant(null);
      fetchTenants();
    } catch (e) {
      showMsg('error', e.response?.data?.message || 'Features update nahi ho paye');
    } finally {
      setSavingFeatures(false);
    }
  };

  if (loading) return <div style={s.centered}><p>Loading...</p></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>⚡ Super Admin</h1>
          <p style={s.subtitle}>Platform management dashboard</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={openCreateModal} style={s.primaryBtn}>+ New Tenant</button>
          <button onClick={() => navigate('/dashboard')} style={s.outlineBtn}>← My Dashboard</button>
        </div>
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
            {tenants.map(tenant => {
              const isCustom = Array.isArray(tenant.enabled_features) && tenant.enabled_features.length > 0;
              return (
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
                      <span>🧩 {(tenant.effective_features || []).length} features {isCustom ? '(custom)' : '(plan default)'}</span>
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
                    <button onClick={() => openFeaturePanel(tenant)} style={s.featuresBtn}>🧩 Features</button>
                    <button onClick={() => handleCancel(tenant.id, tenant.name)} style={s.cancelBtn}>Cancel</button>
                  </div>
                </div>
              </div>
            );})}
            {tenants.length === 0 && <div style={s.emptyState}><p>No tenants found</p></div>}
          </div>
        </div>
      )}

      {/* CREATE TENANT MODAL */}
      {showCreate && (
        <div style={s.overlay} onClick={closeCreateModal}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>New Tenant</h3>
            <p style={s.modalSubtitle}>Naya restaurant + uska owner account bana do</p>

            {createError && <div style={{...s.msg, ...s.msgErr, marginBottom:'12px'}}>{createError}</div>}

            <form onSubmit={handleCreateSubmit}>
              <label style={s.formLabel}>Restaurant Name</label>
              <input style={s.formInput} value={createForm.resturant_name}
                onChange={e => setCreateForm({...createForm, resturant_name: e.target.value})}
                placeholder="e.g. Spice Villa" />

              <label style={s.formLabel}>Owner Name</label>
              <input style={s.formInput} value={createForm.owner_name}
                onChange={e => setCreateForm({...createForm, owner_name: e.target.value})}
                placeholder="e.g. Rohit Sharma" />

              <label style={s.formLabel}>Owner Email</label>
              <input style={s.formInput} type="email" value={createForm.email}
                onChange={e => setCreateForm({...createForm, email: e.target.value})}
                placeholder="owner@email.com" />

              <label style={s.formLabel}>Temporary Password</label>
              <input style={s.formInput} type="text" value={createForm.password}
                onChange={e => setCreateForm({...createForm, password: e.target.value})}
                placeholder="min 8 characters" />

              <div style={{ display:'flex', gap:'12px' }}>
                <div style={{ flex:1 }}>
                  <label style={s.formLabel}>Plan</label>
                  <select style={s.formInput} value={createForm.plan}
                    onChange={e => setCreateForm({...createForm, plan: e.target.value})}>
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <label style={s.formLabel}>Status</label>
                  <select style={s.formInput} value={createForm.status}
                    onChange={e => setCreateForm({...createForm, status: e.target.value})}>
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div style={s.modalActions}>
                <button type="button" onClick={closeCreateModal} style={s.outlineBtn} disabled={creating}>Cancel</button>
                <button type="submit" style={s.primaryBtn} disabled={creating}>
                  {creating ? 'Creating…' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE FEATURES MODAL */}
      {featurePanelTenant && (
        <div style={s.overlay} onClick={closeFeaturePanel}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Features — {featurePanelTenant.name}</h3>
            <p style={s.modalSubtitle}>Decide karo is tenant ko konse features dikhne chahiye</p>

            <div style={s.featureModeRow}>
              <label style={s.radioLabel}>
                <input type="radio" checked={!featureUseCustom}
                  onChange={() => { setFeatureUseCustom(false); }} />
                {' '}Plan ke default features use karo ({featurePanelTenant.plan})
              </label>
              <label style={s.radioLabel}>
                <input type="radio" checked={featureUseCustom}
                  onChange={() => setFeatureUseCustom(true)} />
                {' '}Custom — neeche se manually chuno
              </label>
            </div>

            <div style={{...s.featureGrid, opacity: featureUseCustom ? 1 : 0.45, pointerEvents: featureUseCustom ? 'auto' : 'none'}}>
              {featureCatalog.map(f => (
                <label key={f.key} style={s.featureCheckboxRow}>
                  <input type="checkbox"
                    checked={featureDraft.includes(f.key)}
                    onChange={() => toggleFeature(f.key)} />
                  {' '}{f.label}
                </label>
              ))}
            </div>

            <div style={s.modalActions}>
              <button onClick={closeFeaturePanel} style={s.outlineBtn} disabled={savingFeatures}>Cancel</button>
              <button onClick={handleSaveFeatures} style={s.primaryBtn} disabled={savingFeatures}>
                {savingFeatures ? 'Saving…' : 'Save Features'}
              </button>
            </div>
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
  primaryBtn: { background:'#2563eb', border:'1px solid #2563eb', color:'#fff', borderRadius:'8px', padding:'9px 18px', fontSize:'14px', cursor:'pointer', fontWeight:'600' },
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
  tenantMeta: { display:'flex', gap:'12px', fontSize:'12px', color:'#64748b', flexWrap:'wrap' },
  tenantRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' },
  badges: { display:'flex', gap:'6px' },
  statusBadge: { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', textTransform:'capitalize' },
  planBadge: { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', textTransform:'capitalize', color:'#475569' },
  tenantActions: { display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' },
  actionSelect: { border:'1px solid #d1d5db', borderRadius:'6px', padding:'5px 8px', fontSize:'12px', outline:'none', cursor:'pointer' },
  featuresBtn: { background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', cursor:'pointer', fontWeight:'600' },
  cancelBtn: { background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', cursor:'pointer' },
  emptyState: { textAlign:'center', padding:'60px', color:'#94a3b8' },

  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:50 },
  modal: { background:'#fff', borderRadius:'12px', padding:'24px', width:'100%', maxWidth:'440px', maxHeight:'86vh', overflowY:'auto', boxShadow:'0 20px 50px rgba(0,0,0,0.25)' },
  modalTitle: { fontSize:'18px', fontWeight:'700', color:'#1e293b', margin:'0 0 4px' },
  modalSubtitle: { fontSize:'13px', color:'#64748b', margin:'0 0 18px' },
  formLabel: { display:'block', fontSize:'12px', fontWeight:'600', color:'#475569', margin:'12px 0 6px' },
  formInput: { width:'100%', border:'1px solid #d1d5db', borderRadius:'8px', padding:'9px 12px', fontSize:'14px', outline:'none', boxSizing:'border-box' },
  modalActions: { display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'22px' },
  featureModeRow: { display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px', background:'#f8fafc', padding:'12px', borderRadius:'8px' },
  radioLabel: { fontSize:'13px', color:'#334155', display:'flex', alignItems:'center', gap:'6px' },
  featureGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px' },
  featureCheckboxRow: { fontSize:'13px', color:'#334155', display:'flex', alignItems:'center', gap:'6px' },
};

export default SuperAdmin;