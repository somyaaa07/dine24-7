// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';

// const STATUS_CONFIG = {
//   pending:   { bg: '#FBF3E6', color: '#8B5F2A', label: 'Pending' },
//   confirmed: { bg: '#EDF1F5', color: '#3B5170', label: 'Confirmed' },
//   seated:    { bg: '#F0F7EE', color: '#3F7D33', label: 'Seated' },
//   completed: { bg: '#F0EDE4', color: '#7A7264', label: 'Completed' },
//   cancelled: { bg: '#FBEEEB', color: '#B33F2C', label: 'Cancelled' },
//   no_show:   { bg: '#F5EEF3', color: '#7A4B6B', label: 'No Show' },
// };

// const EMPTY_FORM = {
//   customer_name: '', customer_phone: '', table_id: '',
//   reservation_date: '', reservation_time: '',
//   guests: 2, special_requests: '', notes: ''
// };

// const Reservations = () => {
//   const navigate  = useNavigate();
//   const [reservations, setReservations] = useState([]);
//   const [tables,       setTables]       = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [msg,          setMsg]          = useState({ type: '', text: '' });
//   const [showForm,     setShowForm]     = useState(false);
//   const [editingId,    setEditingId]    = useState(null);
//   const [form,         setForm]         = useState(EMPTY_FORM);
//   const [dateFilter,   setDateFilter]   = useState('');
//   const [statusFilter, setStatusFilter] = useState('');

//   const fetchReservations = async () => {
//     try {
//       let url = '/reservations?';
//       if (dateFilter)   url += `date=${dateFilter}&`;
//       if (statusFilter) url += `status=${statusFilter}`;
//       const res = await api.get(url);
//       setReservations(res.data.data);
//     } catch (err) { console.error(err); }
//   };

