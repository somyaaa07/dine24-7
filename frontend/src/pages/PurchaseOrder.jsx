import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_STYLES = {
  draft:     { bg: '#F0EDE4', color: '#7A7264', label: 'Draft' },
  sent:      { bg: '#EDF1F5', color: '#3B5170', label: 'Sent' },
  received:  { bg: '#F0F7EE', color: '#3F7D33', label: 'Received' },
  cancelled: { bg: '#FBEEEB', color: '#B33F2C', label: 'Cancelled' },
};

const EMPTY_FORM = {
  supplier_id:       '',
  expected_delivery: '',
  note:              '',
  items:             []
};

const EMPTY_ITEM = {
  inventory_item_id: '',
  quantity_ordered:  '',
  unit_price:        ''
};

const PurchaseOrders = () => {
  const navigate = useNavigate();

  const [orders,      setOrders]      = useState([]);
  const [suppliers,   setSuppliers]   = useState([]);
  const [invItems,    setInvItems]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState({ type: '', text: '' });
  const [statusFilter, setStatusFilter] = useState('all');

  // Form
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [formItems, setFormItems] = useState([{ ...EMPTY_ITEM }]);

  // Detail view
  const [viewOrder, setViewOrder] = useState(null);

  // ── Fetch ────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? '/purchase-orders'
        : `/purchase-orders?status=${statusFilter}`;
      const res = await api.get(url);
      setOrders(res.data.data);
    } catch (err) {
      console.error('Orders fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/supplier');
      setSuppliers(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchInvItems = async () => {
    try {
      const res = await api.get('/inventory');
      setInvItems(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchInvItems();
  }, []);

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // ── Form Item Handlers ───────────────────────────────────
  const addFormItem = () => {
    setFormItems([...formItems, { ...EMPTY_ITEM }]);
  };

  const removeFormItem = (index) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const updateFormItem = (index, field, value) => {
    const updated = [...formItems];
    updated[index][field] = value;

    // Auto-fill unit price from inventory
    if (field === 'inventory_item_id') {
      const invItem = invItems.find(i => i.id === parseInt(value));
      if (invItem) updated[index].unit_price = invItem.purchase_price || '';
    }

    setFormItems(updated);
  };

  // Calculate total
  const totalAmount = formItems.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity_ordered) || 0) * (parseFloat(item.unit_price) || 0);
  }, 0);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = formItems.filter(
      i => i.inventory_item_id && i.quantity_ordered && i.unit_price
    );

    if (validItems.length === 0) {
      return showMsg('error', 'Add at least one item');
    }

    try {
      await api.post('/purchase-orders', {
        supplier_id:       form.supplier_id,
        expected_delivery: form.expected_delivery || null,
        note:              form.note              || null,
        items:             validItems
      });
      showMsg('success', 'Purchase order created!');
      setForm(EMPTY_FORM);
      setFormItems([{ ...EMPTY_ITEM }]);
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not create PO');
    }
  };

  // ── Status Update ────────────────────────────────────────
  const handleStatusUpdate = async (id, status, poNumber) => {
    const confirmMsg = status === 'received'
      ? `Mark ${poNumber} as received? Inventory will update automatically.`
      : `Change status to "${status}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/purchase-orders/${id}/status`, { status });
      showMsg('success', `Order status updated!`);
      fetchOrders();
      if (viewOrder?.id === id) setViewOrder(null);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not update status');
    }
  };

  // ── Cancel ───────────────────────────────────────────────
  const handleCancel = async (id, poNumber) => {
    if (!window.confirm(`Cancel ${poNumber}?`)) return;
    try {
      await api.put(`/purchase-orders/${id}/cancel`);
      showMsg('success', 'Order cancelled');
      fetchOrders();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not cancel');
    }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rpo-outline-btn {
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
      .rpo-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rpo-primary-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #1A1815;
        color: #F7F5F0;
        border: none;
        border-radius: 4px;
        padding: 9px 16px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rpo-primary-btn:hover { background: #A97E44; }

      .rpo-filter-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #7A7264;
        border-radius: 4px;
        padding: 6px 16px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.03em;
        cursor: pointer;
        transition: border-color 0.15s ease, color 0.15s ease;
      }
      .rpo-filter-btn:hover { border-color: #A97E44; color: #1A1815; }
      .rpo-filter-active { background: #1A1815 !important; color: #F7F5F0 !important; border-color: #1A1815 !important; }

      .rpo-input, select.rpo-input {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px 10px;
        font-size: 13px;
        color: #1A1815;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        background: #FFFFFF;
        transition: border-color 0.15s ease;
      }
      .rpo-input:focus { border-color: #A97E44; }
      select.rpo-input { cursor: pointer; }
      .rpo-input::placeholder { color: #B9B0A0; }

      .rpo-add-item-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #EDF1F5;
        color: #3B5170;
        border: 1px solid #CBD8E3;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rpo-add-item-btn:hover { background: #E0E7EE; }

      .rpo-remove-btn { background: none; border: none; color: #B33F2C; cursor: pointer; font-size: 15px; padding: 0 4px; }

      .rpo-order-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rpo-order-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rpo-action {
        font-family: 'JetBrains Mono', monospace;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rpo-action:hover { opacity: 0.85; }

      @media (max-width: 860px) {
        .rpo-form-grid { grid-template-columns: 1fr !important; }
        .rpo-item-row { flex-wrap: wrap !important; }
      }
      @media (max-width: 560px) {
        .rpo-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
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

      {/* Header */}
      <div className="rpo-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>PROCUREMENT</span>
          <h1 style={s.title}>Purchase Orders</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rpo-outline-btn">← Dashboard</button>
          <button onClick={() => {
            setShowForm(true);
            setViewOrder(null);
            setForm(EMPTY_FORM);
            setFormItems([{ ...EMPTY_ITEM }]);
          }} className="rpo-primary-btn">+ New PO</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      {/* Status Filter */}
      <div style={s.filters}>
        {['all', 'draft', 'sent', 'received', 'cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`rpo-filter-btn ${statusFilter === st ? 'rpo-filter-active' : ''}`}
          >
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>New Purchase Order</h3>
          <form onSubmit={handleSubmit}>

            {/* PO Info */}
            <div className="rpo-form-grid" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Supplier *</label>
                <select value={form.supplier_id}
                  onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                  className="rpo-input" required>
                  <option value="">-- Select supplier --</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Expected Delivery</label>
                <input type="date" value={form.expected_delivery}
                  onChange={e => setForm({ ...form, expected_delivery: e.target.value })}
                  className="rpo-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Note</label>
                <input value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="Optional..." className="rpo-input" />
              </div>
            </div>

            {/* Items */}
            <div style={s.itemsSection}>
              <div style={s.itemsHeader}>
                <h4 style={s.itemsTitle}>Items</h4>
                <button type="button" onClick={addFormItem} className="rpo-add-item-btn">
                  + Add Item
                </button>
              </div>

              {/* Items Table Header */}
              <div className="rpo-item-row" style={s.itemRow}>
                <span style={{ ...s.itemCol, flex: 3, ...s.colHeader }}>Item</span>
                <span style={{ ...s.itemCol, ...s.colHeader }}>Qty</span>
                <span style={{ ...s.itemCol, ...s.colHeader }}>Unit Price</span>
                <span style={{ ...s.itemCol, ...s.colHeader }}>Total</span>
                <span style={{ width: '30px' }}></span>
              </div>

              {formItems.map((item, index) => (
                <div key={index} className="rpo-item-row" style={s.itemRow}>
                  <div style={{ ...s.itemCol, flex: 3 }}>
                    <select value={item.inventory_item_id}
                      onChange={e => updateFormItem(index, 'inventory_item_id', e.target.value)}
                      className="rpo-input">
                      <option value="">-- Item --</option>
                      {invItems.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={s.itemCol}>
                    <input type="number" min={0} step={0.001}
                      value={item.quantity_ordered}
                      onChange={e => updateFormItem(index, 'quantity_ordered', e.target.value)}
                      placeholder="0" className="rpo-input" />
                  </div>
                  <div style={s.itemCol}>
                    <input type="number" min={0} step={0.01}
                      value={item.unit_price}
                      onChange={e => updateFormItem(index, 'unit_price', e.target.value)}
                      placeholder="₹0" className="rpo-input" />
                  </div>
                  <div style={s.itemCol}>
                    <span style={s.itemTotal}>
                      ₹{((parseFloat(item.quantity_ordered) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
                    </span>
                  </div>
                  <button type="button" onClick={() => removeFormItem(index)}
                    className="rpo-remove-btn" disabled={formItems.length === 1}>✕</button>
                </div>
              ))}

              {/* Total */}
              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total Amount:</span>
                <span style={s.totalValue}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style={s.formActions}>
              <button type="submit" className="rpo-primary-btn">Create PO</button>
              <button type="button" onClick={() => setShowForm(false)} className="rpo-outline-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>
            No purchase orders yet — use "+ New PO" above to create one
          </p>
        </div>
      ) : (
        <div style={s.ordersList}>
          {orders.map(order => {
            const st = STATUS_STYLES[order.status] || STATUS_STYLES.draft;
            return (
              <div key={order.id} className="rpo-order-card" style={s.orderCard}>
                <div style={s.orderClip} />

                {/* Order Header */}
                <div style={s.orderTop}>
                  <div>
                    <h3 style={s.poNumber}>{order.po_number}</h3>
                    <p style={s.supplierName}>
                      {order.Supplier?.name}
                    </p>
                  </div>
                  <div style={s.orderRight}>
                    <span style={{ ...s.statusBadge, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <p style={s.orderAmount}>₹{parseFloat(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Meta */}
                <div style={s.orderMeta}>
                  <span>📅 {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  {order.expected_delivery && (
                    <span>🚚 Expected: {new Date(order.expected_delivery).toLocaleDateString('en-IN')}</span>
                  )}
                  <span>📦 {order.PurchaseOrderItems?.length || 0} items</span>
                </div>

                {/* Items Preview */}
                <div style={s.itemsPreview}>
                  {order.PurchaseOrderItems?.slice(0, 3).map(item => (
                    <span key={item.id} style={s.itemChip}>
                      {item.InventoryItem?.name} × {item.quantity_ordered} {item.InventoryItem?.unit}
                    </span>
                  ))}
                  {(order.PurchaseOrderItems?.length || 0) > 3 && (
                    <span style={s.itemChip}>+{order.PurchaseOrderItems.length - 3} more</span>
                  )}
                </div>

                {/* Actions */}
                <div style={s.orderActions}>
                  {order.status === 'draft' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'sent', order.po_number)}
                      className="rpo-action" style={s.actionBlue}>Mark Sent</button>
                  )}
                  {order.status === 'sent' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'received', order.po_number)}
                      className="rpo-action" style={s.actionGreen}>Mark Received ✓</button>
                  )}
                  {['draft', 'sent'].includes(order.status) && (
                    <button onClick={() => handleCancel(order.id, order.po_number)}
                      className="rpo-action" style={s.actionRed}>Cancel</button>
                  )}
                  {order.status === 'received' && order.received_at && (
                    <span style={{ fontSize: '11.5px', color: '#3F7D33', fontWeight: '600' }}>
                      ✅ Received on {new Date(order.received_at).toLocaleDateString('en-IN')}
                    </span>
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
  page:     { padding: '32px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },

  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  eyebrow:    { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
  title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  headerBtns: { display: 'flex', gap: '10px' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '18px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },

  formCard: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '26px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', margin: '0 0 18px', color: '#1A1815' },
  formGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '22px' },
  formActions: { display: 'flex', gap: '10px', marginTop: '18px' },
  field:       { display: 'flex', flexDirection: 'column' },
  label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '7px' },

  itemsSection: { borderTop: '1px dashed #E9E3D6', paddingTop: '18px' },
  itemsHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  itemsTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  itemRow:      { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
  itemCol:      { flex: 1 },
  colHeader:    { fontWeight: '700', fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7A7264' },
  itemTotal:    { fontSize: '13px', fontWeight: '700', color: '#1A1815' },
  totalRow:     { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #E9E3D6' },
  totalLabel:   { fontSize: '12.5px', fontWeight: '600', color: '#7A7264' },
  totalValue:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '0.01em', color: '#1A1815' },

  ordersList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  orderCard:  { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  orderClip:  { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  orderTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  poNumber:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', color: '#1A1815', margin: '0 0 4px' },
  supplierName: { fontSize: '12.5px', color: '#7A7264', margin: 0 },
  orderRight: { textAlign: 'right' },
  statusBadge:{ fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.03em', padding: '3px 10px', borderRadius: '999px', display: 'inline-block', marginBottom: '5px' },
  orderAmount:{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  orderMeta:  { display: 'flex', gap: '16px', fontSize: '11.5px', color: '#B9B0A0', marginBottom: '12px', flexWrap: 'wrap' },
  itemsPreview: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' },
  itemChip:   { background: '#F0EDE4', color: '#7A7264', fontSize: '11px', padding: '3px 10px', borderRadius: '999px' },
  orderActions: { display: 'flex', gap: '8px', borderTop: '1px dashed #E9E3D6', paddingTop: '14px', alignItems: 'center' },
  actionGreen:{ background: '#F0F7EE', color: '#3F7D33', border: '1px solid #CFE3C6' },
  actionBlue: { background: '#EDF1F5', color: '#3B5170', border: '1px solid #CBD8E3' },
  actionRed:  { background: '#FBEEEB', color: '#B33F2C', border: '1px solid #EBC7BC' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default PurchaseOrders;