import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_COLORS = {
  available: { bg: '#F0F7EE', color: '#3F7D33', label: 'Available' },
  occupied:  { bg: '#FBF3E6', color: '#A97E44', label: 'Occupied'  },
  reserved:  { bg: '#EDF1F5', color: '#3B5170', label: 'Reserved'  },
  cleaning:  { bg: '#F5EEF3', color: '#7A4B6B', label: 'Cleaning'  },
};

const Tables = () => {
  const navigate = useNavigate();

  const [grouped,  setGrouped]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState({ type: '', text: '' });

  // Create single table form
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ table_number: '', section: 'Main Hall', capacity: 4 });

  // Bulk create form
  const [showBulk, setShowBulk] = useState(false);
  const [bulk,     setBulk]     = useState({ prefix: 'T', from_number: 1, to_number: 10, section: 'Main Hall', capacity: 4 });

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tables');
      setGrouped(res.data.data.grouped || {});
    } catch (err) {
      console.error('Tables fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // Create single table
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tables', form);
      showMsg('success', `Table ${form.table_number} created!`);
      setForm({ table_number: '', section: 'Main Hall', capacity: 4 });
      setShowForm(false);
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not create table');
    }
  };

  // Bulk create
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tables/bulk', {
        ...bulk,
        from_number: Number(bulk.from_number),
        to_number:   Number(bulk.to_number),
        capacity:    Number(bulk.capacity),
      });
      const d = res.data.data;
      showMsg('success', `${d.created} tables created!`);
      setShowBulk(false);
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Bulk create failed');
    }
  };

  // Status change
  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tables/${id}/status`, { status });
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not update status');
    }
  };

  // Delete
  const handleDelete = async (id, table_number) => {
    if (!window.confirm(`Delete table ${table_number}?`)) return;
    try {
      await api.delete(`/tables/${id}`);
      showMsg('success', `Table ${table_number} deleted`);
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete table');
    }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rtbl-outline-btn {
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
      .rtbl-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rtbl-primary-btn {
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
      .rtbl-primary-btn:hover { background: #A97E44; }

      .rtbl-input {
        font-family: 'JetBrains Mono', monospace;
        border: none;
        border-bottom: 2px solid #D8D1C2;
        background: transparent;
        padding: 8px 2px;
        font-size: 13.5px;
        color: #1A1815;
        outline: none;
        transition: border-color 0.15s ease;
      }
      .rtbl-input:focus { border-bottom-color: #A97E44; }

      .rtbl-select {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 7px 8px;
        font-size: 12.5px;
        color: #1A1815;
        background: #FFFFFF;
        outline: none;
        margin-bottom: 10px;
        cursor: pointer;
      }
      .rtbl-select:focus { border-color: #A97E44; }

      .rtbl-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 7px;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rtbl-delete-btn:hover { background: #F6DFD9; }

      .rtbl-table-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rtbl-table-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      @media (max-width: 640px) {
        .rtbl-top-bar { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rtbl-header-btns { width: 100%; }
        .rtbl-header-btns button { flex: 1; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING…
        </p>
      </div>
    );
  }

  const allSections = Object.keys(grouped);

  return (
    <div style={styles.page}>
      <GlobalStyle />

      {/* Header */}
      <div className="rtbl-top-bar" style={styles.topBar}>
        <div>
          <span style={styles.eyebrow}>FLOOR PLAN</span>
          <h1 style={styles.title}>Tables Management</h1>
        </div>
        <div className="rtbl-header-btns" style={styles.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rtbl-outline-btn">← Dashboard</button>
          <button onClick={() => { setShowBulk(true); setShowForm(false); }} className="rtbl-outline-btn">+ Bulk Add</button>
          <button onClick={() => { setShowForm(true); setShowBulk(false); }} className="rtbl-primary-btn">+ Add Table</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...styles.msg, ...(msg.type === 'success' ? styles.msgSuccess : styles.msgError) }}>
          {msg.text}
        </div>
      )}

      {/* Single Create Form */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.perforation} />
          <h3 style={styles.formTitle}>Add New Table</h3>
          <form onSubmit={handleCreate} style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Table Number *</label>
              <input value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })}
                placeholder="T1" className="rtbl-input" required />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Section</label>
              <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                placeholder="Main Hall" className="rtbl-input" />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Capacity</label>
              <input type="number" value={form.capacity} min={1}
                onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} className="rtbl-input" />
            </div>
            <div style={styles.formActions}>
              <button type="submit" className="rtbl-primary-btn">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="rtbl-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Create Form */}
      {showBulk && (
        <div style={styles.formCard}>
          <div style={styles.perforation} />
          <h3 style={styles.formTitle}>Add Tables in Bulk</h3>
          <p style={styles.hint}>Example: Prefix=T, From=1, To=10 → T1, T2... T10</p>
          <form onSubmit={handleBulkCreate} style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Prefix</label>
              <input value={bulk.prefix} onChange={e => setBulk({ ...bulk, prefix: e.target.value })}
                placeholder="T" className="rtbl-input" />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>From</label>
              <input type="number" value={bulk.from_number} min={1}
                onChange={e => setBulk({ ...bulk, from_number: e.target.value })} className="rtbl-input" />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>To</label>
              <input type="number" value={bulk.to_number} min={1}
                onChange={e => setBulk({ ...bulk, to_number: e.target.value })} className="rtbl-input" />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Section</label>
              <input value={bulk.section} onChange={e => setBulk({ ...bulk, section: e.target.value })}
                className="rtbl-input" />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Capacity</label>
              <input type="number" value={bulk.capacity} min={1}
                onChange={e => setBulk({ ...bulk, capacity: e.target.value })} className="rtbl-input" />
            </div>
            <div style={styles.formActions}>
              <button type="submit" className="rtbl-primary-btn">Create</button>
              <button type="button" onClick={() => setShowBulk(false)} className="rtbl-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tables Section Wise */}
      {allSections.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ margin: '0 0 6px', color: '#1A1815', fontSize: '14px' }}>No tables yet.</p>
          <p style={{ color: '#B9B0A0', fontSize: '13px', margin: 0 }}>
            Use "+ Add Table" or "+ Bulk Add" above to create tables.
          </p>
        </div>
      ) : (
        allSections.map(section => (
          <div key={section} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section}</h2>
            <div style={styles.tablesGrid}>
              {grouped[section].map(table => {
                const s = STATUS_COLORS[table.status] || STATUS_COLORS.available;
                return (
                  <div key={table.id} className="rtbl-table-card" style={styles.tableCard}>
                    <div style={styles.tableClip} />
                    <div style={styles.tableTop}>
                      <span style={styles.tableNumber}>{table.table_number}</span>
                      <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <p style={styles.tableCapacity}>👥 {table.capacity} seats</p>

                    {/* Status change */}
                    <select
                      value={table.status}
                      onChange={e => handleStatusChange(table.id, e.target.value)}
                      className="rtbl-select"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="cleaning">Cleaning</option>
                    </select>

                    <button
                      onClick={() => handleDelete(table.id, table.table_number)}
                      className="rtbl-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  page:     { padding: '32px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },

  topBar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  eyebrow:     { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
  title:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  headerBtns:  { display: 'flex', gap: '10px' },

  msg:        { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '18px' },
  msgSuccess: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgError:   { background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  formCard:    { background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '22px', marginBottom: '22px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', margin: '0 0 14px', color: '#1A1815' },
  formRow:     { display: 'flex', gap: '18px', alignItems: 'flex-end', flexWrap: 'wrap' },
  formField:   { display: 'flex', flexDirection: 'column', minWidth: '130px' },
  formActions: { display: 'flex', gap: '10px', alignItems: 'center', paddingTop: '18px' },
  label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '8px' },
  hint:        { fontSize: '12px', color: '#B9B0A0', margin: '0 0 14px' },

  section:      { marginBottom: '30px' },
  sectionTitle: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.02em',
    color: '#1A1815', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px dashed #D8D1C2'
  },
  tablesGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' },

  tableCard:     { background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E3D6', padding: '16px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  tableClip:     { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  tableTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  tableNumber:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.02em', color: '#1A1815' },
  badge:         { fontSize: '10px', fontWeight: '700', letterSpacing: '0.04em', padding: '3px 9px', borderRadius: '999px', textTransform: 'uppercase' },
  tableCapacity: { fontSize: '12.5px', color: '#7A7264', margin: '0 0 12px' },

  emptyState: { textAlign: 'center', padding: '70px 20px' },
};

export default Tables;