import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import useAuthStore from '../store/authStore';

const NAV_LINKS = [
  { label: 'Setup',           path: '/restaurant-setup' },
  { label: 'Tables',          path: '/tables' },
  { label: 'Menu',            path: '/menu' },
  { label: 'Inventory',       path: '/inventory' },
  { label: 'Suppliers',       path: '/suppliers' },
  { label: 'Purchase Orders', path: '/purchase-orders' },
  { label: 'Recipes',         path: '/recipes' },
  { label: 'POS',             path: '/pos' },
  { label: 'KDS',             path: '/kds' },
  { label: 'Customers',       path: '/customers' },
  { label: 'Reservations',    path: '/reservations' },
  { label: 'Employees',       path: '/employees' },
  { label: 'Expenses',        path: '/expenses' },
  { label: 'Reports',         path: '/reports' },
  { label: 'Analytics',       path: '/analytics' },
  { label: 'Super Admin',     path: '/super-admin' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [stats,        setStats]        = useState(null);
  const [lowStock,     setLowStock]     = useState([]);
  const [reservations, setReservations] = useState([]);
  const [topDishes,    setTopDishes]    = useState([]);
  const [activity,     setActivity]     = useState([]);
  const [analytics,    setAnalytics]    = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, ls, r, td, a, an] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/low-stock'),
          api.get('/dashboard/today-reservations'),
          api.get('/dashboard/top-dishes'),
          api.get('/dashboard/recent-activity'),
          api.get('/analytics/dashboard'),
        ]);
        setStats(s.data.data);
        setLowStock(ls.data.data);
        setReservations(r.data.data);
        setTopDishes(td.data.data);
        setActivity(a.data.data);
        setAnalytics(an.data.data);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      await api.post('/auth/logout', { refresh_token });
    } catch (_) {}
    logout();
    navigate('/login');
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rdash-nav-btn {
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
        white-space: nowrap;
      }
      .rdash-nav-btn:hover { border-color: #A97E44; background: #FBF8F2; color: #A97E44; }

      .rdash-logout-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        border: 1px solid #EBC7BC;
        color: #B33F2C;
        padding: 7px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        transition: background 0.15s ease;
        white-space: nowrap;
      }
      .rdash-logout-btn:hover { background: #F6DFD9; }

      .rdash-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rdash-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rdash-an-card { transition: transform 0.15s ease; }
      .rdash-an-card:hover { transform: translateY(-2px); }

      @media (max-width: 900px) {
        .rdash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .rdash-an-grid   { grid-template-columns: repeat(2, 1fr) !important; }
        .rdash-two-grid  { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 560px) {
        .rdash-stats-grid { grid-template-columns: 1fr !important; }
        .rdash-an-grid   { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING DASHBOARD…
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
          <span style={styles.eyebrow}>DEBOX ERP</span>
          <h1 style={styles.pageTitle}>
            Welcome, {user?.name || 'User'} 👋
          </h1>
        </div>
        <button onClick={handleLogout} className="rdash-logout-btn">Logout</button>
      </div>

      {/* Nav Links */}
      <div style={styles.navBar}>
        {NAV_LINKS.map(link => (
          <button key={link.path} onClick={() => navigate(link.path)} className="rdash-nav-btn">
            {link.label}
          </button>
        ))}
      </div>

      {/* ── Stats from Dashboard API ──────────────────────── */}
      <div className="rdash-stats-grid" style={styles.statsGrid}>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Today's Sales</p>
          <p style={styles.statValue}>₹{stats?.today_sales?.toLocaleString() || 0}</p>
        </div>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Today's Orders</p>
          <p style={styles.statValue}>{stats?.today_orders || 0}</p>
        </div>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Active Tables</p>
          <p style={styles.statValue}>
            {stats?.active_tables || 0}
            <span style={{ fontSize: '16px', color: '#B9B0A0' }}> / {stats?.total_tables || 0}</span>
          </p>
        </div>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Avg Bill</p>
          <p style={styles.statValue}>₹{stats?.avg_bill_value || 0}</p>
        </div>
      </div>

      {/* ── Analytics Stats ───────────────────────────────── */}
      {analytics && (
        <div style={styles.sectionLabel}>📊 Analytics Overview</div>
      )}
      {analytics && (
        <div className="rdash-an-grid" style={styles.anGrid}>
          <div className="rdash-an-card" style={styles.anCard}>
            <p style={styles.anLabel}>Today Revenue</p>
            <p style={styles.anValue}>₹{parseFloat(analytics.today?.revenue || 0).toLocaleString()}</p>
            <p style={styles.anSub}>{analytics.today?.orders} orders</p>
          </div>
          <div className="rdash-an-card" style={styles.anCard}>
            <p style={styles.anLabel}>This Week</p>
            <p style={styles.anValue}>₹{parseFloat(analytics.week?.revenue || 0).toLocaleString()}</p>
            <p style={styles.anSub}>{analytics.week?.orders} orders</p>
          </div>
          <div className="rdash-an-card" style={styles.anCard}>
            <p style={styles.anLabel}>This Month</p>
            <p style={styles.anValue}>₹{parseFloat(analytics.month?.revenue || 0).toLocaleString()}</p>
            <p style={styles.anSub}>{analytics.month?.orders} orders</p>
          </div>
          <div className="rdash-an-card" style={{ ...styles.anCard, background: '#FBF3E6' }}>
            <p style={styles.anLabel}>Avg Order Value</p>
            <p style={{ ...styles.anValue, color: '#A97E44' }}>₹{parseFloat(analytics.avg_order_value || 0).toFixed(0)}</p>
            <p style={styles.anSub}>per order</p>
          </div>
        </div>
      )}

      {/* ── Low Stock + Reservations ──────────────────────── */}
      <div className="rdash-two-grid" style={styles.twoGrid}>
        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}>⚠️ Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p style={styles.empty}>All stock levels are fine ✅</p>
          ) : (
            lowStock.map((item, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{item.name || item.item_name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#B8874B', fontSize: '12px', fontWeight: '600' }}>
                  {item.current_quantity} {item.unit} left
                </span>
              </div>
            ))
          )}
          {lowStock.length > 0 && (
            <button onClick={() => navigate('/inventory')} style={styles.cardLink}>
              View All →
            </button>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}>📅 Today's Reservations</h3>
          {reservations.length === 0 ? (
            <p style={styles.empty}>No reservations today</p>
          ) : (
            reservations.map((r, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{r.reservation_time} — {r.customer_name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#7A7264' }}>
                  {r.guests} guests
                </span>
              </div>
            ))
          )}
          <button onClick={() => navigate('/reservations')} style={styles.cardLink}>
            View All →
          </button>
        </div>
      </div>

      {/* ── Top Dishes + Recent Activity ─────────────────── */}
      <div className="rdash-two-grid" style={styles.twoGrid}>
        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}>📈 Top Dishes Today</h3>
          {topDishes.length === 0 ? (
            <p style={styles.empty}>No orders yet</p>
          ) : (
            topDishes.map((dish, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{dish.dish_name || dish.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: '700', color: '#1A1815' }}>
                  {dish.order_count || dish.count} orders
                </span>
              </div>
            ))
          )}
          <button onClick={() => navigate('/reports')} style={styles.cardLink}>
            Full Report →
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}>🕐 Recent Activity</h3>
          {activity.length === 0 ? (
            <p style={styles.empty}>No recent activity</p>
          ) : (
            activity.slice(0, 6).map((log, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{log.user_name || log.action}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#B9B0A0' }}>
                  {log.action}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div style={styles.quickActions}>
        <button onClick={() => navigate('/pos')} style={styles.quickBtn}>🛒 New Order</button>
        <button onClick={() => navigate('/reservations')} style={styles.quickBtn}>📅 New Reservation</button>
        <button onClick={() => navigate('/kds')} style={styles.quickBtn}>🍳 Kitchen Display</button>
        <button onClick={() => navigate('/analytics')} style={styles.quickBtn}>📊 Analytics</button>
        <button onClick={() => navigate('/reports')} style={styles.quickBtn}>📋 Reports</button>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '28px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  eyebrow: { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '4px' },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },

  navBar: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', padding: '14px', background: '#fff', borderRadius: '6px', border: '1px solid #E9E3D6' },

  sectionLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#7A7264', textTransform: 'uppercase', marginBottom: '12px', marginTop: '4px' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '14px' },
  statCard: { background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '16px 16px 14px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  statLabel: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7264', margin: '0 0 8px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },

  anGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' },
  anCard: { background: '#fff', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '14px 16px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)' },
  anLabel: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7264', margin: '0 0 6px' },
  anValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#1A1815', margin: 0 },
  anSub: { fontSize: '11px', color: '#B9B0A0', margin: '4px 0 0' },

  twoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  card: { background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: { position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px', background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' },
  cardTitle: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.03em', color: '#1A1815', margin: '0 0 12px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px dashed #E9E3D6' },
  rowLabel: { fontSize: '13px', color: '#1A1815' },
  empty: { fontSize: '12px', color: '#B9B0A0', margin: '4px 0 0' },
  cardLink: { background: 'none', border: 'none', color: '#A97E44', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '10px 0 0', fontFamily: "'JetBrains Mono', monospace" },

  quickActions: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' },
  quickBtn: { background: '#1A1815', color: '#F7F5F0', border: 'none', borderRadius: '4px', padding: '11px 20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace', letterSpacing: '0.04em", transition: 'background 0.15s' },
};

export default Dashboard;