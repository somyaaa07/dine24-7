import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const navigate  = useNavigate();
  const { user, logout } = useAuthStore();

  const [stats,        setStats]        = useState(null);
  const [lowStock,     setLowStock]     = useState([]);
  const [reservations, setReservations] = useState([]);
  const [topDishes,    setTopDishes]    = useState([]);
  const [activity,     setActivity]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, ls, r, td, a] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/low-stock'),
          api.get('/dashboard/today-reservations'),
          api.get('/dashboard/top-dishes'),
          api.get('/dashboard/recent-activity'),
        ]);
        setStats(s.data.data);
        setLowStock(ls.data.data);
        setReservations(r.data.data);
        setTopDishes(td.data.data);
        setActivity(a.data.data);
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

  if (loading) {
    return (
      <div style={styles.centered}>
        <p style={{ color: '#64748b' }}>Dashboard load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>Namaste, {user?.name || 'User'} 👋</p>
          <h1 style={styles.pageTitle}>Dashboard</h1>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/restaurant-setup')} style={styles.outlineBtn}>
            Setup
          </button>
          <button onClick={() => navigate('/tables')} style={styles.outlineBtn}>
            Tables
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Aaj ki Sales</p>
          <p style={styles.statValue}>₹{stats?.today_sales?.toLocaleString() || 0}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Orders</p>
          <p style={styles.statValue}>{stats?.today_orders || 0}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Active Tables</p>
          <p style={styles.statValue}>{stats?.active_tables || 0} / {stats?.total_tables || 0}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Avg Bill</p>
          <p style={styles.statValue}>₹{stats?.avg_bill_value || 0}</p>
        </div>
      </div>

      {/* Low Stock + Reservations */}
      <div style={styles.twoGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚠️ Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p style={styles.empty}>Sab stock theek hai ✅</p>
          ) : (
            lowStock.map((item, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{item.item_name}</span>
                <span style={{ color: '#f59e0b', fontSize: '13px' }}>
                  {item.current_quantity} {item.unit} bacha
                </span>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📅 Aaj Ki Reservations</h3>
          {reservations.length === 0 ? (
            <p style={styles.empty}>Koi reservation nahi hai aaj</p>
          ) : (
            reservations.map((r, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{r.time} — {r.customer_name}</span>
                <span style={{ fontSize: '13px' }}>{r.guests} guests</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Dishes + Recent Activity */}
      <div style={styles.twoGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📈 Top Dishes Aaj</h3>
          {topDishes.length === 0 ? (
            <p style={styles.empty}>Abhi koi orders nahi</p>
          ) : (
            topDishes.map((dish, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{dish.dish_name}</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  {dish.order_count} orders
                </span>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🕐 Recent Activity</h3>
          {activity.length === 0 ? (
            <p style={styles.empty}>Koi activity nahi</p>
          ) : (
            activity.slice(0, 6).map((log, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{log.user_name}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {log.action}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

const styles = {
  page:       { padding: '24px', background: '#f8fafc', minHeight: '100vh' },
  centered:   { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  greeting:   { fontSize: '14px', color: '#64748b', margin: '0 0 4px' },
  pageTitle:  { fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '0' },
  headerRight:{ display: 'flex', gap: '8px', alignItems: 'center' },
  outlineBtn: { background: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  logoutBtn:  { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  statCard:   { background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statLabel:  { fontSize: '13px', color: '#64748b', margin: '0 0 8px' },
  statValue:  { fontSize: '26px', fontWeight: '600', color: '#1e293b', margin: '0' },
  twoGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  card:       { background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle:  { fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' },
  row:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f1f5f9' },
  rowLabel:   { fontSize: '13px', color: '#64748b' },
  empty:      { fontSize: '13px', color: '#9ca3af', margin: '8px 0 0' },
};

export default Dashboard;