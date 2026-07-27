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

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rdash-outline-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        padding: 9px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .rdash-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rdash-logout-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        border: 1px solid #EBC7BC;
        color: #B33F2C;
        padding: 9px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        transition: background 0.15s ease;
      }
      .rdash-logout-btn:hover { background: #F6DFD9; }

      .rdash-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rdash-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      @media (max-width: 900px) {
        .rdash-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .rdash-two-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 560px) {
        .rdash-stats-grid { grid-template-columns: 1fr !important; }
        .rdash-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
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
      <div className="rdash-header" style={styles.header}>
        <div>
          <span style={styles.eyebrow}>KITCHEN PASS</span>
          <h1 style={styles.pageTitle}>
            Welcome, {user?.name || 'User'} <span style={{ opacity: 0.6 }}>👋</span>
          </h1>
        </div>
        <div style={styles.headerRight}>
          
          <button onClick={() => navigate('/restaurant-setup')} className="rdash-outline-btn">
            Setup
          </button>
          <button onClick={() => navigate('/tables')} className="rdash-outline-btn">
            Tables
          </button>
          <button onClick={() => navigate('/menu')} className="rdash-outline-btn" >
  Menu
</button>
          <button onClick={() => navigate('/inventory')} className="rdash-outline-btn" >
  Inventory
</button>
 <button onClick={() => navigate('/supplier')} className="rdash-outline-btn" >
  Suppliers
</button>
 <button onClick={() => navigate('/purchase-orders')} className="rdash-outline-btn" >
  Purchase Orders
</button>


          <button onClick={handleLogout} className="rdash-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="rdash-stats-grid" style={styles.statsGrid}>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Today's Sales</p>
          <p style={styles.statValue}>₹{stats?.today_sales?.toLocaleString() || 0}</p>
        </div>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Orders</p>
          <p style={styles.statValue}>{stats?.today_orders || 0}</p>
        </div>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Active Tables</p>
          <p style={styles.statValue}>{stats?.active_tables || 0} <span style={{ fontSize: '16px', color: '#B9B0A0' }}>/ {stats?.total_tables || 0}</span></p>
        </div>
        <div className="rdash-stat-card" style={styles.statCard}>
          <div style={styles.statClip} />
          <p style={styles.statLabel}>Avg Bill</p>
          <p style={styles.statValue}>₹{stats?.avg_bill_value || 0}</p>
        </div>
      </div>

      {/* Low Stock + Reservations */}
      <div className="rdash-two-grid" style={styles.twoGrid}>
        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}><span style={styles.cardIcon}>⚠️</span> Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p style={styles.empty}>All stock levels are fine ✅</p>
          ) : (
            lowStock.map((item, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{item.item_name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#B8874B', fontSize: '12.5px', fontWeight: '600' }}>
                  {item.current_quantity} {item.unit} left
                </span>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}><span style={styles.cardIcon}>📅</span> Today's Reservations</h3>
          {reservations.length === 0 ? (
            <p style={styles.empty}>No reservations today</p>
          ) : (
            reservations.map((r, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{r.time} — {r.customer_name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px', color: '#7A7264' }}>{r.guests} guests</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Dishes + Recent Activity */}
      <div className="rdash-two-grid" style={styles.twoGrid}>
        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}><span style={styles.cardIcon}>📈</span> Top Dishes Today</h3>
          {topDishes.length === 0 ? (
            <p style={styles.empty}>No orders yet</p>
          ) : (
            topDishes.map((dish, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{dish.dish_name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12.5px', fontWeight: '700', color: '#1A1815' }}>
                  {dish.order_count} orders
                </span>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.perforation} />
          <h3 style={styles.cardTitle}><span style={styles.cardIcon}>🕐</span> Recent Activity</h3>
          {activity.length === 0 ? (
            <p style={styles.empty}>No recent activity</p>
          ) : (
            activity.slice(0, 6).map((log, i) => (
              <div key={i} style={styles.row}>
                <span style={styles.rowLabel}>{log.user_name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', color: '#B9B0A0' }}>
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
  page: {
    padding: '32px',
    background: '#F7F5F0',
    minHeight: '100vh',
    fontFamily: "'JetBrains Mono', monospace"
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#F7F5F0'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px'
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.14em',
    color: '#A97E44',
    marginBottom: '6px'
  },
  pageTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '30px',
    letterSpacing: '0.01em',
    color: '#1A1815',
    margin: 0
  },
  headerRight: { display: 'flex', gap: '10px', alignItems: 'center' },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    background: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #E9E3D6',
    padding: '18px 18px 16px',
    boxShadow: '0 1px 2px rgba(26,24,21,0.03)',
    position: 'relative',
    overflow: 'hidden'
  },
  statClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: '#A97E44'
  },
  statLabel: {
    fontSize: '10.5px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#7A7264',
    margin: '0 0 10px'
  },
  statValue: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '30px',
    letterSpacing: '0.01em',
    color: '#1A1815',
    margin: 0
  },

  twoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #E9E3D6',
    padding: '20px',
    boxShadow: '0 1px 2px rgba(26,24,21,0.03)',
    position: 'relative'
  },
  perforation: {
    position: 'absolute',
    top: '-1px',
    left: 0,
    right: 0,
    height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px'
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    color: '#1A1815',
    margin: '0 0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cardIcon: { fontSize: '14px' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderTop: '1px dashed #E9E3D6'
  },
  rowLabel: { fontSize: '13px', color: '#1A1815' },
  empty: { fontSize: '12.5px', color: '#B9B0A0', margin: '4px 0 0' }
};

export default Dashboard;