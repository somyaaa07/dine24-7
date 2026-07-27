import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const UNITS = ['kg', 'g', 'litre', 'ml', 'pieces', 'dozen', 'packet'];
const CATEGORIES = ['Meat', 'Dairy', 'Vegetables', 'Spices', 'Grains', 'Beverages', 'Other'];

const EMPTY_ITEM = {
  name: '', category: '', unit: 'kg',
  current_quantity: 0, minimum_threshold: 0, purchase_price: 0
};

const Inventory = () => {
  const navigate = useNavigate();

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState({ type: '', text: '' });
  const [activeTab,   setActiveTab]   = useState('all');

  // Forms
  const [showItemForm, setShowItemForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingItem,  setEditingItem]  = useState(null);
  const [stockAction,  setStockAction]  = useState(null); // { item, type }

  const [itemForm,  setItemForm]  = useState(EMPTY_ITEM);
  const [stockForm, setStockForm] = useState({ quantity: '', note: '' });
  const [adjustForm, setAdjustForm] = useState({ new_quantity: '', note: '' });

  // ── Fetch ────────────────────────────────────────────────
  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = activeTab === 'low_stock'
        ? '/inventory/low-stock'
        : '/inventory';
      const res = await api.get(url);
      setItems(res.data.data);
    } catch (err) {
      console.error('Inventory fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeTab]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // ── Item CRUD ────────────────────────────────────────────
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, itemForm);
        showMsg('success', 'Item updated!');
      } else {
        await api.post('/inventory', itemForm);
        showMsg('success', 'Item added!');
      }
      setItemForm(EMPTY_ITEM);
      setEditingItem(null);
      setShowItemForm(false);
      fetchItems();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name:              item.name,
      category:          item.category          || '',
      unit:              item.unit,
      current_quantity:  item.current_quantity,
      minimum_threshold: item.minimum_threshold,
      purchase_price:    item.purchase_price
    });
    setShowItemForm(true);
    setShowStockForm(false);
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/inventory/${id}`);
      showMsg('success', `"${name}" deleted`);
      fetchItems();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete');
    }
  };

  // ── Stock Actions ────────────────────────────────────────
  const openStockAction = (item, type) => {
    setStockAction({ item, type });
    setStockForm({ quantity: '', note: '' });
    setAdjustForm({ new_quantity: item.current_quantity, note: '' });
    setShowStockForm(true);
    setShowItemForm(false);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    const { item, type } = stockAction;
    try {
      if (type === 'adjustment') {
        await api.post(`/inventory/${item.id}/adjustment`, adjustForm);
      } else if (type === 'stock_in') {
        await api.post(`/inventory/${item.id}/stock-in`, stockForm);
      } else if (type === 'stock_out') {
        await api.post(`/inventory/${item.id}/stock-out`, stockForm);
      }
      showMsg('success', 'Stock updated!');
      setShowStockForm(false);
      setStockAction(null);
      fetchItems();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not update stock');
    }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rinv-outline-btn {
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
      .rinv-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rinv-primary-btn {
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
      .rinv-primary-btn:hover { background: #A97E44; }

      .rinv-tab {
        font-family: 'JetBrains Mono', monospace;
        padding: 10px 18px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #7A7264;
        margin-bottom: -1px;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .rinv-tab:hover { color: #1A1815; }
      .rinv-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rinv-input, select.rinv-input {
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
      .rinv-input:focus { border-color: #A97E44; }
      select.rinv-input { cursor: pointer; }
      .rinv-input::placeholder { color: #B9B0A0; }

      .rinv-row:hover { background: #FBF9F4; }

      .rinv-act {
        font-family: 'JetBrains Mono', monospace;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rinv-act:hover { opacity: 0.8; }

      @media (max-width: 860px) {
        .rinv-form-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 560px) {
        .rinv-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rinv-form-grid { grid-template-columns: 1fr !important; }
        .rinv-table-wrap { overflow-x: auto; }
      }
    `}</style>
  );

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING INVENTORY…
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <GlobalStyle />

      {/* Header */}
      <div className="rinv-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>STOREROOM</span>
          <h1 style={s.title}>Inventory Management</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rinv-outline-btn">← Dashboard</button>
          <button onClick={() => {
            setEditingItem(null);
            setItemForm(EMPTY_ITEM);
            setShowItemForm(true);
            setShowStockForm(false);
          }} className="rinv-primary-btn">
            + Add Item
          </button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { id: 'all',       label: 'All Items' },
          { id: 'low_stock', label: '⚠️ Low Stock' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rinv-tab ${activeTab === tab.id ? 'rinv-tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Item Form */}
      {showItemForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <form onSubmit={handleItemSubmit}>
            <div className="rinv-form-grid" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Item Name *</label>
                <input value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Chicken, Oil, Flour..."
                  className="rinv-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Category</label>
                <select value={itemForm.category}
                  onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                  className="rinv-input">
                  <option value="">-- Select --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Unit *</label>
                <select value={itemForm.unit}
                  onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                  className="rinv-input">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Current Stock</label>
                <input type="number" min={0} step={0.001}
                  value={itemForm.current_quantity}
                  onChange={e => setItemForm({ ...itemForm, current_quantity: e.target.value })}
                  className="rinv-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Min. Threshold</label>
                <input type="number" min={0} step={0.001}
                  value={itemForm.minimum_threshold}
                  onChange={e => setItemForm({ ...itemForm, minimum_threshold: e.target.value })}
                  placeholder="Alert threshold"
                  className="rinv-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Purchase Price (₹/unit)</label>
                <input type="number" min={0} step={0.01}
                  value={itemForm.purchase_price}
                  onChange={e => setItemForm({ ...itemForm, purchase_price: e.target.value })}
                  className="rinv-input" />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" className="rinv-primary-btn">
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button type="button"
                onClick={() => { setShowItemForm(false); setEditingItem(null); }}
                className="rinv-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Form */}
      {showStockForm && stockAction && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>
            {stockAction.type === 'stock_in'    && `📦 Stock In — ${stockAction.item.name}`}
            {stockAction.type === 'stock_out'   && `📤 Stock Out — ${stockAction.item.name}`}
            {stockAction.type === 'adjustment'  && `🔧 Adjustment — ${stockAction.item.name}`}
          </h3>
          <p style={{ fontSize: '12.5px', color: '#7A7264', margin: '0 0 18px' }}>
            Current Stock: <strong style={{ color: '#1A1815' }}>{stockAction.item.current_quantity} {stockAction.item.unit}</strong>
          </p>
          <form onSubmit={handleStockSubmit}>
            {stockAction.type === 'adjustment' ? (
              <div className="rinv-form-grid" style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>New Quantity *</label>
                  <input type="number" min={0} step={0.001}
                    value={adjustForm.new_quantity}
                    onChange={e => setAdjustForm({ ...adjustForm, new_quantity: e.target.value })}
                    className="rinv-input" required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Note</label>
                  <input value={adjustForm.note}
                    onChange={e => setAdjustForm({ ...adjustForm, note: e.target.value })}
                    placeholder="Reason..."
                    className="rinv-input" />
                </div>
              </div>
            ) : (
              <div className="rinv-form-grid" style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>Quantity *</label>
                  <input type="number" min={0.001} step={0.001}
                    value={stockForm.quantity}
                    onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })}
                    className="rinv-input" required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Note</label>
                  <input value={stockForm.note}
                    onChange={e => setStockForm({ ...stockForm, note: e.target.value })}
                    placeholder="Optional..."
                    className="rinv-input" />
                </div>
              </div>
            )}
            <div style={s.formActions}>
              <button type="submit" className="rinv-primary-btn">Confirm</button>
              <button type="button"
                onClick={() => { setShowStockForm(false); setStockAction(null); }}
                className="rinv-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Items Table */}
      {items.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>
            {activeTab === 'low_stock' ? 'All stock levels are fine ✅' : 'No items yet — add one above'}
          </p>
        </div>
      ) : (
        <div className="rinv-table-wrap" style={s.tableWrap}>
          <div style={s.perforation} />
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>Item</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Min. Threshold</th>
                <th style={s.th}>Price/Unit</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isLow = parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold);
                return (
                  <tr key={item.id} className="rinv-row" style={s.tr}>
                    <td style={s.td}>
                      <div style={{ fontWeight: '700', color: '#1A1815' }}>{item.name}</div>
                    </td>
                    <td style={s.td}>
                      <span style={s.catBadge}>{item.category || '—'}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontWeight: '700', color: isLow ? '#B33F2C' : '#3F7D33' }}>
                        {item.current_quantity} {item.unit}
                      </span>
                    </td>
                    <td style={s.td}>
                      {item.minimum_threshold} {item.unit}
                    </td>
                    <td style={s.td}>₹{item.purchase_price}</td>
                    <td style={s.td}>
                      {isLow ? (
                        <span style={s.lowBadge}>⚠️ Low Stock</span>
                      ) : (
                        <span style={s.okBadge}>✅ OK</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button onClick={() => openStockAction(item, 'stock_in')}
                          className="rinv-act" style={s.actionGreen}>+ In</button>
                        <button onClick={() => openStockAction(item, 'stock_out')}
                          className="rinv-act" style={s.actionRed}>- Out</button>
                        <button onClick={() => openStockAction(item, 'adjustment')}
                          className="rinv-act" style={s.actionBlue}>Adjust</button>
                        <button onClick={() => handleEditItem(item)}
                          className="rinv-act" style={s.actionGray}>Edit</button>
                        <button onClick={() => handleDeleteItem(item.id, item.name)}
                          className="rinv-act" style={s.actionDel}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #E9E3D6' },

  formCard: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '22px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', margin: '0 0 16px', color: '#1A1815' },
  formGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' },
  formActions: { display: 'flex', gap: '10px', marginTop: '8px' },
  field:       { display: 'flex', flexDirection: 'column' },
  label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '7px' },

  tableWrap: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', overflow: 'hidden', position: 'relative' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  thead:     { background: '#FBF9F4' },
  th:        { padding: '12px 16px', textAlign: 'left', fontSize: '10.5px', fontWeight: '700', color: '#7A7264', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E9E3D6' },
  tr:        { borderBottom: '1px dashed #E9E3D6' },
  td:        { padding: '12px 16px', fontSize: '13px', color: '#1A1815' },
  catBadge:  { background: '#F0EDE4', color: '#7A7264', fontSize: '11px', fontWeight: '600', padding: '2px 9px', borderRadius: '999px' },
  lowBadge:  { background: '#FBEEEB', color: '#B33F2C', fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: '700' },
  okBadge:   { background: '#F0F7EE', color: '#3F7D33', fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: '700' },

  actions:     { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  actionGreen: { background: '#F0F7EE', color: '#3F7D33', border: '1px solid #CFE3C6' },
  actionRed:   { background: '#FBEEEB', color: '#B33F2C', border: '1px solid #EBC7BC' },
  actionBlue:  { background: '#EDF1F5', color: '#3B5170', border: '1px solid #CBD8E3' },
  actionGray:  { background: '#F0EDE4', color: '#1A1815', border: 'none' },
  actionDel:   { background: '#FBEEEB', color: '#B33F2C', border: '1px solid #EBC7BC' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default Inventory;