import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STATUS_COLORS = {
  available: { bg: '#f0fdf4', color: '#16a34a', label: 'Available' },
  occupied:  { bg: '#fef3c7', color: '#d97706', label: 'Occupied'  },
  reserved:  { bg: '#eff6ff', color: '#2563eb', label: 'Reserved'  },
  cleaning:  { bg: '#fdf4ff', color: '#9333ea', label: 'Cleaning'  },
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
      showMsg('success', `Table ${form.table_number} create ho gaya!`);
      setForm({ table_number: '', section: 'Main Hall', capacity: 4 });
      setShowForm(false);
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Create nahi hua');
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
      showMsg('success', `${d.created} tables create ho gaye!`);
      setShowBulk(false);
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Bulk not created');
    }
  };

  // Status change
  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tables/${id}/status`, { status });
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Status change nahi hua');
    }
  };

  // Delete
  const handleDelete = async (id, table_number) => {
    if (!window.confirm(`Table ${table_number} delete karna chahte ho?`)) return;
    try {
      await api.delete(`/tables/${id}`);
      showMsg('success', `Table ${table_number} delete ho gayi`);
      fetchTables();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Delete nahi hua');
    }
  };

  if (loading) return <div style={styles.centered}><p>Load ho raha hai...</p></div>;

  const allSections = Object.keys(grouped);

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.topBar}>
        <h1 style={styles.title}>Tables Management</h1>
        <div style={styles.headerBtns}>
          <button onClick={() => navigate('/dashboard')} style={styles.outlineBtn}>← Dashboard</button>
          <button onClick={() => { setShowBulk(true); setShowForm(false); }} style={styles.outlineBtn}>+ Bulk Add</button>
          <button onClick={() => { setShowForm(true); setShowBulk(false); }} style={styles.primaryBtn}>+ Table Add</button>
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
          <h3 style={styles.formTitle}>Naya Table Add Karo</h3>
          <form onSubmit={handleCreate} style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Table Number *</label>
              <input value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })}
                placeholder="T1" style={styles.input} required />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Section</label>
              <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                placeholder="Main Hall" style={styles.input} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Capacity</label>
              <input type="number" value={form.capacity} min={1}
                onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} style={styles.input} />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryBtn}>Create</button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.outlineBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Create Form */}
      {showBulk && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Bulk Tables Add Karo</h3>
          <p style={styles.hint}>Example: Prefix=T, From=1, To=10 → T1, T2... T10</p>
          <form onSubmit={handleBulkCreate} style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Prefix</label>
              <input value={bulk.prefix} onChange={e => setBulk({ ...bulk, prefix: e.target.value })}
                placeholder="T" style={styles.input} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>From</label>
              <input type="number" value={bulk.from_number} min={1}
                onChange={e => setBulk({ ...bulk, from_number: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>To</label>
              <input type="number" value={bulk.to_number} min={1}
                onChange={e => setBulk({ ...bulk, to_number: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Section</label>
              <input value={bulk.section} onChange={e => setBulk({ ...bulk, section: e.target.value })}
                style={styles.input} />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Capacity</label>
              <input type="number" value={bulk.capacity} min={1}
                onChange={e => setBulk({ ...bulk, capacity: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryBtn}>Create</button>
              <button type="button" onClick={() => setShowBulk(false)} style={styles.outlineBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tables Section Wise */}
      {allSections.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Abhi koi table nahi hai.</p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Upar "+ Table Add" ya "+ Bulk Add" se tables banao.</p>
        </div>
      ) : (
        allSections.map(section => (
          <div key={section} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section}</h2>
            <div style={styles.tablesGrid}>
              {grouped[section].map(table => {
                const s = STATUS_COLORS[table.status] || STATUS_COLORS.available;
                return (
                  <div key={table.id} style={styles.tableCard}>
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
                      style={styles.select}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="cleaning">Cleaning</option>
                    </select>

                    <button
                      onClick={() => handleDelete(table.id, table.table_number)}
                      style={styles.deleteBtn}
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
  page:          { padding: '24px', background: '#f8fafc', minHeight: '100vh' },
  centered:      { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  topBar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title:         { fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '0' },
  headerBtns:    { display: 'flex', gap: '8px' },
  primaryBtn:    { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  outlineBtn:    { background: '#fff', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', cursor: 'pointer' },
  msg:           { padding: '10px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  msgSuccess:    { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' },
  msgError:      { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' },
  formCard:      { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  formTitle:     { fontSize: '16px', fontWeight: '600', margin: '0 0 12px', color: '#1e293b' },
  formRow:       { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' },
  formField:     { display: 'flex', flexDirection: 'column', minWidth: '130px' },
  formActions:   { display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '20px' },
  label:         { fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' },
  input:         { border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none' },
  hint:          { fontSize: '13px', color: '#9ca3af', margin: '0 0 12px' },
  section:       { marginBottom: '28px' },
  sectionTitle:  { fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' },
  tablesGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' },
  tableCard:     { background: '#fff', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  tableTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  tableNumber:   { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  badge:         { fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '999px' },
  tableCapacity: { fontSize: '13px', color: '#64748b', margin: '0 0 10px' },
  select:        { width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', marginBottom: '8px', outline: 'none' },
  deleteBtn:     { width: '100%', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px', fontSize: '12px', cursor: 'pointer' },
  emptyState:    { textAlign: 'center', padding: '60px 20px', color: '#475569' },
};

export default Tables;