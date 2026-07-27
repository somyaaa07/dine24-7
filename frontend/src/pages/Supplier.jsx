import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'net_7',     label: 'Net 7 days' },
  { value: 'net_15',    label: 'Net 15 days' },
  { value: 'net_30',    label: 'Net 30 days' },
];

const EMPTY_FORM = {
  name: '', contact_person: '', phone: '',
  email: '', address: '', payment_terms: 'immediate'
};

const Suppliers = () => {
  const navigate = useNavigate();

  const [suppliers,  setSuppliers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState({ type: '', text: '' });
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [search,     setSearch]     = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/supplier');
      setSuppliers(res.data.data);
    } catch (err) {
      console.error('Suppliers fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
await api.put(`/supplier/${editingId}`, form);
        showMsg('success', 'Supplier updated!');
      } else {
await api.post('/supplier', form);
        showMsg('success', 'Supplier added!');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchSuppliers();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save');
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setForm({
      name:           supplier.name,
      contact_person: supplier.contact_person || '',
      phone:          supplier.phone          || '',
      email:          supplier.email          || '',
      address:        supplier.address        || '',
      payment_terms:  supplier.payment_terms
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
await api.delete(`/supplier/${id}`);
      showMsg('success', `"${name}" deleted`);
      fetchSuppliers();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete');
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_person || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  );

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rsup-outline-btn {
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
      .rsup-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rsup-primary-btn {
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
      .rsup-primary-btn:hover { background: #A97E44; }

      .rsup-search {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 11px 16px;
        font-size: 13px;
        color: #1A1815;
        outline: none;
        box-sizing: border-box;
        margin-bottom: 22px;
        transition: border-color 0.15s ease;
      }
      .rsup-search:focus { border-color: #A97E44; }
      .rsup-search::placeholder { color: #B9B0A0; }

      .rsup-input, select.rsup-input {
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
      .rsup-input:focus { border-color: #A97E44; }
      select.rsup-input { cursor: pointer; }
      .rsup-input::placeholder { color: #B9B0A0; }

      .rsup-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rsup-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rsup-edit-btn {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        background: #F0EDE4;
        color: #1A1815;
        border: none;
        border-radius: 4px;
        padding: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rsup-edit-btn:hover { background: #EDE7DA; }

      .rsup-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rsup-delete-btn:hover { background: #F6DFD9; }

      @media (max-width: 640px) {
        .rsup-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rsup-form-grid { grid-template-columns: 1fr !important; }
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
      <div className="rsup-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>SUPPLY CHAIN</span>
          <h1 style={s.title}>Suppliers</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rsup-outline-btn">← Dashboard</button>
          <button onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }} className="rsup-primary-btn">+ Add Supplier</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by supplier name or phone..."
        className="rsup-search"
      />

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>
            {editingId ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="rsup-form-grid" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Supplier Name *</label>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Fresh Farms" className="rsup-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Contact Person</label>
                <input value={form.contact_person}
                  onChange={e => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="Ramesh Kumar" className="rsup-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone</label>
                <input value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210" className="rsup-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="supplier@email.com" className="rsup-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Payment Terms</label>
                <select value={form.payment_terms}
                  onChange={e => setForm({ ...form, payment_terms: e.target.value })}
                  className="rsup-input">
                  {PAYMENT_TERMS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Address</label>
                <input value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Supplier's address" className="rsup-input" />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" className="rsup-primary-btn">
                {editingId ? 'Update' : 'Add'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="rsup-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers List */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>
            {search ? 'No suppliers found' : 'No suppliers yet — add one above'}
          </p>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map(supplier => (
            <div key={supplier.id} className="rsup-card" style={s.card}>
              <div style={s.cardClip} />
              <div style={s.cardTop}>
                <div>
                  <h3 style={s.supplierName}>{supplier.name}</h3>
                  {supplier.contact_person && (
                    <p style={s.contactPerson}>👤 {supplier.contact_person}</p>
                  )}
                </div>
                <span style={s.termsBadge}>
                  {PAYMENT_TERMS.find(p => p.value === supplier.payment_terms)?.label}
                </span>
              </div>

              <div style={s.cardInfo}>
                {supplier.phone && (
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>📞 Phone</span>
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>✉️ Email</span>
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div style={s.infoRow}>
                    <span style={s.infoLabel}>📍 Address</span>
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>

              <div style={s.cardActions}>
                <button onClick={() => handleEdit(supplier)} className="rsup-edit-btn">Edit</button>
                <button onClick={() => handleDelete(supplier.id, supplier.name)}
                  className="rsup-delete-btn">Delete</button>
              </div>
            </div>
          ))}
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

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  cardClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  cardTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  supplierName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', color: '#1A1815', margin: '0 0 4px' },
  contactPerson:{ fontSize: '12.5px', color: '#7A7264', margin: 0 },
  termsBadge: { background: '#EDF1F5', color: '#3B5170', fontSize: '10.5px', padding: '3px 10px', borderRadius: '999px', fontWeight: '700', whiteSpace: 'nowrap' },
  cardInfo:   { borderTop: '1px dashed #E9E3D6', paddingTop: '12px', marginBottom: '14px' },
  infoRow:    { display: 'flex', gap: '8px', fontSize: '12.5px', color: '#1A1815', marginBottom: '7px' },
  infoLabel:  { color: '#B9B0A0', minWidth: '80px' },
  cardActions:{ display: 'flex', gap: '8px', borderTop: '1px dashed #E9E3D6', paddingTop: '14px' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default Suppliers;