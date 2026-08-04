import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const EMPTY_FORM = {
  name: '', phone: '', email: '',
  birthday: '', anniversary: '', notes: ''
};

const Customers = () => {
  const navigate = useNavigate();

  const [customers,    setCustomers]    = useState([]);
  const [specialDates, setSpecialDates] = useState({ birthdays: [], anniversaries: [] });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [msg,          setMsg]          = useState({ type: '', text: '' });
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [showPoints,   setShowPoints]   = useState(null);
  const [pointsValue,  setPointsValue]  = useState('');

  const fetchCustomers = async (searchVal = '') => {
    try {
      const url = searchVal ? `/customers?search=${searchVal}` : '/customers';
      const res = await api.get(url);
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Customers fetch failed:', err);
    }
  };

  const fetchSpecialDates = async () => {
    try {
      const res = await api.get('/customers/special-dates');
      setSpecialDates(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCustomers(), fetchSpecialDates()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
        showMsg('success', 'Customer updated!');
      } else {
        await api.post('/customers', form);
        showMsg('success', 'Customer added!');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchCustomers(search);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save');
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      name:        customer.name,
      phone:       customer.phone       || '',
      email:       customer.email       || '',
      birthday:    customer.birthday    || '',
      anniversary: customer.anniversary || '',
      notes:       customer.notes       || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      showMsg('success', `"${name}" deleted`);
      fetchCustomers(search);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete');
    }
  };

  const handlePoints = async () => {
    if (!pointsValue || pointsValue <= 0) return showMsg('error', 'Enter valid points');
    try {
      const endpoint = showPoints.type === 'add'
        ? `/customers/${showPoints.customer.id}/loyalty/add`
        : `/customers/${showPoints.customer.id}/loyalty/redeem`;
      const res = await api.post(endpoint, { points: parseInt(pointsValue) });
      showMsg('success', res.data.message);
      setShowPoints(null);
      setPointsValue('');
      fetchCustomers(search);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not update points');
    }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rcust-outline-btn {
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
      .rcust-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rcust-primary-btn {
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
      .rcust-primary-btn:hover { background: #A97E44; }

      .rcust-search {
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
        margin-bottom: 18px;
        transition: border-color 0.15s ease;
      }
      .rcust-search:focus { border-color: #A97E44; }
      .rcust-search::placeholder { color: #B9B0A0; }

      .rcust-input, select.rcust-input {
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
      .rcust-input:focus { border-color: #A97E44; }
      .rcust-input::placeholder { color: #B9B0A0; }

      .rcust-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rcust-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rcust-points-add {
        font-family: 'JetBrains Mono', monospace;
        background: #F0F7EE;
        color: #3F7D33;
        border: 1px solid #CFE3C6;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rcust-points-add:hover { background: #E3F0DD; }

      .rcust-points-redeem {
        font-family: 'JetBrains Mono', monospace;
        background: #FBF3E6;
        color: #8B5F2A;
        border: 1px solid #E7CFA3;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rcust-points-redeem:hover { background: #F3E5C8; }

      .rcust-edit-btn {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        background: #F0EDE4;
        color: #1A1815;
        border: none;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rcust-edit-btn:hover { background: #EDE7DA; }

      .rcust-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rcust-delete-btn:hover { background: #F6DFD9; }

      @media (max-width: 640px) {
        .rcust-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rcust-form-grid { grid-template-columns: 1fr !important; }
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
      <div className="rcust-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>GUEST BOOK</span>
          <h1 style={s.title}>Customer CRM</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rcust-outline-btn">← Dashboard</button>
          <button onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }} className="rcust-primary-btn">+ Add Customer</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      {/* Special Dates Alert */}
      {(specialDates.birthdays.length > 0 || specialDates.anniversaries.length > 0) && (
        <div style={s.specialAlert}>
          🎉 Today's special occasions:
          {specialDates.birthdays.map(c => (
            <span key={c.id} style={s.specialChip}>🎂 {c.name}</span>
          ))}
          {specialDates.anniversaries.map(c => (
            <span key={c.id} style={s.specialChip}>💍 {c.name}</span>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, phone or email..."
        className="rcust-search"
      />

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>
            {editingId ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="rcust-form-grid" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Name *</label>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ramesh Kumar" className="rcust-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone</label>
                <input value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210" className="rcust-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="rcust-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Birthday</label>
                <input type="date" value={form.birthday}
                  onChange={e => setForm({ ...form, birthday: e.target.value })}
                  className="rcust-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Anniversary</label>
                <input type="date" value={form.anniversary}
                  onChange={e => setForm({ ...form, anniversary: e.target.value })}
                  className="rcust-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Notes</label>
                <input value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Vegetarian, allergy..." className="rcust-input" />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" className="rcust-primary-btn">
                {editingId ? 'Update' : 'Add'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="rcust-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Points Modal */}
      {showPoints && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.perforation} />
            <h3 style={s.modalTitle}>
              {showPoints.type === 'add' ? 'Add Points' : 'Redeem Points'}
            </h3>
            <p style={s.modalSubtitle}>
              {showPoints.customer.name} — Current: {showPoints.customer.loyalty_points} pts
            </p>
            <input
              type="number" min={1}
              value={pointsValue}
              onChange={e => setPointsValue(e.target.value)}
              placeholder="Enter points"
              className="rcust-input"
              style={{ marginBottom: '18px' }}
              autoFocus
            />
            <div style={s.formActions}>
              <button onClick={handlePoints} className="rcust-primary-btn">Confirm</button>
              <button onClick={() => { setShowPoints(null); setPointsValue(''); }}
                className="rcust-outline-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>
            {search ? 'No customers found' : 'No customers yet — add one above'}
          </p>
        </div>
      ) : (
        <div style={s.grid}>
          {customers.map(customer => (
            <div key={customer.id} className="rcust-card" style={s.card}>
              <div style={s.cardClip} />
              <div style={s.cardTop}>
                <div style={s.avatar}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div style={s.cardInfo}>
                  <h3 style={s.customerName}>{customer.name}</h3>
                  {customer.phone && <p style={s.customerDetail}>📞 {customer.phone}</p>}
                  {customer.email && <p style={s.customerDetail}>✉️ {customer.email}</p>}
                </div>
              </div>

              <div style={s.stats}>
                <div style={s.stat}>
                  <div style={s.statValue}>{customer.total_visits}</div>
                  <div style={s.statLabel}>Visits</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statValue}>₹{parseFloat(customer.total_spent || 0).toFixed(0)}</div>
                  <div style={s.statLabel}>Spent</div>
                </div>
                <div style={s.stat}>
                  <div style={{ ...s.statValue, color: '#A97E44' }}>{customer.loyalty_points}</div>
                  <div style={s.statLabel}>Points</div>
                </div>
              </div>

              {(customer.birthday || customer.anniversary) && (
                <div style={s.dates}>
                  {customer.birthday    && <span style={s.dateChip}>🎂 {customer.birthday}</span>}
                  {customer.anniversary && <span style={s.dateChip}>💍 {customer.anniversary}</span>}
                </div>
              )}

              {customer.notes && (
                <p style={s.notesText}>📝 {customer.notes}</p>
              )}

              <div style={s.actions}>
                <button onClick={() => setShowPoints({ customer, type: 'add' })}
                  className="rcust-points-add">+ Points</button>
                <button onClick={() => setShowPoints({ customer, type: 'redeem' })}
                  className="rcust-points-redeem">Redeem</button>
                <button onClick={() => handleEdit(customer)} className="rcust-edit-btn">Edit</button>
                <button onClick={() => handleDelete(customer.id, customer.name)}
                  className="rcust-delete-btn">Del</button>
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

  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  eyebrow:    { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
  title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  headerBtns: { display: 'flex', gap: '10px' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '16px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  specialAlert: { background: '#FBF3E6', border: '1px solid #E7CFA3', color: '#8B5F2A', padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  specialChip:  { background: '#F3E5C8', padding: '2px 10px', borderRadius: '999px', fontWeight: '700' },

  formCard: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '22px', marginBottom: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', margin: '0 0 16px', color: '#1A1815' },
  formGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' },
  formActions: { display: 'flex', gap: '10px' },
  field:       { display: 'flex', flexDirection: 'column' },
  label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '7px' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(26,24,21,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#FFFFFF', borderRadius: '6px', padding: '26px', width: '320px', position: 'relative' },
  modalTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', color: '#1A1815', margin: '0 0 6px' },
  modalSubtitle:{ fontSize: '12.5px', color: '#7A7264', margin: '0 0 16px' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  cardClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  cardTop:  { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' },
  avatar:   { width: '42px', height: '42px', borderRadius: '4px', background: '#A97E44', color: '#1A1815', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', flexShrink: 0 },
  cardInfo: { flex: 1 },
  customerName:   { fontSize: '14.5px', fontWeight: '700', color: '#1A1815', margin: '0 0 2px' },
  customerDetail: { fontSize: '11.5px', color: '#7A7264', margin: '2px 0' },

  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', background: '#FBF9F4', borderRadius: '4px', padding: '10px' },
  stat:  { textAlign: 'center' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.01em', color: '#1A1815' },
  statLabel: { fontSize: '10px', color: '#B9B0A0', textTransform: 'uppercase', letterSpacing: '0.04em' },

  dates:     { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' },
  dateChip:  { background: '#FBF3E6', border: '1px solid #E7CFA3', color: '#8B5F2A', fontSize: '10.5px', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' },
  notesText: { fontSize: '11.5px', color: '#7A7264', margin: '0 0 10px', fontStyle: 'italic' },
  actions:   { display: 'flex', gap: '6px', borderTop: '1px dashed #E9E3D6', paddingTop: '12px', flexWrap: 'wrap' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default Customers;