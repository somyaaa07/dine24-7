import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import useAuthStore from '../store/authStore';

// ─────────────────────────────────────────────────────────────
// PEHLE: ek flat button-soup nav bar tha.
// BAAD ME: links ab GROUPS me organised hain (jaise ek order-ticket
// pad par sections hote hain) — Operations / Stock / People / Insights.
// Har link ke saath `feature` key hai — agar tenant ke paas wo feature
// enabled nahi hai (super admin ne nahi diya), to ye link dikhega hi nahi.
// `feature: null` ka matlab hai ye link hamesha dikhega (koi plan-gate nahi).
// ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Front of House',
    links: [
      { label: 'Setup',        path: '/restaurant-setup', feature: null,      icon: '🏠' },
      { label: 'Tables',       path: '/tables',           feature: 'tables',       icon: '🪑' },
      { label: 'POS',          path: '/pos',              feature: 'pos',          icon: '🛒' },
      { label: 'KDS',          path: '/kds',              feature: 'kds',          icon: '🍳' },
      { label: 'Reservations', path: '/reservations',     feature: 'reservations', icon: '📅' },
    ],
  },
  {
    label: 'Stock',
    links: [
      { label: 'Menu',            path: '/menu',             feature: 'menu',            icon: '📖' },
      { label: 'Inventory',       path: '/inventory',        feature: 'inventory',       icon: '📦' },
      { label: 'Suppliers',       path: '/suppliers',        feature: 'suppliers',       icon: '🚚' },
      { label: 'Purchase Orders', path: '/purchase-orders', feature: 'purchase_orders', icon: '🧾' },
      { label: 'Recipes',         path: '/recipes',          feature: 'recipes',         icon: '📝' },
    ],
  },
  {
    label: 'People',
    links: [
      { label: 'Customers', path: '/customers', feature: 'customers', icon: '👥' },
      { label: 'Employees', path: '/employees', feature: 'employees', icon: '🧑\u200d🍳' },
    ],
  },
  {
    label: 'Insights',
    links: [
      { label: 'Expenses',  path: '/expenses',  feature: 'expenses',  icon: '💸' },
      { label: 'Reports',   path: '/reports',   feature: 'reports',   icon: '📋' },
      { label: 'Analytics', path: '/analytics', feature: 'analytics', icon: '📊' },
    ],
  },
];

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ── Animated horizontal bar chart, no chart library required ──
const BarChart = ({ title, icon, data, formatValue, barColor, trackColor }) => {
  const [animated, setAnimated] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={styles.chartCard} className="rdash-card-hover">
      <div style={styles.chartHeader}>
        <span style={styles.chartIcon}>{icon}</span>
        <span style={styles.chartTitle}>{title}</span>
      </div>
      <div style={styles.chartBody}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isHover = hoverIdx === i;
          return (
            <div
              key={d.label}
              style={styles.chartRow}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <span style={styles.chartRowLabel}>{d.label}</span>
              <div style={{ ...styles.chartTrack, background: trackColor }}>
                <div
                  style={{
                    ...styles.chartFill,
                    width: animated ? `${pct}%` : '0%',
                    background: barColor,
                    boxShadow: isHover ? '0 0 0 2px rgba(169,126,68,0.25)' : 'none',
                  }}
                />
              </div>
              <span style={styles.chartRowValue}>
                {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Animated radial/donut gauge — for single ratio metrics like occupancy ──
const RadialGauge = ({ title, icon, value, max, centerLabel, sublabel, color, trackColor }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedPct(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - animatedPct);

  return (
    <div style={styles.gaugeCard} className="rdash-card-hover">
      <div style={styles.chartHeader}>
        <span style={styles.chartIcon}>{icon}</span>
        <span style={styles.chartTitle}>{title}</span>
      </div>
      <div style={styles.gaugeWrap}>
        <svg width="126" height="126" viewBox="0 0 126 126">
          <circle cx="63" cy="63" r={r} fill="none" stroke={trackColor} strokeWidth="11" />
          <circle
            cx="63" cy="63" r={r} fill="none"
            stroke={color} strokeWidth="11" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 63 63)"
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <text x="63" y="59" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="21" fill="#1A1815">
            {centerLabel}
          </text>
          <text x="63" y="76" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="#7A7264">
            {Math.round(pct * 100)}%
          </text>
        </svg>
      </div>
      {sublabel && <p style={styles.anSub}>{sublabel}</p>}
    </div>
  );
};

const EmptyState = ({ icon, text }) => (
  <div style={styles.emptyState}>
    <span style={styles.emptyIcon}>{icon}</span>
    <p style={styles.empty}>{text}</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const enabledFeatures = user?.tenant?.enabled_features || [];
  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.map((g) => ({
        ...g,
        links: g.links.filter((l) => l.feature === null || enabledFeatures.includes(l.feature)),
      })).filter((g) => g.links.length > 0),
    [enabledFeatures]
  );

  const [stats,        setStats]        = useState(null);
  const [lowStock,     setLowStock]     = useState([]);
  const [reservations, setReservations] = useState([]);
  const [topDishes,    setTopDishes]    = useState([]);
  const [activity,     setActivity]     = useState([]);
  const [analytics,    setAnalytics]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [navOpen,      setNavOpen]      = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const calls = [
          api.get('/dashboard/stats'),
          api.get('/dashboard/low-stock'),
          api.get('/dashboard/today-reservations'),
          api.get('/dashboard/top-dishes'),
          api.get('/dashboard/recent-activity'),
          // Analytics sirf tab call karo jab tenant ke paas ye feature ho —
          // warna backend 403 dega aur Promise.all reject ho jayega.
          enabledFeatures.includes('analytics') ? api.get('/analytics/dashboard') : Promise.resolve(null),
        ];

        // allSettled — ek feature-gated call fail ho bhi jaye to baaki
        // dashboard data phir bhi load ho jaye.
        const [s, ls, r, td, a, an] = await Promise.allSettled(calls);

        if (s.status  === 'fulfilled') setStats(s.value.data.data);
        if (ls.status === 'fulfilled') setLowStock(ls.value.data.data);
        if (r.status  === 'fulfilled') setReservations(r.value.data.data);
        if (td.status === 'fulfilled') setTopDishes(td.value.data.data);
        if (a.status  === 'fulfilled') setActivity(a.value.data.data);
        if (an.status === 'fulfilled' && an.value) setAnalytics(an.value.data.data);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived chart data — reuses data we already fetched, no extra API calls ──
  const topDishesChartData = useMemo(
    () =>
      (topDishes || [])
        .slice(0, 5)
        .map((d) => ({
          label: String(d.dish_name || d.name || '').slice(0, 12) || '—',
          value: Number(d.order_count || d.count || 0),
        })),
    [topDishes]
  );

  const reservationsChartData = useMemo(
    () =>
      (reservations || [])
        .slice()
        .sort((a, b) => String(a.reservation_time).localeCompare(String(b.reservation_time)))
        .slice(0, 6)
        .map((r) => ({
          label: r.reservation_time,
          value: Number(r.guests || 0),
        })),
    [reservations]
  );

  const lowStockChartData = useMemo(
    () =>
      (lowStock || [])
        .slice(0, 5)
        .map((item) => ({
          label: String(item.name || item.item_name || '').slice(0, 12) || '—',
          value: Number(item.current_quantity || 0),
        })),
    [lowStock]
  );

  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      await api.post('/auth/logout', { refresh_token });
    } catch (_) {}
    logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

      @keyframes spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        .rdash-nav-link, .rdash-card-hover, .rdash-quick-btn { transition: none !important; }
      }

      .rdash-nav-link {
        font-family: 'JetBrains Mono', monospace;
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        text-align: left;
        background: transparent;
        border: none;
        color: #C9C2B4;
        padding: 8px 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.02em;
        transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
      }
      .rdash-nav-link:hover { background: rgba(255,255,255,0.06); color: #F7F5F0; padding-left: 14px; }

      .rdash-logout-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        border: 1px solid #EBC7BC;
        color: #B33F2C;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        transition: background 0.15s ease;
        white-space: nowrap;
      }
      .rdash-logout-btn:hover { background: #F6DFD9; }

      .rdash-icon-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #E9E3D6;
        color: #1A1815;
        width: 34px;
        height: 34px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 15px;
        display: none;
        align-items: center;
        justify-content: center;
      }
      .rdash-icon-btn:hover { border-color: #A97E44; }

      .rdash-card-hover { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rdash-card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(26,24,21,0.08); }

      .rdash-quick-btn {
        font-family: 'JetBrains Mono', monospace;
        transition: background 0.15s ease, transform 0.1s ease;
      }
      .rdash-quick-btn:hover { background: #2A2621 !important; transform: translateY(-1px); }
      .rdash-quick-btn:active { transform: translateY(0); }

      @media (max-width: 980px) {
        .rdash-sidebar { position: fixed !important; left: 0; top: 0; bottom: 0; z-index: 40;
          transform: translateX(-100%); transition: transform 0.2s ease; }
        .rdash-sidebar.open { transform: translateX(0); }
        .rdash-main { margin-left: 0 !important; }
        .rdash-icon-btn { display: inline-flex !important; }
        .rdash-scrim { display: block !important; }
      }
      @media (max-width: 900px) {
        .rdash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .rdash-an-grid   { grid-template-columns: 1fr !important; }
        .rdash-perf-grid { grid-template-columns: 1fr !important; }
        .rdash-two-grid  { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 560px) {
        .rdash-stats-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <GlobalStyle />
        <div style={styles.loadPulse} />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#7A7264', letterSpacing: '0.08em', marginTop: '14px' }}>
          PREPARING YOUR DASHBOARD…
        </p>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      <GlobalStyle />

      {/* Mobile scrim */}
      {navOpen && (
        <div
          className="rdash-scrim"
          style={styles.scrim}
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* ── Sidebar — styled like an order-ticket stub ─────── */}
      <aside className={`rdash-sidebar${navOpen ? ' open' : ''}`} style={styles.sidebar}>
        <div style={styles.brandRow}>
          <div style={styles.brandStamp}>DX</div>
          <div>
            <p style={styles.brandName}>DEBOX ERP</p>
            <p style={styles.brandSub}>{user?.tenant?.name || 'Restaurant'}</p>
          </div>
        </div>

        <nav style={styles.navScroll}>
          {visibleGroups.map((group) => (
            <div key={group.label} style={styles.navGroup}>
              <p style={styles.navGroupLabel}>{group.label}</p>
              {group.links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setNavOpen(false); }}
                  className="rdash-nav-link"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={styles.sidebarFoot}>
          <div style={styles.perforationV} />
          <p style={styles.sidebarFootText}>
            {today}
          </p>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="rdash-main" style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="rdash-icon-btn" onClick={() => setNavOpen(true)}>☰</button>
            <div>
              <span style={styles.eyebrow}>{greeting().toUpperCase()}</span>
              <h1 style={styles.pageTitle}>{user?.name || 'User'}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="rdash-logout-btn">Logout</button>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="rdash-stats-grid" style={styles.statsGrid}>
          <div className="rdash-card-hover" style={styles.statCard}>
            <div style={{ ...styles.statClip, background: '#A97E44' }} />
            <p style={styles.statLabel}>Today's Sales</p>
            <p style={styles.statValue}>{fmtCurrency(stats?.today_sales)}</p>
          </div>
          <div className="rdash-card-hover" style={styles.statCard}>
            <div style={{ ...styles.statClip, background: '#6E8F72' }} />
            <p style={styles.statLabel}>Today's Orders</p>
            <p style={styles.statValue}>{stats?.today_orders || 0}</p>
          </div>
          <div className="rdash-card-hover" style={styles.statCard}>
            <div style={{ ...styles.statClip, background: '#5B7B9A' }} />
            <p style={styles.statLabel}>Active Tables</p>
            <p style={styles.statValue}>
              {stats?.active_tables || 0}
              <span style={{ fontSize: '15px', color: '#B9B0A0' }}> / {stats?.total_tables || 0}</span>
            </p>
          </div>
          <div className="rdash-card-hover" style={styles.statCard}>
            <div style={{ ...styles.statClip, background: '#B8874B' }} />
            <p style={styles.statLabel}>Avg Bill</p>
            <p style={styles.statValue}>{fmtCurrency(stats?.avg_bill_value)}</p>
          </div>
        </div>

        {/* ── Analytics Overview ─────────────────────────────── */}
        {analytics && (
          <>
            <div style={styles.sectionLabel}>Analytics overview</div>
            <div className="rdash-an-grid" style={styles.anGrid}>
              <BarChart
                title="Revenue by Period"
                icon="💰"
                barColor="linear-gradient(90deg, #A97E44, #D4A96A)"
                trackColor="#F1EBDD"
                data={[
                  { label: 'Today', value: parseFloat(analytics.today?.revenue || 0) },
                  { label: 'Week',  value: parseFloat(analytics.week?.revenue || 0) },
                  { label: 'Month', value: parseFloat(analytics.month?.revenue || 0) },
                ]}
                formatValue={fmtCurrency}
              />
              <BarChart
                title="Orders by Period"
                icon="🧾"
                barColor="linear-gradient(90deg, #6E8F72, #9EBBA1)"
                trackColor="#EDF2EE"
                data={[
                  { label: 'Today', value: analytics.today?.orders || 0 },
                  { label: 'Week',  value: analytics.week?.orders || 0 },
                  { label: 'Month', value: analytics.month?.orders || 0 },
                ]}
              />
              <div style={styles.aovCard} className="rdash-card-hover">
                <div style={styles.aovClip} />
                <p style={styles.anLabel}>Avg Order Value</p>
                <p style={styles.aovValue}>{fmtCurrency(analytics.avg_order_value)}</p>
                <p style={styles.anSub}>per order · blended</p>
              </div>
            </div>
          </>
        )}

        {/* ── Performance — new charts, built from data we already fetch ── */}
        {(topDishesChartData.length > 0 || reservationsChartData.length > 0 || stats) && (
          <>
            <div style={styles.sectionLabel}>Performance</div>
            <div className="rdash-perf-grid" style={styles.perfGrid}>
              {topDishesChartData.length > 0 && (
                <BarChart
                  title="Top Dishes"
                  icon="🍽️"
                  barColor="linear-gradient(90deg, #B8874B, #E6BE7E)"
                  trackColor="#FBF3E6"
                  data={topDishesChartData}
                />
              )}
              {reservationsChartData.length > 0 && (
                <BarChart
                  title="Reservations by Time"
                  icon="📅"
                  barColor="linear-gradient(90deg, #5B7B9A, #92B4D1)"
                  trackColor="#EAF0F5"
                  data={reservationsChartData}
                  formatValue={(v) => `${v} guests`}
                />
              )}
              <RadialGauge
                title="Table Occupancy"
                icon="🪑"
                value={stats?.active_tables || 0}
                max={stats?.total_tables || 0}
                centerLabel={`${stats?.active_tables || 0}/${stats?.total_tables || 0}`}
                sublabel="active vs total tables"
                color="#6E8F72"
                trackColor="#EDF2EE"
              />
              {lowStockChartData.length > 0 && (
                <BarChart
                  title="Low Stock Levels"
                  icon="⚠️"
                  barColor="linear-gradient(90deg, #B33F2C, #D97B63)"
                  trackColor="#FBEEEB"
                  data={lowStockChartData}
                />
              )}
            </div>
          </>
        )}

        {/* ── Low Stock + Reservations ──────────────────────── */}
        <div className="rdash-two-grid" style={styles.twoGrid}>
          <div style={styles.card}>
            <div style={styles.perforation} />
            <h3 style={styles.cardTitle}>⚠️ Low Stock Alerts</h3>
            {lowStock.length === 0 ? (
              <EmptyState icon="✅" text="All stock levels are fine" />
            ) : (
              lowStock.map((item, i) => (
                <div key={i} style={styles.row}>
                  <span style={styles.rowLabel}>{item.name || item.item_name}</span>
                  <span style={styles.tagWarn}>{item.current_quantity} {item.unit} left</span>
                </div>
              ))
            )}
            {lowStock.length > 0 && (
              <button onClick={() => navigate('/inventory')} style={styles.cardLink}>
                View all inventory →
              </button>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.perforation} />
            <h3 style={styles.cardTitle}>📅 Today's Reservations</h3>
            {reservations.length === 0 ? (
              <EmptyState icon="🪑" text="No reservations booked today" />
            ) : (
              reservations.map((r, i) => (
                <div key={i} style={styles.row}>
                  <span style={styles.rowLabel}>{r.reservation_time} — {r.customer_name}</span>
                  <span style={styles.tagNeutral}>{r.guests} guests</span>
                </div>
              ))
            )}
            <button onClick={() => navigate('/reservations')} style={styles.cardLink}>
              View all reservations →
            </button>
          </div>
        </div>

        {/* ── Top Dishes + Recent Activity ─────────────────── */}
        <div className="rdash-two-grid" style={styles.twoGrid}>
          <div style={styles.card}>
            <div style={styles.perforation} />
            <h3 style={styles.cardTitle}>📈 Top Dishes Today</h3>
            {topDishes.length === 0 ? (
              <EmptyState icon="🍽️" text="No orders placed yet today" />
            ) : (
              topDishes.map((dish, i) => (
                <div key={i} style={styles.row}>
                  <span style={styles.rowLabel}>{dish.dish_name || dish.name}</span>
                  <span style={styles.tagStrong}>{dish.order_count || dish.count} orders</span>
                </div>
              ))
            )}
            <button onClick={() => navigate('/reports')} style={styles.cardLink}>
              Full report →
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.perforation} />
            <h3 style={styles.cardTitle}>🕐 Recent Activity</h3>
            {activity.length === 0 ? (
              <EmptyState icon="🕐" text="Nothing logged yet today" />
            ) : (
              activity.slice(0, 6).map((log, i) => (
                <div key={i} style={styles.row}>
                  <span style={styles.rowLabel}>{log.user_name || log.action}</span>
                  <span style={styles.tagMuted}>{log.action}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────── */}
        <div style={styles.quickActions}>
          <button onClick={() => navigate('/pos')} className="rdash-quick-btn" style={styles.quickBtn}>🛒 New Order</button>
          <button onClick={() => navigate('/reservations')} className="rdash-quick-btn" style={styles.quickBtn}>📅 New Reservation</button>
          <button onClick={() => navigate('/kds')} className="rdash-quick-btn" style={styles.quickBtn}>🍳 Kitchen Display</button>
          <button onClick={() => navigate('/analytics')} className="rdash-quick-btn" style={styles.quickBtn}>📊 Analytics</button>
          <button onClick={() => navigate('/reports')} className="rdash-quick-btn" style={styles.quickBtn}>📋 Reports</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: '#F7F5F0', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },
  loadPulse: { width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #E9E3D6', borderTopColor: '#A97E44', animation: 'spin 0.8s linear infinite' },

  scrim: { display: 'none', position: 'fixed', inset: 0, background: 'rgba(26,24,21,0.4)', zIndex: 30 },

  // ── Sidebar ──
  sidebar: {
    width: '224px', flexShrink: 0, background: '#1A1815', color: '#F7F5F0',
    display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'sticky', top: 0, height: '100vh',
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px' },
  brandStamp: { width: '32px', height: '32px', borderRadius: '6px', background: 'linear-gradient(160deg, #A97E44, #7C5A30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#1A1815', flexShrink: 0 },
  brandName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '0.06em', margin: 0, color: '#F7F5F0' },
  brandSub: { fontSize: '10px', color: '#9A9184', margin: '2px 0 0', letterSpacing: '0.02em' },

  navScroll: { flex: 1, overflowY: 'auto' },
  navGroup: { marginBottom: '16px' },
  navGroupLabel: { fontSize: '9px', fontWeight: '700', letterSpacing: '0.14em', color: '#6E675C', textTransform: 'uppercase', margin: '0 0 6px', padding: '0 10px' },

  sidebarFoot: { position: 'relative', paddingTop: '14px' },
  perforationV: { position: 'absolute', top: 0, left: '-14px', right: '-14px', height: '1px', background: 'repeating-linear-gradient(to right, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 5px, transparent 5px, transparent 11px)' },
  sidebarFootText: { fontSize: '10px', color: '#6E675C', letterSpacing: '0.03em', margin: 0, padding: '0 10px' },

  // ── Main ──
  main: { flex: 1, padding: '26px 30px 40px', minWidth: 0 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' },
  eyebrow: { display: 'inline-block', fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '2px' },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },

  sectionLabel: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', color: '#7A7264', textTransform: 'uppercase', marginBottom: '12px', marginTop: '6px' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' },
  statCard: { background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E9E3D6', padding: '16px 16px 14px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%' },
  statLabel: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7264', margin: '0 0 8px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '27px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },

  anGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 220px', gap: '14px', marginBottom: '22px', alignItems: 'stretch' },
  anLabel: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7264', margin: '0 0 6px' },
  anSub: { fontSize: '11px', color: '#B9B0A0', margin: '6px 0 0' },

  perfGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px', alignItems: 'stretch' },

  chartCard: { background: '#fff', borderRadius: '8px', border: '1px solid #E9E3D6', padding: '16px 18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)' },
  chartHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  chartIcon: { fontSize: '14px' },
  chartTitle: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1A1815' },
  chartBody: { display: 'flex', flexDirection: 'column', gap: '12px' },
  chartRow: { display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: '10px' },
  chartRowLabel: { fontSize: '11px', fontWeight: '600', color: '#7A7264' },
  chartTrack: { height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative' },
  chartFill: { height: '100%', borderRadius: '5px', transition: 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease' },
  chartRowValue: { fontSize: '12px', fontWeight: '700', color: '#1A1815', minWidth: '64px', textAlign: 'right' },

  gaugeCard: { background: '#fff', borderRadius: '8px', border: '1px solid #E9E3D6', padding: '16px 18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  gaugeWrap: { display: 'flex', justifyContent: 'center', padding: '2px 0 4px' },

  aovCard: { background: 'linear-gradient(160deg, #1A1815, #2A2621)', borderRadius: '8px', padding: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  aovClip: { position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'radial-gradient(circle at top right, rgba(169,126,68,0.35), transparent 70%)' },
  aovValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '0.01em', color: '#F7F5F0', margin: '0 0 2px' },

  twoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  card: { background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E9E3D6', padding: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: { position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px', background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' },
  cardTitle: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.03em', color: '#1A1815', margin: '0 0 12px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px dashed #E9E3D6' },
  rowLabel: { fontSize: '13px', color: '#1A1815' },

  tagWarn: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#B8874B', background: '#FBF3E6', padding: '3px 8px', borderRadius: '10px' },
  tagNeutral: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '600', color: '#5B7B9A', background: '#EAF0F5', padding: '3px 8px', borderRadius: '10px' },
  tagStrong: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: '700', color: '#1A1815', background: '#F1EEE7', padding: '3px 8px', borderRadius: '10px' },
  tagMuted: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#B9B0A0' },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '18px 0 10px' },
  emptyIcon: { fontSize: '20px', marginBottom: '6px' },
  empty: { fontSize: '12px', color: '#B9B0A0', margin: 0 },
  cardLink: { background: 'none', border: 'none', color: '#A97E44', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '12px 0 0', fontFamily: "'JetBrains Mono', monospace" },

  quickActions: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' },
  quickBtn: { background: '#1A1815', color: '#F7F5F0', border: 'none', borderRadius: '5px', padding: '11px 20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' },
};

export default Dashboard;