import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CATEGORIES = ['rent','electricity','water','gas','maintenance','marketing','salary','supplies','other'];
const EMPTY_FORM = { title:'', category:'other', amount:'', expense_date: new Date().toISOString().split('T')[0], payment_method:'cash', note:'' };

const CAT_COLORS = {
  rent:        { bg: '#EDF1F5', color: '#3B5170' },
  electricity: { bg: '#FBF3E6', color: '#8B5F2A' },
  water:       { bg: '#F0F7EE', color: '#3F7D33' },
  gas:         { bg: '#F5EEF3', color: '#7A4B6B' },
  maintenance: { bg: '#F0EDE4', color: '#7A7264' },
  marketing:   { bg: '#FBEEEB', color: '#B33F2C' },
  salary:      { bg: '#F0F7EE', color: '#3F7D33' },
  supplies:    { bg: '#EDF1F5', color: '#3B5170' },
  other:       { bg: '#F0EDE4', color: '#7A7264' },
};

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses,  setExpenses]  = useState([]);
  const [summary,   setSummary]   = useState({ summary:{}, total:0 });
  const [loading,   setLoading]   = useState(true);
  const [msg,       setMsg]       = useState({ type:'', text:'' });
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [month,     setMonth]     = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(new Date().getFullYear());
  const [catFilter, setCatFilter] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses?month=${month}&year=${year}${catFilter ? '&category='+catFilter : ''}`);
      setExpenses(res.data.data);
    } catch(e) { console.error(e); }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/expenses/summary?month=${month}&year=${year}`);
      setSummary(res.data.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => { await Promise.all([fetchExpenses(), fetchSummary()]); setLoading(false); };
    load();
  }, []);

  useEffect(() => { fetchExpenses(); fetchSummary(); }, [month, year, catFilter]);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:'', text:'' }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/expenses/${editingId}`, form); showMsg('success','Updated!'); }
      else { await api.post('/expenses', form); showMsg('success','Expense added!'); }
      setForm(EMPTY_FORM); setEditingId(null); setShowForm(false);
      fetchExpenses(); fetchSummary();
    } catch(err) { showMsg('error', err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setForm({ title: exp.title, category: exp.category, amount: exp.amount, expense_date: exp.expense_date, payment_method: exp.payment_method, note: exp.note || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); showMsg('success','Deleted!'); fetchExpenses(); fetchSummary(); }
    catch(err) { showMsg('error','Failed'); }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rexp-outline-btn {
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
      .rexp-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rexp-primary-btn {
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
      .rexp-primary-btn:hover { background: #A97E44; }

      .rexp-filter-select, .rexp-filter-input {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12.5px;
        color: #1A1815;
        outline: none;
        background: #FFFFFF;
        transition: border-color 0.15s ease;
      }
      .rexp-filter-select:focus, .rexp-filter-input:focus { border-color: #A97E44; }
      .rexp-filter-select { cursor: pointer; }

      .rexp-input, select.rexp-input {
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
      .rexp-input:focus { border-color: #A97E44; }
      select.rexp-input { cursor: pointer; }

      .rexp-cat-card { transition: transform 0.15s ease; }
      .rexp-cat-card:hover { transform: translateY(-2px); }

      .rexp-edit-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #EDF1F5;
        color: #3B5170;
        border: none;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rexp-edit-btn:hover { background: #E0E7EE; }

      .rexp-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rexp-delete-btn:hover { background: #F6DFD9; }

      .rexp-row:hover { background: #FBF9F4; }

      @media (max-width: 860px) {
        .rexp-form-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 640px) {
        .rexp-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rexp-form-grid { grid-template-columns: 1fr !important; }
        .rexp-table-wrap { overflow-x: auto; }
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

      <div className="rexp-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>LEDGER</span>
          <h1 style={s.title}>Expenses</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rexp-outline-btn">← Dashboard</button>
          <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }} className="rexp-primary-btn">+ Add Expense</button>
        </div>
      </div>

      {msg.text && <div style={{ ...s.msg, ...(msg.type==='success'?s.msgOk:s.msgErr) }}>{msg.text}</div>}

      {/* Filters */}
      <div style={s.filters}>
        <select value={month} onChange={e => setMonth(e.target.value)} className="rexp-filter-select">
          {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en',{month:'long'})}</option>)}
        </select>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} className="rexp-filter-input" style={{ width:'90px' }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="rexp-filter-select">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={s.summaryGrid}>
        <div style={s.totalCard}>
          <p style={s.totalLabel}>Total Expenses</p>
          <p style={s.totalValue}>₹{parseFloat(summary.total || 0).toLocaleString()}</p>
        </div>
        {Object.entries(summary.summary || {}).map(([cat, amt]) => (
          <div key={cat} className="rexp-cat-card" style={{ ...s.catCard, background: CAT_COLORS[cat]?.bg || '#F0EDE4' }}>
            <p style={{ ...s.catLabel, color: CAT_COLORS[cat]?.color || '#7A7264' }}>{cat}</p>
            <p style={s.catValue}>₹{parseFloat(amt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="rexp-form-grid" style={s.formGrid}>
              <div style={s.field}><label style={s.label}>Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rexp-input" required /></div>
              <div style={s.field}><label style={s.label}>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="rexp-input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div style={s.field}><label style={s.label}>Amount (₹) *</label>
                <input type="number" min={0} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="rexp-input" required /></div>
              <div style={s.field}><label style={s.label}>Date *</label>
                <input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} className="rexp-input" required /></div>
              <div style={s.field}><label style={s.label}>Payment Method</label>
                <select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})} className="rexp-input">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option></select></div>
              <div style={s.field}><label style={s.label}>Note</label>
                <input value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="rexp-input" /></div>
            </div>
            <div style={s.formActions}>
              <button type="submit" className="rexp-primary-btn">{editingId ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rexp-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <div style={s.emptyState}><p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>No expenses this month</p></div>
      ) : (
        <div className="rexp-table-wrap" style={s.tableWrap}>
          <div style={s.perforation} />
          <table style={s.table}>
            <thead><tr style={s.thead}>
              <th style={s.th}>Title</th><th style={s.th}>Category</th>
              <th style={s.th}>Amount</th><th style={s.th}>Date</th>
              <th style={s.th}>Payment</th><th style={s.th}>Actions</th>
            </tr></thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} className="rexp-row" style={s.tr}>
                  <td style={s.td}>
                    <div style={{ fontWeight: '700', color: '#1A1815' }}>{exp.title}</div>
                    {exp.note && <div style={{ fontSize:'11.5px', color:'#B9B0A0', marginTop: '2px' }}>{exp.note}</div>}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.catBadge,
                      background: CAT_COLORS[exp.category]?.bg || '#F0EDE4',
                      color: CAT_COLORS[exp.category]?.color || '#7A7264'
                    }}>{exp.category}</span>
                  </td>
                  <td style={s.td}><strong style={{ color: '#1A1815' }}>₹{parseFloat(exp.amount).toLocaleString()}</strong></td>
                  <td style={s.td}>{exp.expense_date}</td>
                  <td style={s.td}>{exp.payment_method}</td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => handleEdit(exp)} className="rexp-edit-btn">Edit</button>
                      <button onClick={() => handleDelete(exp.id)} className="rexp-delete-btn">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { padding:'32px', background:'#F7F5F0', minHeight:'100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F7F5F0' },

  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  eyebrow: { display:'inline-block', fontSize:'11px', fontWeight:'700', letterSpacing:'0.14em', color:'#A97E44', marginBottom:'6px' },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'28px', letterSpacing:'0.01em', color:'#1A1815', margin:0 },
  headerBtns: { display:'flex', gap:'10px' },

  msg: { padding:'10px 16px', borderRadius:'4px', fontSize:'12.5px', fontWeight:'500', marginBottom:'16px' },
  msgOk: { background:'#F0F7EE', border:'1px solid #CFE3C6', color:'#3F7D33' },
  msgErr: { background:'#FBEEEB', border:'1px solid #EBC7BC', color:'#B33F2C' },

  filters: { display:'flex', gap:'10px', marginBottom:'18px', flexWrap:'wrap' },

  summaryGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'12px', marginBottom:'22px' },
  totalCard: { background:'#1A1815', borderRadius:'6px', padding:'16px', color:'#F7F5F0' },
  totalLabel: { fontSize:'10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color:'#B9B0A0', margin:'0 0 8px' },
  totalValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'26px', letterSpacing: '0.01em', margin:0 },
  catCard: { borderRadius:'6px', padding:'14px' },
  catLabel: { fontSize:'10.5px', fontWeight: '700', letterSpacing: '0.06em', margin:'0 0 6px', textTransform:'uppercase' },
  catValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'19px', letterSpacing: '0.01em', color:'#1A1815', margin:0 },

  formCard: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'22px', marginBottom:'18px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'19px', letterSpacing:'0.01em', margin:'0 0 16px', color:'#1A1815' },
  formGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'14px' },
  formActions: { display:'flex', gap:'10px' },
  field: { display:'flex', flexDirection:'column' },
  label: { fontSize:'10.5px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', color:'#7A7264', marginBottom:'7px' },

  tableWrap: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', overflow:'hidden', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#FBF9F4' },
  th: { padding:'12px 16px', textAlign:'left', fontSize:'10.5px', fontWeight:'700', color:'#7A7264', textTransform:'uppercase', letterSpacing: '0.06em', borderBottom:'1px solid #E9E3D6' },
  tr: { borderBottom:'1px dashed #E9E3D6' },
  td: { padding:'12px 16px', fontSize:'13px', color:'#1A1815' },
  catBadge: { fontSize:'10.5px', padding:'3px 10px', borderRadius:'999px', fontWeight:'700', textTransform:'capitalize' },
  emptyState: { textAlign:'center', padding:'60px 20px', background:'#FFFFFF', border: '1px dashed #E9E3D6', borderRadius:'6px' },
};

export default Expenses;