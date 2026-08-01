import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_CONFIG = {
  pending:   { bg: '#2A2418', border: '#C99A5B', color: '#E7C48F', label: 'NEW',       icon: '🔴' },
  preparing: { bg: '#1E252C', border: '#6C8FB0', color: '#A9C2D6', label: 'PREPARING', icon: '🔵' },
  ready:     { bg: '#1B2419', border: '#6FA85B', color: '#A7CC97', label: 'READY',     icon: '🟢' },
};

const KDS = () => {
  const navigate = useNavigate();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  // ── Auto refresh — every 15 seconds ──────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/kds');
      setOrders(res.data.data);
      setLastFetch(new Date());
    } catch (err) {
      console.error('KDS fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // refresh every 15 sec
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Order status update ──────────────────────────────────
  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/kds/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // ── Item status update ───────────────────────────────────
  const handleItemStatus = async (itemId, status) => {
    try {
      await api.put(`/kds/items/${itemId}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error('Item status update failed:', err);
    }
  };

  // ── Calculate order time ─────────────────────────────────
  const getElapsedTime = (createdAt) => {
    const diff = Math.floor((new Date() - new Date(createdAt)) / 1000 / 60);
    if (diff < 1)  return 'Just now';
    if (diff === 1) return '1 min ago';
    return `${diff} mins ago`;
  };

  const isUrgent = (createdAt) => {
    const diff = Math.floor((new Date() - new Date(createdAt)) / 1000 / 60);
    return diff >= 15; // more than 15 min — urgent
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rkds-refresh-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #211E19;
        color: #C4BBA9;
        border: 1px solid #3A352B;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s ease, color 0.15s ease;
      }
      .rkds-refresh-btn:hover { border-color: #C99A5B; color: #F7F5F0; }

      .rkds-dash-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #2A261F;
        color: #E9E3D6;
        border: none;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rkds-dash-btn:hover { background: #3A352B; }

      .rkds-item-prep-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #6C8FB0;
        color: #14120F;
        border: none;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.03em;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rkds-item-prep-btn:hover { opacity: 0.85; }

      .rkds-item-ready-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #6FA85B;
        color: #14120F;
        border: none;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.03em;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rkds-item-ready-btn:hover { opacity: 0.85; }

      .rkds-prepare-all-btn {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: #6C8FB0;
        color: #14120F;
        border: none;
        border-radius: 4px;
        padding: 12px;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rkds-prepare-all-btn:hover { opacity: 0.88; }

      .rkds-ready-all-btn {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: #6FA85B;
        color: #14120F;
        border: none;
        border-radius: 4px;
        padding: 12px;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rkds-ready-all-btn:hover { opacity: 0.88; }

      .rkds-order-card { transition: border-color 0.3s ease, transform 0.15s ease; }
      .rkds-order-card:hover { transform: translateY(-2px); }

      @keyframes rkds-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(226, 96, 74, 0.45); }
        50% { box-shadow: 0 0 0 9px rgba(226, 96, 74, 0); }
      }

      @media (max-width: 640px) {
        .rkds-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px; }
        .rkds-header-right { flex-wrap: wrap; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#A79E8E', letterSpacing: '0.04em' }}>
          LOADING KITCHEN…
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <GlobalStyle />

      {/* Header */}
      <div className="rkds-header" style={s.header}>
        <div style={s.headerLeft}>
          <div>
            <span style={s.eyebrow}>PASS</span>
            <h1 style={s.title}>Kitchen Display</h1>
          </div>
          <span style={s.orderCount}>{orders.length} Active Orders</span>
        </div>
        <div className="rkds-header-right" style={s.headerRight}>
          <span style={s.lastUpdate}>
            Last update: {lastFetch ? lastFetch.toLocaleTimeString() : '—'}
          </span>
          <button onClick={fetchOrders} className="rkds-refresh-btn">↻ Refresh</button>
          <button onClick={() => navigate('/dashboard')} className="rkds-dash-btn">Dashboard</button>
        </div>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <span key={key} style={s.legendItem}>
            {val.icon} {val.label}
          </span>
        ))}
        <span style={{ ...s.legendItem, color: '#E2604A', fontWeight: '700' }}>🚨 URGENT (15+ min)</span>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ fontSize: '26px', margin: '0 0 8px' }}>✅</p>
          <p style={{ fontSize: '16px', color: '#A79E8E' }}>All orders complete — kitchen is clear!</p>
        </div>
      ) : (
        <div style={s.ordersGrid}>
          {orders.map(order => {
            const cfg     = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const urgent  = isUrgent(order.createdAt);

            return (
              <div key={order.id} className="rkds-order-card" style={{
                ...s.orderCard,
                borderColor:  urgent ? '#E2604A' : cfg.border,
                background:   urgent ? '#2B1917' : cfg.bg,
                animation:    urgent ? 'rkds-pulse 2s infinite' : 'none'
              }}>

                {/* Card Header */}
                <div style={s.cardHeader}>
                  <div>
                    <div style={s.orderNumber}>{order.order_number}</div>
                    <div style={s.tableInfo}>
                      {order.Table
                        ? `Table ${order.Table.table_number}`
                        : order.order_type === 'takeaway' ? '🥡 Takeaway'
                        : '🛵 Delivery'
                      }
                    </div>
                  </div>
                  <div style={s.cardHeaderRight}>
                    <span style={{
                      ...s.statusBadge,
                      background: cfg.border,
                      color: '#14120F'
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span style={{
                      ...s.timeLabel,
                      color: urgent ? '#E2604A' : '#A79E8E'
                    }}>
                      {urgent && '🚨 '}{getElapsedTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={s.itemsList}>
                  {order.OrderItems?.map(item => (
                    <div key={item.id} style={{
                      ...s.itemRow,
                      opacity: item.status === 'served' ? 0.4 : 1
                    }}>
                      <div style={s.itemLeft}>
                        <span style={s.itemQty}>{item.quantity}×</span>
                        <div>
                          <div style={s.itemName}>{item.name}</div>
                          {item.note && (
                            <div style={s.itemNote}>📝 {item.note}</div>
                          )}
                        </div>
                      </div>
                      <div style={s.itemActions}>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleItemStatus(item.id, 'preparing')}
                            className="rkds-item-prep-btn">
                            Start
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            onClick={() => handleItemStatus(item.id, 'ready')}
                            className="rkds-item-ready-btn">
                            Ready ✓
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <span style={s.itemDoneLabel}>✅ Ready</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {order.note && (
                    <div style={s.orderNote}>
                      📋 Order Note: {order.note}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={s.cardActions}>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleOrderStatus(order.id, 'preparing')}
                      className="rkds-prepare-all-btn">
                      🔵 Start All
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleOrderStatus(order.id, 'ready')}
                      className="rkds-ready-all-btn">
                      🟢 Mark All Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <div style={s.readyMessage}>
                      ✅ Ready to serve!
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const s = {
  page:     { padding: '24px', background: '#14120F', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#14120F' },

  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: '18px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  eyebrow:     { display: 'block', fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.16em', color: '#C99A5B', marginBottom: '2px' },
  title:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '0.02em', color: '#F7F5F0', margin: 0 },
  orderCount:  { background: '#211E19', color: '#C4BBA9', fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '999px', border: '1px solid #3A352B' },
  lastUpdate:  { fontSize: '11px', color: '#6B6355' },

  legend:     { display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '12px', color: '#A79E8E', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' },

  ordersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  orderCard:  { borderRadius: '6px', border: '2px solid', padding: '16px' },

  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  orderNumber: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', color: '#F7F5F0' },
  tableInfo:   { fontSize: '12px', color: '#A79E8E', marginTop: '2px' },
  cardHeaderRight: { textAlign: 'right' },
  statusBadge: { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.02em', padding: '3px 10px', borderRadius: '999px', display: 'block', marginBottom: '5px' },
  timeLabel:   { fontSize: '11.5px', fontWeight: '600' },

  itemsList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' },
  itemRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.22)', borderRadius: '4px', padding: '8px 10px' },
  itemLeft:  { display: 'flex', alignItems: 'flex-start', gap: '8px' },
  itemQty:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.01em', color: '#F7F5F0', minWidth: '28px' },
  itemName:  { fontSize: '13px', fontWeight: '600', color: '#F0ECE3' },
  itemNote:  { fontSize: '10.5px', color: '#E2604A', marginTop: '2px' },
  itemActions:{ display: 'flex', gap: '6px' },
  itemDoneLabel: { fontSize: '11px', color: '#6FA85B', fontWeight: '700' },

  orderNote: { background: 'rgba(226,96,74,0.12)', border: '1px solid rgba(226,96,74,0.3)', borderRadius: '4px', padding: '7px 10px', fontSize: '11.5px', color: '#F0A897' },

  cardActions: { borderTop: '1px dashed rgba(255,255,255,0.12)', paddingTop: '12px' },
  readyMessage:{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#6FA85B', padding: '8px' },

  emptyState: { textAlign: 'center', padding: '100px 20px', color: '#6B6355' },
};

export default KDS;