//   const fetchTables = async () => {
//     try {
//       const res = await api.get('/tables');
//       setTables(res.data.data.tables || []);
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => {
//     const load = async () => {
//       await Promise.all([fetchReservations(), fetchTables()]);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   useEffect(() => { fetchReservations(); }, [dateFilter, statusFilter]);

//   const showMsg = (type, text) => {
//     setMsg({ type, text });
//     setTimeout(() => setMsg({ type: '', text: '' }), 3000);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         await api.put(`/reservations/${editingId}`, form);
//         showMsg('success', 'Reservation updated!');
//       } else {
//         await api.post('/reservations', form);
//         showMsg('success', 'Reservation confirmed!');
//       }
//       setForm(EMPTY_FORM);
//       setEditingId(null);
//       setShowForm(false);
//       fetchReservations();
//     } catch (err) {
//       showMsg('error', err.response?.data?.message || 'Could not save');
//     }
//   };

//   const handleStatusUpdate = async (id, status) => {
//     try {
//       await api.put(`/reservations/${id}/status`, { status });
//       fetchReservations();
//     } catch (err) {
//       showMsg('error', 'Could not update status');
//     }
//   };

//   const handleEdit = (r) => {
//     setEditingId(r.id);
//     setForm({
//       customer_name:    r.customer_name,
//       customer_phone:   r.customer_phone,
//       table_id:         r.table_id         || '',
//       reservation_date: r.reservation_date,
//       reservation_time: r.reservation_time,
//       guests:           r.guests,
//       special_requests: r.special_requests || '',
//       notes:            r.notes            || ''
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this reservation?')) return;
//     try {
//       await api.delete(`/reservations/${id}`);
//       showMsg('success', 'Deleted!');
//       fetchReservations();
//     } catch (err) {
//       showMsg('error', 'Could not delete');
//     }
//   };

//   const GlobalStyle = () => (
//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

//       .rres-outline-btn {
//         font-family: 'JetBrains Mono', monospace;
//         background: #FFFFFF;
//         border: 1px solid #D8D1C2;
//         color: #1A1815;
//         border-radius: 4px;
//         padding: 9px 16px;
//         font-size: 12px;
//         font-weight: 600;
//         letter-spacing: 0.04em;
//         cursor: pointer;
//         transition: border-color 0.15s ease, background 0.15s ease;
//       }
//       .rres-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

//       .rres-primary-btn {
//         font-family: 'JetBrains Mono', monospace;
//         background: #1A1815;
//         color: #F7F5F0;
//         border: none;
//         border-radius: 4px;
//         padding: 9px 16px;
//         font-size: 12px;
//         font-weight: 700;
//         letter-spacing: 0.04em;
//         cursor: pointer;
//         transition: background 0.15s ease;
//       }
//       .rres-primary-btn:hover { background: #A97E44; }

//       .rres-filter-input, select.rres-filter-input {
//         font-family: 'JetBrains Mono', monospace;
//         border: 1px solid #D8D1C2;
//         border-radius: 4px;
//         padding: 8px 12px;
//         font-size: 12.5px;
//         color: #1A1815;
//         outline: none;
//         background: #FFFFFF;
//         transition: border-color 0.15s ease;
//       }
//       .rres-filter-input:focus { border-color: #A97E44; }
//       select.rres-filter-input { cursor: pointer; }

//       .rres-input, select.rres-input {
//         font-family: 'JetBrains Mono', monospace;
//         border: 1px solid #D8D1C2;
//         border-radius: 4px;
//         padding: 8px 10px;
//         font-size: 13px;
//         color: #1A1815;
//         outline: none;
//         width: 100%;
//         box-sizing: border-box;
//         background: #FFFFFF;
//         transition: border-color 0.15s ease;
//       }
//       .rres-input:focus { border-color: #A97E44; }
//       select.rres-input { cursor: pointer; }
//       .rres-input::placeholder { color: #B9B0A0; }

//       .rres-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
//       .rres-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

//       .rres-act {
//         font-family: 'JetBrains Mono', monospace;
//         border-radius: 4px;
//         padding: 5px 10px;
//         font-size: 11px;
//         font-weight: 600;
//         cursor: pointer;
//         transition: opacity 0.15s ease;
//       }
//       .rres-act:hover { opacity: 0.8; }

//       @media (max-width: 860px) {
//         .rres-form-grid { grid-template-columns: 1fr 1fr !important; }
//         .rres-form-grid > div[style*="span 3"] { grid-column: span 2 !important; }
//       }
//       @media (max-width: 640px) {
//         .rres-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
//         .rres-filters { flex-wrap: wrap; }
//         .rres-form-grid { grid-template-columns: 1fr !important; }
//         .rres-form-grid > div[style*="span 3"] { grid-column: span 1 !important; }
//         .rres-card-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
//         .rres-card-right { align-items: flex-start !important; }
//       }
//     `}</style>
//   );

//   if (loading) {
//     return (
//       <div style={s.centered}>
//         <GlobalStyle />
//         <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
//           LOADING…
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={s.page}>
//       <GlobalStyle />

//       <div className="rres-header" style={s.header}>
//         <div>
//           <span style={s.eyebrow}>BOOKING DESK</span>
//           <h1 style={s.title}>Reservations</h1>
//         </div>
//         <div style={s.headerBtns}>
//           <button onClick={() => navigate('/dashboard')} className="rres-outline-btn">← Dashboard</button>
//           <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
//             className="rres-primary-btn">+ New Reservation</button>
//         </div>
//       </div>

//       {msg.text && (
//         <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>{msg.text}</div>
//       )}

//       {/* Filters */}
//       <div className="rres-filters" style={s.filters}>
//         <input type="date" value={dateFilter}
//           onChange={e => setDateFilter(e.target.value)}
//           className="rres-filter-input" />
//         <select value={statusFilter}
//           onChange={e => setStatusFilter(e.target.value)}
//           className="rres-filter-input">
//           <option value="">All Status</option>
//           {Object.entries(STATUS_CONFIG).map(([k, v]) => (
//             <option key={k} value={k}>{v.label}</option>
//           ))}
//         </select>
//         <button onClick={() => { setDateFilter(''); setStatusFilter(''); }}
//           className="rres-outline-btn">Clear</button>
//       </div>

//       {/* Form */}
//       {showForm && (
//         <div style={s.formCard}>
//           <div style={s.perforation} />
//           <h3 style={s.formTitle}>{editingId ? 'Edit Reservation' : 'New Reservation'}</h3>
//           <form onSubmit={handleSubmit}>
//             <div className="rres-form-grid" style={s.formGrid}>
//               <div style={s.field}>
//                 <label style={s.label}>Customer Name *</label>
//                 <input value={form.customer_name}
//                   onChange={e => setForm({ ...form, customer_name: e.target.value })}
//                   className="rres-input" required />
//               </div>
//               <div style={s.field}>
//                 <label style={s.label}>Phone *</label>
//                 <input value={form.customer_phone}
//                   onChange={e => setForm({ ...form, customer_phone: e.target.value })}
//                   className="rres-input" required />
//               </div>
//             <div style={s.field}>
//   <label style={s.label}>Table</label>
//   <select value={form.table_id}
//     onChange={e => setForm({ ...form, table_id: e.target.value })}
//     className="rres-input">
//     <option value="">-- Select Table --</option>
//     {tables.map(t => (
//       <option key={t.id} value={t.id}>
//         {t.table_number} (cap: {t.capacity}) — {t.status}
//       </option>
//     ))}
//   </select>
// </div>
//               <div style={s.field}>
//                 <label style={s.label}>Date *</label>
//                 <input type="date" value={form.reservation_date}
//                   onChange={e => setForm({ ...form, reservation_date: e.target.value })}
//                   className="rres-input" required />
//               </div>
//               <div style={s.field}>
//                 <label style={s.label}>Time *</label>
//                 <input type="time" value={form.reservation_time}
//                   onChange={e => setForm({ ...form, reservation_time: e.target.value })}
//                   className="rres-input" required />
//               </div>
//               <div style={s.field}>
//                 <label style={s.label}>Guests *</label>
//                 <input type="number" min={1} value={form.guests}
//                   onChange={e => setForm({ ...form, guests: e.target.value })}
//                   className="rres-input" required />
//               </div>
//               <div style={{ ...s.field, gridColumn: 'span 3' }}>
//                 <label style={s.label}>Special Requests</label>
//                 <input value={form.special_requests}
//                   onChange={e => setForm({ ...form, special_requests: e.target.value })}
//                   placeholder="Cake, high chair, window seat..."
//                   className="rres-input" />
//               </div>
//             </div>
//             <div style={s.formActions}>
//               <button type="submit" className="rres-primary-btn">{editingId ? 'Update' : 'Confirm'}</button>
//               <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
//                 className="rres-outline-btn">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* List */}
//       {reservations.length === 0 ? (
//         <div style={s.emptyState}><p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>No reservations found</p></div>
//       ) : (
//         <div style={s.list}>
//           {reservations.map(r => {
//             const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
//             return (
//               <div key={r.id} className="rres-card" style={s.card}>
//                 <div style={s.cardClip} />
//                 <div className="rres-card-row" style={s.cardRow}>
//                   <div style={s.cardLeft}>
//                     <div style={s.timeBlock}>
//                       <div style={s.time}>{r.reservation_time}</div>
//                       <div style={s.date}>{r.reservation_date}</div>
//                     </div>
//                     <div>
//                       <h3 style={s.customerName}>{r.customer_name}</h3>
//                       <div style={s.meta}>
//                         <span>📞 {r.customer_phone}</span>
//                         <span>👥 {r.guests} guests</span>
//                         {r.Table && <span>🪑 Table {r.Table.table_number}</span>}
//                       </div>
//                       {r.special_requests && (
//                         <p style={s.specialReq}>📝 {r.special_requests}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="rres-card-right" style={s.cardRight}>
//                     <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
//                       {cfg.label}
//                     </span>
//                     <div style={s.actions}>
//                       {r.status === 'confirmed' && (
//                         <button onClick={() => handleStatusUpdate(r.id, 'seated')}
//                           className="rres-act" style={s.seatBtn}>Seat</button>
//                       )}
//                       {r.status === 'seated' && (
//                         <button onClick={() => handleStatusUpdate(r.id, 'completed')}
//                           className="rres-act" style={s.doneBtn}>Done</button>
//                       )}
//                       {['pending', 'confirmed'].includes(r.status) && (
//                         <button onClick={() => handleStatusUpdate(r.id, 'cancelled')}
//                           className="rres-act" style={s.cancelBtn}>Cancel</button>
//                       )}
//                       <button onClick={() => handleEdit(r)} className="rres-act" style={s.editBtn}>Edit</button>
//                       <button onClick={() => handleDelete(r.id)} className="rres-act" style={s.delBtn}>Del</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// const s = {
//   page:     { padding: '32px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
//   centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },

//   header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
//   eyebrow:    { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
//   title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
//   headerBtns: { display: 'flex', gap: '10px' },

//   msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '16px' },
//   msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
//   msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

//   filters: { display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' },

//   formCard: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '22px', marginBottom: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
//   perforation: {
//     position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
//     background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
//     borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
//   },
//   formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', margin: '0 0 16px', color: '#1A1815' },
//   formGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' },
//   formActions: { display: 'flex', gap: '10px' },
//   field:       { display: 'flex', flexDirection: 'column' },
//   label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '7px' },

//   list: { display: 'flex', flexDirection: 'column', gap: '12px' },
//   card: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '16px 16px 16px 20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
//   cardClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
//   cardRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
//   cardLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
//   cardRight:{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },

//   timeBlock: { textAlign: 'center', background: '#FBF3E6', borderRadius: '4px', padding: '8px 12px', minWidth: '70px' },
//   time:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', color: '#1A1815' },
//   date:      { fontSize: '10.5px', color: '#8B5F2A' },

//   customerName: { fontSize: '14.5px', fontWeight: '700', color: '#1A1815', margin: '0 0 4px' },
//   meta:      { display: 'flex', gap: '12px', fontSize: '12px', color: '#7A7264', flexWrap: 'wrap' },
//   specialReq:{ fontSize: '11.5px', color: '#8B5F2A', margin: '5px 0 0', fontStyle: 'italic' },
//   badge:     { fontSize: '10.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px' },
//   actions:   { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' },

//   seatBtn:   { background: '#F0F7EE', color: '#3F7D33', border: '1px solid #CFE3C6' },
//   doneBtn:   { background: '#F0EDE4', color: '#1A1815', border: 'none' },
//   cancelBtn: { background: '#FBEEEB', color: '#B33F2C', border: '1px solid #EBC7BC' },
//   editBtn:   { background: '#EDF1F5', color: '#3B5170', border: 'none' },
//   delBtn:    { background: '#FBEEEB', color: '#B33F2C', border: 'none' },

//   emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
// };

// export default Reservations;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import useBranchStore from '../store/branchStore';
import BranchSelector from '../components/BranchSelector';

const STATUS_CONFIG = {
  pending:   { bg: '#FBF3E6', color: '#8B5F2A', label: 'Pending' },
  confirmed: { bg: '#EDF1F5', color: '#3B5170', label: 'Confirmed' },
  seated:    { bg: '#F0F7EE', color: '#3F7D33', label: 'Seated' },
  completed: { bg: '#F0EDE4', color: '#7A7264', label: 'Completed' },
  cancelled: { bg: '#FBEEEB', color: '#B33F2C', label: 'Cancelled' },
  no_show:   { bg: '#F5EEF3', color: '#7A4B6B', label: 'No Show' },
};

const EMPTY_FORM = {
  customer_name: '', customer_phone: '', table_id: '',
  reservation_date: '', reservation_time: '',
  guests: 2, special_requests: '', notes: ''
};

const Reservations = () => {
  const navigate  = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tables,       setTables]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [msg,          setMsg]          = useState({ type: '', text: '' });
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [dateFilter,   setDateFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { selectedBranchId } = useBranchStore();

  const fetchReservations = async () => {
    try {
      let url = '/reservations?';
      if (dateFilter)   url += `date=${dateFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (selectedBranchId) url += `branch_id=${selectedBranchId}`;
      const res = await api.get(url);
      setReservations(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchTables = async () => {
    try {
      const params = selectedBranchId ? { branch_id: selectedBranchId } : {};
      const res = await api.get('/tables', { params });
      setTables(res.data.data.tables || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchReservations(), fetchTables()]);
      setLoading(false);
    };
    load();
  }, [selectedBranchId]);

  useEffect(() => { fetchReservations(); }, [dateFilter, statusFilter]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, branch_id: selectedBranchId || undefined };
      if (editingId) {
        await api.put(`/reservations/${editingId}`, payload);
        showMsg('success', 'Reservation updated!');
      } else {
        await api.post('/reservations', payload);
        showMsg('success', 'Reservation confirmed!');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchReservations();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      fetchReservations();
    } catch (err) {
      showMsg('error', 'Could not update status');
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({
      customer_name:    r.customer_name,
      customer_phone:   r.customer_phone,
      table_id:         r.table_id         || '',
      reservation_date: r.reservation_date,
      reservation_time: r.reservation_time,
      guests:           r.guests,
      special_requests: r.special_requests || '',
      notes:            r.notes            || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      showMsg('success', 'Deleted!');
      fetchReservations();
    } catch (err) {
      showMsg('error', 'Could not delete');
    }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rres-outline-btn {
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
      .rres-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rres-primary-btn {
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
      .rres-primary-btn:hover { background: #A97E44; }

      .rres-filter-input, select.rres-filter-input {
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
      .rres-filter-input:focus { border-color: #A97E44; }
      select.rres-filter-input { cursor: pointer; }

      .rres-input, select.rres-input {
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
      .rres-input:focus { border-color: #A97E44; }
      select.rres-input { cursor: pointer; }
      .rres-input::placeholder { color: #B9B0A0; }

      .rres-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rres-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rres-act {
        font-family: 'JetBrains Mono', monospace;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      .rres-act:hover { opacity: 0.8; }

      @media (max-width: 860px) {
        .rres-form-grid { grid-template-columns: 1fr 1fr !important; }
        .rres-form-grid > div[style*="span 3"] { grid-column: span 2 !important; }
      }
      @media (max-width: 640px) {
        .rres-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rres-filters { flex-wrap: wrap; }
        .rres-form-grid { grid-template-columns: 1fr !important; }
        .rres-form-grid > div[style*="span 3"] { grid-column: span 1 !important; }
        .rres-card-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rres-card-right { align-items: flex-start !important; }
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

      <div className="rres-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>BOOKING DESK</span>
          <h1 style={s.title}>Reservations</h1>
        </div>
        <div style={s.headerBtns}>
          <BranchSelector />
          <button onClick={() => navigate('/dashboard')} className="rres-outline-btn">← Dashboard</button>
          <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
            className="rres-primary-btn">+ New Reservation</button>
        </div>
      </div>

      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>{msg.text}</div>
      )}

      {/* Filters */}
      <div className="rres-filters" style={s.filters}>
        <input type="date" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="rres-filter-input" />
        <select value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rres-filter-input">
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button onClick={() => { setDateFilter(''); setStatusFilter(''); }}
          className="rres-outline-btn">Clear</button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>{editingId ? 'Edit Reservation' : 'New Reservation'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="rres-form-grid" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Customer Name *</label>
                <input value={form.customer_name}
                  onChange={e => setForm({ ...form, customer_name: e.target.value })}
                  className="rres-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone *</label>
                <input value={form.customer_phone}
                  onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                  className="rres-input" required />
              </div>
            <div style={s.field}>
  <label style={s.label}>Table</label>
  <select value={form.table_id}
    onChange={e => setForm({ ...form, table_id: e.target.value })}
    className="rres-input">
    <option value="">-- Select Table --</option>
    {tables.map(t => (
      <option key={t.id} value={t.id}>
        {t.table_number} (cap: {t.capacity}) — {t.status}
      </option>
    ))}
  </select>
</div>
              <div style={s.field}>
                <label style={s.label}>Date *</label>
                <input type="date" value={form.reservation_date}
                  onChange={e => setForm({ ...form, reservation_date: e.target.value })}
                  className="rres-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Time *</label>
                <input type="time" value={form.reservation_time}
                  onChange={e => setForm({ ...form, reservation_time: e.target.value })}
                  className="rres-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Guests *</label>
                <input type="number" min={1} value={form.guests}
                  onChange={e => setForm({ ...form, guests: e.target.value })}
                  className="rres-input" required />
              </div>
              <div style={{ ...s.field, gridColumn: 'span 3' }}>
                <label style={s.label}>Special Requests</label>
                <input value={form.special_requests}
                  onChange={e => setForm({ ...form, special_requests: e.target.value })}
                  placeholder="Cake, high chair, window seat..."
                  className="rres-input" />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" className="rres-primary-btn">{editingId ? 'Update' : 'Confirm'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                className="rres-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {reservations.length === 0 ? (
        <div style={s.emptyState}><p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>No reservations found</p></div>
      ) : (
        <div style={s.list}>
          {reservations.map(r => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            return (
              <div key={r.id} className="rres-card" style={s.card}>
                <div style={s.cardClip} />
                <div className="rres-card-row" style={s.cardRow}>
                  <div style={s.cardLeft}>
                    <div style={s.timeBlock}>
                      <div style={s.time}>{r.reservation_time}</div>
                      <div style={s.date}>{r.reservation_date}</div>
                    </div>
                    <div>
                      <h3 style={s.customerName}>{r.customer_name}</h3>
                      <div style={s.meta}>
                        <span>📞 {r.customer_phone}</span>
                        <span>👥 {r.guests} guests</span>
                        {r.Table && <span>🪑 Table {r.Table.table_number}</span>}
                      </div>
                      {r.special_requests && (
                        <p style={s.specialReq}>📝 {r.special_requests}</p>
                      )}
                    </div>
                  </div>
                  <div className="rres-card-right" style={s.cardRight}>
                    <span style={{ ...s.badge, background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <div style={s.actions}>
                      {r.status === 'confirmed' && (
                        <button onClick={() => handleStatusUpdate(r.id, 'seated')}
                          className="rres-act" style={s.seatBtn}>Seat</button>
                      )}
                      {r.status === 'seated' && (
                        <button onClick={() => handleStatusUpdate(r.id, 'completed')}
                          className="rres-act" style={s.doneBtn}>Done</button>
                      )}
                      {['pending', 'confirmed'].includes(r.status) && (
                        <button onClick={() => handleStatusUpdate(r.id, 'cancelled')}
                          className="rres-act" style={s.cancelBtn}>Cancel</button>
                      )}
                      <button onClick={() => handleEdit(r)} className="rres-act" style={s.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="rres-act" style={s.delBtn}>Del</button>
                    </div>
                  </div>
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

  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  eyebrow:    { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
  title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  headerBtns: { display: 'flex', gap: '10px' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '16px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  filters: { display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' },

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

  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '16px 16px 16px 20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  cardClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  cardRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  cardRight:{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },

  timeBlock: { textAlign: 'center', background: '#FBF3E6', borderRadius: '4px', padding: '8px 12px', minWidth: '70px' },
  time:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', color: '#1A1815' },
  date:      { fontSize: '10.5px', color: '#8B5F2A' },

  customerName: { fontSize: '14.5px', fontWeight: '700', color: '#1A1815', margin: '0 0 4px' },
  meta:      { display: 'flex', gap: '12px', fontSize: '12px', color: '#7A7264', flexWrap: 'wrap' },
  specialReq:{ fontSize: '11.5px', color: '#8B5F2A', margin: '5px 0 0', fontStyle: 'italic' },
  badge:     { fontSize: '10.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px' },
  actions:   { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' },

  seatBtn:   { background: '#F0F7EE', color: '#3F7D33', border: '1px solid #CFE3C6' },
  doneBtn:   { background: '#F0EDE4', color: '#1A1815', border: 'none' },
  cancelBtn: { background: '#FBEEEB', color: '#B33F2C', border: '1px solid #EBC7BC' },
  editBtn:   { background: '#EDF1F5', color: '#3B5170', border: 'none' },
  delBtn:    { background: '#FBEEEB', color: '#B33F2C', border: 'none' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default Reservations;