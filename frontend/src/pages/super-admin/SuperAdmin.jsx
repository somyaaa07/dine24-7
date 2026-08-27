import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import { ChartSkeleton, TableSkeleton, MapSkeleton } from './components/Skeletons';
import { PrimaryStatCard, SecondaryStatCard, StatCardSkeleton } from './components/StatCard';
import RevenueChart from './components/RevenueChart';
import PlanDistribution from './components/PlanDistribution';
import RecentActivity from './components/RecentActivity';
import TenantTable from './components/TenantTable';
import TenantDrawer from './components/TenantDrawer';
import CreateTenantModal from './components/CreateTenantModal';
import BranchMap from './components/BranchMap';
import BranchTable from './components/BranchTable';
import UserTable from './components/UserTable';
import { PlanCard, FeatureComparisonTable } from './components/PlanCard';
import { IconStore, IconUsers } from './components/Icons';

import useTenants from './hooks/useTenants';
import useBranches from './hooks/useBranches';
import useUsers from './hooks/useUsers';

import { C, PLANS } from './constants/superAdmin.constants';

const TAB_TITLES = {
  overview: 'Overview',
  tenants: 'Restaurants',
  branches: 'Branches',
  users: 'Users',
  plans: 'Plans',
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    .sa-nav-btn {
      font-family: 'Inter', sans-serif;
      background: #FFFFFF; border: 1px solid #D8D1C2; color: #1A1815;
      padding: 7px 13px; border-radius: 6px; cursor: pointer;
      font-size: 11.5px; font-weight: 600; letter-spacing: 0.01em;
      transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .sa-nav-btn:hover { border-color: #A97E44; background: #FBF8F2; color: #A97E44; }
    .sa-primary-btn {
      font-family: 'Inter', sans-serif;
      background: #1A1815; color: #F7F5F0; border: none; border-radius: 6px;
      padding: 9px 18px; font-size: 12px; font-weight: 700; letter-spacing: 0.01em;
      cursor: pointer; transition: background 150ms ease;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .sa-primary-btn:hover { background: #333029; }
    .sa-select {
      font-family: 'Inter', sans-serif;
      border: 1px solid #D8D1C2; border-radius: 6px; padding: 7px 9px;
      font-size: 11.5px; background: #fff; color: #1A1815; cursor: pointer; outline: none;
    }
    .sa-input {
      font-family: 'Inter', sans-serif;
      border: 1px solid #D8D1C2; border-radius: 6px; padding: 9px 12px;
      font-size: 13px; background: #fff; color: #1A1815; outline: none;
      box-sizing: border-box; width: 100%; transition: border-color 150ms ease;
    }
    .sa-input:focus, .sa-select:focus { border-color: #A97E44; }
    .sa-input::placeholder { color: #B9B0A0; }
    .sa-card {
      background: #fff; border-radius: 10px; border: 1px solid #E9E3D6; padding: 16px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
      box-shadow: 0 1px 2px rgba(26,24,21,0.03); transition: transform 150ms ease, box-shadow 150ms ease;
    }
    .sa-card:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(26,24,21,0.07); }

    /* Shimmer skeletons */
    .sa-shimmer {
      background: linear-gradient(90deg, #F1EEE7 25%, #F7F5F0 37%, #F1EEE7 63%);
      background-size: 400% 100%;
      animation: sa-shimmer-move 1.4s ease infinite;
    }
    @keyframes sa-shimmer-move { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

    /* Leaflet map — restyled to match the dashboard instead of default chrome */
    @keyframes sa-map-pulse {
      0%   { transform: scale(0.55); opacity: 0.55; }
      100% { transform: scale(2); opacity: 0; }
    }
    .sa-map-bubble { background: transparent !important; border: none !important; }
    .leaflet-container { font-family: 'JetBrains Mono', monospace; background: #FBF8F2; }
    .leaflet-popup-content-wrapper {
      background: #FBF8F2; border: 1px solid #E9E3D6; border-radius: 12px;
      box-shadow: 0 14px 34px rgba(26,24,21,0.2);
    }
    .leaflet-popup-tip { background: #FBF8F2; border: 1px solid #E9E3D6; box-shadow: none; }
    .leaflet-popup-content { margin: 10px 12px; }
    .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(26,24,21,0.12) !important; }
    .leaflet-control-zoom a {
      border-radius: 8px !important; font-family: 'JetBrains Mono', monospace !important;
      color: #1A1815 !important; border-color: #E9E3D6 !important;
    }
    .leaflet-control-zoom a:hover { background: #FBF8F2 !important; color: #A97E44 !important; }
    .leaflet-control-attribution { background: rgba(251,248,242,0.85) !important; font-size: 9px !important; color: #B9B0A0 !important; }

    @media (prefers-reduced-motion: reduce) {
      .sa-shimmer, .sa-card, .sa-nav-btn, .sa-primary-btn { animation: none !important; transition: none !important; }
    }
  `}</style>
);

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  // --- Overview-only data (stats + trend) ------------------------------
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [overviewError, setOverviewError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- Cross-cutting UI state -------------------------------------------
  const [toast, setToast] = useState({ type: '', text: '' });
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const showMsg = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: '', text: '' }), 4000); };

  // --- Data hooks (each owns its own fetch/filter/search/mutations) -----
  const tenantsApi  = useTenants();
  const branchesApi = useBranches({ active: tab === 'branches' });
  const usersApi    = useUsers({ active: tab === 'users' });

  const fetchStats = async () => {
    try { const r = await api.get('/super-admin/stats'); setStats(r.data.data); setOverviewError(null); }
    catch (e) { setOverviewError(e.response?.data?.message || 'Unable to load platform stats'); }
  };

  const fetchTrend = async () => {
    try { const r = await api.get('/super-admin/trend'); setTrend(r.data.data); }
    catch (e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchStats(), fetchTrend(), tenantsApi.fetchTenants()]);
      setInitialLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Tenant mutations (with confirm dialog for suspend) ---------------
  const handleCreateTenant = async (form) => {
    try {
      const created = await tenantsApi.createTenant(form);
      showMsg('success', `"${form.restaurant_name}" created successfully`);
      setCreatedCredentials(created);
      setShowCreateModal(false);
      fetchStats();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Unable to create restaurant');
    }
  };

  const applyTenantStatus = async (tenant, status) => {
    try {
      await tenantsApi.changeStatus(tenant.id, status);
      showMsg('success', `${tenant.name} → ${status}`);
      fetchStats();
      if (selectedTenant?.id === tenant.id) setSelectedTenant(prev => ({ ...prev, status }));
    } catch (e) { showMsg('error', 'Unable to update restaurant status'); }
  };

  const requestTenantStatusChange = (tenant, status) => {
    if (status === 'suspended') {
      setConfirmConfig({
        title: 'Suspend Restaurant?',
        body: `${tenant.name} will lose access to DINE24-7.`,
        confirmLabel: 'Suspend Restaurant',
        onConfirm: () => applyTenantStatus(tenant, status),
      });
    } else {
      applyTenantStatus(tenant, status);
    }
  };

  const handleChangePlan = async (id, plan) => {
    try {
      await tenantsApi.changePlan(id, plan);
      showMsg('success', `Plan → ${plan} — features updated`);
      fetchStats();
      if (selectedTenant?.id === id) setSelectedTenant(prev => ({ ...prev, plan }));
    } catch (e) { showMsg('error', 'Unable to update plan'); }
  };

  const openTenantDetails = async (tenant) => {
    if (!tenant?.id) return;
    try {
      const details = await tenantsApi.fetchTenantDetails(tenant.id);
      setSelectedTenant(details);
    } catch (e) { showMsg('error', 'Could not load restaurant details'); }
  };

  // --- Branch mutations ---------------------------------------------------
  const requestBranchStatusChange = (branch) => {
    if (branch.is_active) {
      setConfirmConfig({
        title: 'Suspend Branch?',
        body: `${branch.name} will be suspended and unable to take orders.`,
        confirmLabel: 'Suspend Branch',
        onConfirm: async () => {
          try { await branchesApi.changeStatus(branch.id, false); showMsg('success', 'Branch suspended'); }
          catch (e) { showMsg('error', e.response?.data?.message || 'Unable to update branch'); }
        },
      });
    } else {
      (async () => {
        try { await branchesApi.changeStatus(branch.id, true); showMsg('success', 'Branch activated'); }
        catch (e) { showMsg('error', e.response?.data?.message || 'Unable to update branch'); }
      })();
    }
  };

  // --- User mutations -------------------------------------------------------
  const requestUserStatusChange = (user) => {
    if (user.is_active) {
      setConfirmConfig({
        title: 'Suspend User?',
        body: `${user.name} will lose access immediately.`,
        confirmLabel: 'Suspend User',
        onConfirm: async () => {
          try { await usersApi.changeStatus(user.id, false); showMsg('success', 'User suspended'); }
          catch (e) { showMsg('error', e.response?.data?.message || 'Unable to update user'); }
        },
      });
    } else {
      (async () => {
        try { await usersApi.changeStatus(user.id, true); showMsg('success', 'User activated'); }
        catch (e) { showMsg('error', e.response?.data?.message || 'Unable to update user'); }
      })();
    }
  };

  const planData = (stats?.by_plan || []).map(p => ({
    plan: p.plan,
    count: Number(p.count ?? p.dataValues?.count ?? 0),
  }));

  // Live tenant counts per plan, computed from real tenant data — never hardcoded.
  const tenantCountByPlan = useMemo(() => {
    const counts = {};
    tenantsApi.tenants.forEach(t => { counts[t.plan] = (counts[t.plan] || 0) + 1; });
    return counts;
  }, [tenantsApi.tenants]);

  const navCounts = {
    tenants: stats?.tenants?.total,
    branches: branchesApi.branches.length || undefined,
    users: stats?.platform?.total_users,
  };

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1815]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <GlobalStyle />

      <Sidebar
        tab={tab}
        setTab={setTab}
        counts={navCounts}
        onBack={() => navigate('/dashboard')}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={TAB_TITLES[tab]}
          globalQuery={globalQuery}
          setGlobalQuery={setGlobalQuery}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-7">

            {/* OVERVIEW ------------------------------------------------ */}
            {tab === 'overview' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-[30px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Overview</h2>
                    <p className="text-[13px] text-[#7A7264] mt-1">Monitor your entire DINE24-7 platform from one place.</p>
                  </div>
                  <button onClick={() => setShowCreateModal(true)} className="sa-primary-btn">+ New Restaurant</button>
                </div>

                {overviewError && !stats ? (
                  <ErrorState title="Unable to load overview" description={overviewError} onRetry={fetchStats} />
                ) : initialLoading || !stats ? (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
                    </div>
                    <ChartSkeleton />
                    <ChartSkeleton height={150} />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <PrimaryStatCard label="Restaurants" value={stats.tenants.total} icon={IconStore} accent={C.blue} sub={`+${stats.tenants.new_today} today`} />
                      <PrimaryStatCard label="Active Restaurants" value={stats.tenants.active} accent={C.green} live sub={stats.tenants.total ? `${Math.round((stats.tenants.active / stats.tenants.total) * 100)}% of total` : undefined} />
                      <PrimaryStatCard label="Platform Revenue" value={stats.platform.total_revenue} prefix="₹" accent={C.green} live />
                      <PrimaryStatCard label="Total Orders" value={stats.platform.total_orders} accent={C.violet} live />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <SecondaryStatCard label="Trial" value={stats.tenants.trial} accent={C.warn} />
                      <SecondaryStatCard label="Suspended" value={stats.tenants.suspended ?? 0} accent={C.red} />
                      <SecondaryStatCard label="Branches" value={branchesApi.branches.length || stats.branches?.total || 0} accent={C.blue} />
                      <SecondaryStatCard label="Users" value={stats.platform.total_users} accent={C.amber} />
                    </div>

                    <RevenueChart trend={trend} totalRevenue={stats.platform.total_revenue} />
                    <PlanDistribution planData={planData} />
                    <RecentActivity activities={stats.recent_activity} />
                  </>
                )}
              </div>
            )}

            {/* RESTAURANTS ---------------------------------------------- */}
            {tab === 'tenants' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[30px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Restaurants</h2>
                  <p className="text-[13px] text-[#7A7264] mt-1">Manage every restaurant on the platform.</p>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      value={tenantsApi.search}
                      onChange={e => tenantsApi.setSearch(e.target.value)}
                      placeholder="Search…"
                      className="sa-input"
                      style={{ minWidth: '200px' }}
                    />
                    <select value={tenantsApi.filter.status} onChange={e => tenantsApi.setFilter(f => ({ ...f, status: e.target.value }))} className="sa-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="suspended">Suspended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select value={tenantsApi.filter.plan} onChange={e => tenantsApi.setFilter(f => ({ ...f, plan: e.target.value }))} className="sa-select">
                      <option value="">All Plans</option>
                      {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setShowCreateModal(true)} className="sa-primary-btn">+ New Restaurant</button>
                </div>

                {tenantsApi.error ? (
                  <ErrorState title="Unable to load restaurants" description={tenantsApi.error} onRetry={tenantsApi.fetchTenants} />
                ) : tenantsApi.loading ? (
                  <TableSkeleton rows={5} />
                ) : tenantsApi.filtered.length === 0 ? (
                  <EmptyState
                    icon={<IconStore className="w-5 h-5" />}
                    title="No restaurants yet"
                    description="Your platform does not have any restaurants registered yet."
                    actionLabel="+ New Restaurant"
                    onAction={() => setShowCreateModal(true)}
                  />
                ) : (
                  <TenantTable
                    tenants={tenantsApi.filtered}
                    onViewDetails={openTenantDetails}
                    onRequestSuspend={(tenant) => requestTenantStatusChange(tenant, tenant.status === 'suspended' ? 'active' : 'suspended')}
                    onChangePlan={handleChangePlan}
                  />
                )}
              </div>
            )}

            {/* BRANCHES --------------------------------------------------- */}
            {tab === 'branches' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[30px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Branches</h2>
                  <p className="text-[13px] text-[#7A7264] mt-1">Operations across every branch on the platform.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <SecondaryStatCard label="Total Branches" value={branchesApi.branches.length} accent={C.blue} />
                  <SecondaryStatCard label="Active" value={branchesApi.branches.filter(b => b.is_active).length} accent={C.green} />
                  <SecondaryStatCard label="Suspended" value={branchesApi.branches.filter(b => !b.is_active).length} accent={C.red} />
                  <SecondaryStatCard label="Main Branches" value={branchesApi.branches.filter(b => b.is_main).length} accent={C.amber} />
                </div>

                {branchesApi.error ? (
                  <ErrorState title="Unable to load branches" description={branchesApi.error} onRetry={branchesApi.fetchBranches} />
                ) : branchesApi.loading ? (
                  <MapSkeleton />
                ) : (
                  <BranchMap branches={branchesApi.branches} />
                )}

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      value={branchesApi.search}
                      onChange={e => branchesApi.setSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && branchesApi.fetchBranches()}
                      placeholder="Search branch or address…"
                      className="sa-input"
                      style={{ minWidth: '220px' }}
                    />
                    <select value={branchesApi.filter.is_active} onChange={e => branchesApi.setFilter({ is_active: e.target.value })} className="sa-select">
                      <option value="">All Branches</option>
                      <option value="true">Active</option>
                      <option value="false">Suspended</option>
                    </select>
                    <button onClick={branchesApi.fetchBranches} className="sa-nav-btn">Search</button>
                  </div>
                </div>

                {!branchesApi.error && (
                  branchesApi.loading ? (
                    <TableSkeleton rows={4} />
                  ) : branchesApi.filteredBranches.length === 0 ? (
                    <EmptyState title="No branches found" description="Try a different search or filter." />
                  ) : (
                    <BranchTable
                      branches={branchesApi.filteredBranches}
                      onOpenTenant={openTenantDetails}
                      onRequestStatusChange={requestBranchStatusChange}
                    />
                  )
                )}
              </div>
            )}

            {/* USERS ------------------------------------------------------- */}
            {tab === 'users' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[30px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Users</h2>
                  <p className="text-[13px] text-[#7A7264] mt-1">Every user account across the platform.</p>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      value={usersApi.search}
                      onChange={e => usersApi.setSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && usersApi.fetchUsers()}
                      placeholder="Search name or email…"
                      className="sa-input"
                      style={{ minWidth: '220px' }}
                    />
                    <select value={usersApi.filter.role} onChange={e => usersApi.setFilter(f => ({ ...f, role: e.target.value }))} className="sa-select">
                      <option value="">All Roles</option>
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="waiter">Waiter</option>
                      <option value="chef">Chef</option>
                    </select>
                    <select value={usersApi.filter.is_active} onChange={e => usersApi.setFilter(f => ({ ...f, is_active: e.target.value }))} className="sa-select">
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Suspended</option>
                    </select>
                    <button onClick={usersApi.fetchUsers} className="sa-nav-btn">Search</button>
                  </div>
                </div>

                {usersApi.error ? (
                  <ErrorState title="Unable to load users" description={usersApi.error} onRetry={usersApi.fetchUsers} />
                ) : usersApi.loading ? (
                  <TableSkeleton rows={5} />
                ) : usersApi.filteredUsers.length === 0 ? (
                  <EmptyState icon={<IconUsers className="w-5 h-5" />} title="No users found" description="Try a different search or filter." />
                ) : (
                  <UserTable
                    users={usersApi.filteredUsers}
                    onOpenTenant={openTenantDetails}
                    onRequestStatusChange={requestUserStatusChange}
                  />
                )}
              </div>
            )}

            {/* PLANS --------------------------------------------------------- */}
            {tab === 'plans' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[30px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Plans</h2>
                  <p className="text-[13px] text-[#7A7264] mt-1">Subscription tiers available on DINE24-7.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <PlanCard key={key} planKey={key} plan={plan} count={tenantCountByPlan[key] || 0} />
                  ))}
                </div>

                <div>
                  <h3 className="text-[12px] font-bold tracking-wide text-[#7A7264] uppercase mb-3">Feature Comparison</h3>
                  <FeatureComparisonTable />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Toast toast={toast} />
      <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      {showCreateModal && (
        <CreateTenantModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateTenant} />
      )}

      {selectedTenant && (
        <TenantDrawer
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onChangePlan={handleChangePlan}
          onRequestStatusChange={requestTenantStatusChange}
        />
      )}

      {/* Credentials modal — shown once after a restaurant is created */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[95] p-4" onClick={() => setCreatedCredentials(null)}>
          <div className="bg-[#F7F5F0] border border-[#E9E3D6] rounded-lg w-[480px] max-w-full max-h-[85vh] overflow-auto shadow-[0_20px_60px_rgba(26,24,21,0.25)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E9E3D6] sticky top-0 bg-[#F7F5F0]">
              <h2 className="text-[20px] text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Restaurant Created</h2>
              <button onClick={() => setCreatedCredentials(null)} className="text-[#7A7264] hover:text-[#1A1815]">✕</button>
            </div>
            <div className="p-6">
              <div className="rounded-lg p-4 mb-4 space-y-1.5" style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}` }}>
                <p className="text-[12px] font-bold mb-2 tracking-wide" style={{ color: C.green }}>Login Credentials — Save These</p>
                {[
                  ['Restaurant', createdCredentials.tenant?.name],
                  ['Plan', createdCredentials.tenant?.plan],
                  ['Owner Name', createdCredentials.owner?.name],
                  ['Login Email', createdCredentials.credentials?.email],
                  ['Password', createdCredentials.credentials?.password],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-[13px] border-t border-dashed pt-1.5" style={{ borderColor: C.greenBorder }}>
                    <span style={{ color: C.green, fontWeight: 600 }}>{label}</span>
                    <span className="text-[#1A1815] font-bold" style={{ fontFamily: label === 'Password' ? "'JetBrains Mono', monospace" : 'inherit' }}>{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setCreatedCredentials(null)} className="sa-primary-btn w-full justify-center">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
