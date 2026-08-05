import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_TABS = [
  { key: '',          label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready',     label: 'Ready' },
  { key: 'served',    label: 'Served' },
  { key: 'paid',      label: 'Paid' },
  { key: 'cancelled', label: 'Cancelled' }
];

const NEXT_STATUS = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'served',
  served:    'paid'
};

const STATUS_COLOR = {
  pending:   '#A97E44',
  preparing: '#3B5170',
  ready:     '#3F7D33',
  served:    '#6B5B95',
  paid:      '#3F7D33',
  cancelled: '#B33F2C'
};

const PAYMENT_COLOR = {
  pending: '#A97E44',
  paid:    '#3F7D33'
};

const Orders = () => {
  const navigate = useNavigate();

  const [orders,       setOrders]       = useState([]);
  const [activeStatus, setActiveStatus] = useState('');
  const [loading,      setLoading]      = useState(true);
  const [expandedId,   setExpandedId]   = useState(null);
  const [updatingId,   setUpdatingId]   = useState(null);
  const [msg,          setMsg]          = useState({ type: '', text: '' });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const loadOrders = async (status = activeStatus) => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: status ? { status } : {} });
      setOrders(res.data.data || []);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(activeStatus);
  }, [activeStatus]);

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      await api.put(`/orders/${order.id}/status`, { status: newStatus });
      showMsg('success', `Order ${order.order_number} → ${newStatus}`);
      loadOrders();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.order_number}?`)) return;
    setUpdatingId(order.id);
    try {
      await api.put(`/orders/${order.id}/cancel`);
      showMsg('success', `Order ${order.order_number} cancelled`);
      loadOrders();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Cancel failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const table = (order) => order.Table || order.Tables || null;

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .ords-outline-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .ords-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .ords-tab {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        border-radius: 20px;
        padding: 6px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        color: #7A7264;
        white-space: nowrap;
        transition: all 0.15s ease;
      }
      .ords-tab-active { background: #1A1815 !important; color: #F7F5F0 !important; border-color: #1A1815 !important; }

      .ords-card { transition: box-shadow 0.15s ease; }
      .ords-card:hover { box-shadow: 0 6px 16px rgba(26,24,21,0.08); }

      .ords-expand-btn {
        font-family: 'JetBrains Mono', monospace;
        background: none;
        border: none;
        color: #A97E44;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }
      .ords-expand-btn:hover { color: #8B5F2A; }

      .ords-next-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #1A1815;
        color: #F7F5F0;
        border: none;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .ords-next-btn:hover:not(:disabled) { background: #A97E44; }
      .ords-next-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .ords-cancel-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: none;
        border-radius: 4px;
        padding: 7px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .ords-cancel-btn:hover:not(:disabled) { background: #F6DFD9; }
      .ords-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .ords-select {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 11.5px;
        font-weight: 600;
        color: #1A1815;
        background: #FFFFFF;
        cursor: pointer;
        outline: none;
      }
      .ords-select:focus { border-color: #A97E44; }

      @media (max-width: 640px) {
        .ords-card-top { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        .ords-actions { width: 100%; justify-content: flex-start !important; }
      }
    `}</style>
  );

  return (
    <div style={s.page}>
      <GlobalStyle />

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>ORDERS</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/pos')} className="ords-outline-btn">← POS</button>
          <button onClick={() => navigate('/dashboard')} className="ords-outline-btn">Dashboard</button>
        </div>
      </div>

      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      {/* Status tabs */}
      <div style={s.tabsRow}>
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveStatus(tab.key)}
            className={`ords-tab ${activeStatus === tab.key ? 'ords-tab-active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <p style={s.emptyText}>LOADING ORDERS…</p>
      ) : orders.length === 0 ? (
        <p style={s.emptyText}>No orders found</p>
      ) : (
        <div style={s.list}>
          {orders.map(order => {
            const t = table(order);
            const isExpanded = expandedId === order.id;
            const nextStatus = NEXT_STATUS[order.status];
            const isFinal = ['paid', 'cancelled'].includes(order.status);

            return (
              <div key={order.id} className="ords-card" style={s.card}>
                <div className="ords-card-top" style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <div style={s.orderNumRow}>
                      <span style={s.orderNum}>{order.order_number}</span>
                      <span style={{ ...s.badge, background: `${STATUS_COLOR[order.status]}1A`, color: STATUS_COLOR[order.status] }}>
                        {order.status}
                      </span>
                      <span style={{ ...s.badge, background: `${PAYMENT_COLOR[order.payment_status] || '#B9B0A0'}1A`, color: PAYMENT_COLOR[order.payment_status] || '#B9B0A0' }}>
                        {order.payment_status}
                      </span>
                    </div>
                    <div style={s.metaRow}>
                      <span>{order.order_type?.replace('_', ' ')}</span>
                      {t && <span> · Table {t.table_number}</span>}
                      <span> · {new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <button className="ords-expand-btn" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                      {isExpanded ? 'Hide items ▲' : `${order.OrderItems?.length || 0} items ▼`}
                    </button>
                  </div>

                  <div style={s.cardRight}>
                    <div style={s.total}>₹{parseFloat(order.total_amount).toFixed(2)}</div>

                    <div className="ords-actions" style={s.actions}>
                      {!isFinal && (
                        <select
                          className="ords-select"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={e => handleStatusChange(order, e.target.value)}
                        >
                          {['pending', 'preparing', 'ready', 'served'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      )}
                      {nextStatus && !isFinal && (
                        <button
                          className="ords-next-btn"
                          disabled={updatingId === order.id}
                          onClick={() => handleStatusChange(order, nextStatus)}
                        >
                          → {nextStatus}
                        </button>
                      )}
                      {!isFinal && (
                        <button
                          className="ords-cancel-btn"
                          disabled={updatingId === order.id}
                          onClick={() => handleCancel(order)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={s.itemsBox}>
                    {(order.OrderItems || []).map(item => (
                      <div key={item.id} style={s.itemRow}>
                        <div>
                          <span style={s.itemName}>{item.name}</span>
                          <span style={s.itemQty}> × {item.quantity}</span>
                          {item.note && <span style={s.itemNote}> — {item.note}</span>}
                        </div>
                        <span style={s.itemPrice}>₹{parseFloat(item.total_price).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={s.summaryBox}>
                      <div style={s.summaryRow}><span>Subtotal</span><span>₹{parseFloat(order.subtotal).toFixed(2)}</span></div>
                      <div style={s.summaryRow}><span>Tax</span><span>₹{parseFloat(order.tax_amount).toFixed(2)}</span></div>
                      {parseFloat(order.discount_amount) > 0 && (
                        <div style={s.summaryRow}><span>Discount</span><span>−₹{parseFloat(order.discount_amount).toFixed(2)}</span></div>
                      )}
                      <div style={{ ...s.summaryRow, ...s.summaryTotal }}>
                        <span>Total</span><span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                      {order.payment_method && (
                        <div style={s.summaryRow}><span>Paid via</span><span>{order.payment_method}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const s = {
  page:  { padding: '20px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },

  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '0.02em', color: '#1A1815', margin: 0 },
  headerBtns: { display: 'flex', gap: '8px' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '14px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  tabsRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' },

  emptyText: { textAlign: 'center', color: '#B9B0A0', fontSize: '13px', padding: '60px 0' },

  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)' },

  cardTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
  cardRight:{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },

  orderNumRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  orderNum:    { fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.01em', color: '#1A1815' },
  badge:       { fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '20px' },

  metaRow: { fontSize: '11.5px', color: '#B9B0A0' },

  total:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', color: '#1A1815' },
  actions: { display: 'flex', gap: '6px', alignItems: 'center' },

  itemsBox: { borderTop: '1px dashed #E9E3D6', marginTop: '12px', paddingTop: '12px' },
  itemRow:  { display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#1A1815', padding: '3px 0' },
  itemName: { fontWeight: '600' },
  itemQty:  { color: '#7A7264' },
  itemNote: { color: '#B9B0A0', fontStyle: 'italic' },
  itemPrice:{ fontWeight: '600' },

  summaryBox:   { borderTop: '1px dashed #E9E3D6', marginTop: '8px', paddingTop: '8px' },
  summaryRow:   { display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#7A7264', marginBottom: '4px' },
  summaryTotal: { fontWeight: '700', color: '#1A1815', fontSize: '12.5px' },
};

export default Orders;