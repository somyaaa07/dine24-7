import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ROLES = ['manager','waiter','chef','cashier','cleaner','delivery','other'];
const TABS  = ['employees','attendance','payroll'];

const EMPTY_EMP = { name:'', email:'', phone:'', role:'waiter', salary:'', salary_type:'monthly', join_date:'', address:'', emergency_contact:'' };
const EMPTY_ATT = { employee_id:'', date: new Date().toISOString().split('T')[0], status:'present', check_in:'', check_out:'', note:'' };

const Employees = () => {
  const navigate = useNavigate();
  const [tab,         setTab]         = useState('employees');
  const [employees,   setEmployees]   = useState([]);
  const [attendance,  setAttendance]  = useState([]);
  const [payrolls,    setPayrolls]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState({ type:'', text:'' });
  const [showEmpForm, setShowEmpForm] = useState(false);
  const [showAttForm, setShowAttForm] = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [empForm,     setEmpForm]     = useState(EMPTY_EMP);
  const [attForm,     setAttForm]     = useState(EMPTY_ATT);
  const [payMonth,    setPayMonth]    = useState(new Date().getMonth() + 1);
  const [payYear,     setPayYear]     = useState(new Date().getFullYear());
  const [attMonth,    setAttMonth]    = useState(new Date().getMonth() + 1);
  const [attYear,     setAttYear]     = useState(new Date().getFullYear());

  const fetchEmployees = async () => {
    try { const r = await api.get('/employees'); setEmployees(r.data.data); }
    catch(e) { console.error(e); }
  };

  const fetchAttendance = async () => {
    try { const r = await api.get(`/employees/attendance/records?month=${attMonth}&year=${attYear}`); setAttendance(r.data.data); }
    catch(e) { console.error(e); }
  };

  const fetchPayroll = async () => {
    try { const r = await api.get(`/employees/payroll/list?month=${payMonth}&year=${payYear}`); setPayrolls(r.data.data); }
    catch(e) { console.error(e); }
  };

  useEffect(() => {
    const load = async () => {
      await fetchEmployees();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { if(tab === 'attendance') fetchAttendance(); }, [tab, attMonth, attYear]);
  useEffect(() => { if(tab === 'payroll') fetchPayroll(); }, [tab, payMonth, payYear]);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:'', text:'' }), 3000); };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/employees/${editingId}`, empForm); showMsg('success','Employee updated!'); }
      else { await api.post('/employees', empForm); showMsg('success','Employee added!'); }
      setEmpForm(EMPTY_EMP); setEditingId(null); setShowEmpForm(false); fetchEmployees();
    } catch(err) { showMsg('error', err.response?.data?.message || 'Save failed'); }
  };

  const handleAttSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees/attendance', attForm);
      showMsg('success','Attendance marked!');
      setShowAttForm(false); setAttForm(EMPTY_ATT); fetchAttendance();
    } catch(err) { showMsg('error', err.response?.data?.message || 'Failed'); }
  };

  const handleGenPayroll = async () => {
    if (!window.confirm(`Generate payroll for ${payMonth}/${payYear}?`)) return;
    try {
      const r = await api.post('/employees/payroll/generate', { month: payMonth, year: payYear });
      showMsg('success', r.data.message); fetchPayroll();
    } catch(err) { showMsg('error', err.response?.data?.message || 'Failed'); }
  };

  const handleMarkPaid = async (id) => {
    try { await api.put(`/employees/payroll/${id}/paid`); showMsg('success','Paid!'); fetchPayroll(); }
    catch(err) { showMsg('error','Failed'); }
  };

  const handleDeleteEmp = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    try { await api.delete(`/employees/${id}`); showMsg('success','Removed!'); fetchEmployees(); }
    catch(err) { showMsg('error','Failed'); }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rhr-outline-btn {
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
      .rhr-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rhr-primary-btn {
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
      .rhr-primary-btn:hover { background: #A97E44; }

      .rhr-tab {
        font-family: 'JetBrains Mono', monospace;
        padding: 10px 18px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: #7A7264;
        margin-bottom: -1px;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .rhr-tab:hover { color: #1A1815; }
      .rhr-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rhr-input, select.rhr-input {
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
      .rhr-input:focus { border-color: #A97E44; }
      select.rhr-input { cursor: pointer; }

      .rhr-filter-select {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12.5px;
        color: #1A1815;
        outline: none;
        background: #FFFFFF;
        cursor: pointer;
        transition: border-color 0.15s ease;
      }
      .rhr-filter-select:focus { border-color: #A97E44; }

      .rhr-emp-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rhr-emp-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rhr-edit-btn {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        background: #F0EDE4;
        color: #1A1815;
        border: none;
        border-radius: 4px;
        padding: 7px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rhr-edit-btn:hover { background: #EDE7DA; }

      .rhr-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 7px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rhr-delete-btn:hover { background: #F6DFD9; }

      .rhr-pay-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #F0F7EE;
        color: #3F7D33;
        border: 1px solid #CFE3C6;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rhr-pay-btn:hover { background: #E3F0DD; }

      .rhr-row:hover { background: #FBF9F4; }

      @media (max-width: 860px) {
        .rhr-form-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 640px) {
        .rhr-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rhr-form-grid { grid-template-columns: 1fr !important; }
        .rhr-table-wrap { overflow-x: auto; }
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

      <div className="rhr-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>STAFF LEDGER</span>
          <h1 style={s.title}>HR Management</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rhr-outline-btn">← Dashboard</button>
          {tab === 'employees' && <button onClick={() => { setEditingId(null); setEmpForm(EMPTY_EMP); setShowEmpForm(true); }} className="rhr-primary-btn">+ Employee</button>}
          {tab === 'attendance' && <button onClick={() => setShowAttForm(true)} className="rhr-primary-btn">Mark Attendance</button>}
          {tab === 'payroll' && <button onClick={handleGenPayroll} className="rhr-primary-btn">Generate Payroll</button>}
        </div>
      </div>

      {msg.text && <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>{msg.text}</div>}

      <div style={s.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rhr-tab ${tab === t ? 'rhr-tab-active' : ''}`}
          >
            {t === 'employees' ? '👤 Employees' : t === 'attendance' ? '📋 Attendance' : '💰 Payroll'}
          </button>
        ))}
      </div>

      {/* EMPLOYEES TAB */}
      {tab === 'employees' && (
        <>
          {showEmpForm && (
            <div style={s.formCard}>
              <div style={s.perforation} />
              <h3 style={s.formTitle}>{editingId ? 'Edit Employee' : 'Add Employee'}</h3>
              <form onSubmit={handleEmpSubmit}>
                <div className="rhr-form-grid" style={s.formGrid}>
                  <div style={s.field}><label style={s.label}>Name *</label>
                    <input value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="rhr-input" required /></div>
                  <div style={s.field}><label style={s.label}>Phone</label>
                    <input value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Email</label>
                    <input type="email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Role</label>
                    <select value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="rhr-input">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div style={s.field}><label style={s.label}>Salary (₹)</label>
                    <input type="number" value={empForm.salary} onChange={e => setEmpForm({...empForm, salary: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Salary Type</label>
                    <select value={empForm.salary_type} onChange={e => setEmpForm({...empForm, salary_type: e.target.value})} className="rhr-input">
                      <option value="monthly">Monthly</option>
                      <option value="daily">Daily</option>
                      <option value="hourly">Hourly</option></select></div>
                  <div style={s.field}><label style={s.label}>Join Date</label>
                    <input type="date" value={empForm.join_date} onChange={e => setEmpForm({...empForm, join_date: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Emergency Contact</label>
                    <input value={empForm.emergency_contact} onChange={e => setEmpForm({...empForm, emergency_contact: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Address</label>
                    <input value={empForm.address} onChange={e => setEmpForm({...empForm, address: e.target.value})} className="rhr-input" /></div>
                </div>
                <div style={s.formActions}>
                  <button type="submit" className="rhr-primary-btn">{editingId ? 'Update' : 'Add'}</button>
                  <button type="button" onClick={() => { setShowEmpForm(false); setEditingId(null); }} className="rhr-outline-btn">Cancel</button>
                </div>
              </form>
            </div>
          )}
          <div style={s.grid}>
            {employees.map(emp => (
              <div key={emp.id} className="rhr-emp-card" style={s.empCard}>
                <div style={s.empClip} />
                <div style={s.empTop}>
                  <div style={s.avatar}>{emp.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 style={s.empName}>{emp.name}</h3>
                    <span style={s.roleBadge}>{emp.role}</span>
                  </div>
                </div>
                <div style={s.empDetails}>
                  {emp.phone && <p style={s.detail}>📞 {emp.phone}</p>}
                  {emp.email && <p style={s.detail}>✉️ {emp.email}</p>}
                  <p style={s.detail}>💰 ₹{parseFloat(emp.salary).toLocaleString()} / {emp.salary_type}</p>
                  {emp.join_date && <p style={s.detail}>📅 Joined: {emp.join_date}</p>}
                </div>
                <div style={s.empActions}>
                  <button onClick={() => { setEditingId(emp.id); setEmpForm({ name: emp.name, email: emp.email||'', phone: emp.phone||'', role: emp.role, salary: emp.salary, salary_type: emp.salary_type, join_date: emp.join_date||'', address: emp.address||'', emergency_contact: emp.emergency_contact||'' }); setShowEmpForm(true); }} className="rhr-edit-btn">Edit</button>
                  <button onClick={() => handleDeleteEmp(emp.id, emp.name)} className="rhr-delete-btn">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ATTENDANCE TAB */}
      {tab === 'attendance' && (
        <>
          <div style={s.filterRow}>
            <select value={attMonth} onChange={e => setAttMonth(e.target.value)} className="rhr-filter-select">
              {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en',{month:'long'})}</option>)}
            </select>
            <input type="number" value={attYear} onChange={e => setAttYear(e.target.value)} className="rhr-filter-select" style={{ width:'100px' }} />
          </div>
          {showAttForm && (
            <div style={s.formCard}>
              <div style={s.perforation} />
              <h3 style={s.formTitle}>Mark Attendance</h3>
              <form onSubmit={handleAttSubmit}>
                <div className="rhr-form-grid" style={s.formGrid}>
                  <div style={s.field}><label style={s.label}>Employee *</label>
                    <select value={attForm.employee_id} onChange={e => setAttForm({...attForm, employee_id: e.target.value})} className="rhr-input" required>
                      <option value="">-- Select --</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                  <div style={s.field}><label style={s.label}>Date *</label>
                    <input type="date" value={attForm.date} onChange={e => setAttForm({...attForm, date: e.target.value})} className="rhr-input" required /></div>
                  <div style={s.field}><label style={s.label}>Status *</label>
                    <select value={attForm.status} onChange={e => setAttForm({...attForm, status: e.target.value})} className="rhr-input">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="half_day">Half Day</option>
                      <option value="leave">Leave</option></select></div>
                  <div style={s.field}><label style={s.label}>Check In</label>
                    <input type="time" value={attForm.check_in} onChange={e => setAttForm({...attForm, check_in: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Check Out</label>
                    <input type="time" value={attForm.check_out} onChange={e => setAttForm({...attForm, check_out: e.target.value})} className="rhr-input" /></div>
                  <div style={s.field}><label style={s.label}>Note</label>
                    <input value={attForm.note} onChange={e => setAttForm({...attForm, note: e.target.value})} className="rhr-input" /></div>
                </div>
                <div style={s.formActions}>
                  <button type="submit" className="rhr-primary-btn">Mark</button>
                  <button type="button" onClick={() => setShowAttForm(false)} className="rhr-outline-btn">Cancel</button>
                </div>
              </form>
            </div>
          )}
          <div className="rhr-table-wrap" style={s.tableWrap}>
            <div style={s.perforation} />
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Employee</th><th style={s.th}>Date</th>
                <th style={s.th}>Status</th><th style={s.th}>Check In</th>
                <th style={s.th}>Check Out</th><th style={s.th}>Hours</th>
              </tr></thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a.id} className="rhr-row" style={s.tr}>
                    <td style={s.td}>{a.Employee?.name}</td>
                    <td style={s.td}>{a.date}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.attBadge,
                        background: a.status==='present' ? '#F0F7EE' : a.status==='absent' ? '#FBEEEB' : '#FBF3E6',
                        color:      a.status==='present' ? '#3F7D33' : a.status==='absent' ? '#B33F2C' : '#8B5F2A'
                      }}>{a.status}</span>
                    </td>
                    <td style={s.td}>{a.check_in || '—'}</td>
                    <td style={s.td}>{a.check_out || '—'}</td>
                    <td style={s.td}>{a.hours_worked}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendance.length === 0 && <p style={s.emptyTable}>No attendance records found</p>}
          </div>
        </>
      )}

      {/* PAYROLL TAB */}
      {tab === 'payroll' && (
        <>
          <div style={s.filterRow}>
            <select value={payMonth} onChange={e => setPayMonth(e.target.value)} className="rhr-filter-select">
              {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en',{month:'long'})}</option>)}
            </select>
            <input type="number" value={payYear} onChange={e => setPayYear(e.target.value)} className="rhr-filter-select" style={{ width:'100px' }} />
          </div>
          <div className="rhr-table-wrap" style={s.tableWrap}>
            <div style={s.perforation} />
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Employee</th><th style={s.th}>Days Worked</th>
                <th style={s.th}>Basic</th><th style={s.th}>Deductions</th>
                <th style={s.th}>Net Salary</th><th style={s.th}>Status</th><th style={s.th}>Action</th>
              </tr></thead>
              <tbody>
                {payrolls.map(p => (
                  <tr key={p.id} className="rhr-row" style={s.tr}>
                    <td style={s.td}>{p.Employee?.name}</td>
                    <td style={s.td}>{p.days_worked}</td>
                    <td style={s.td}>₹{parseFloat(p.basic_salary).toFixed(0)}</td>
                    <td style={s.td}>₹{parseFloat(p.deductions).toFixed(0)}</td>
                    <td style={s.td}><strong style={{ color: '#1A1815' }}>₹{parseFloat(p.net_salary).toFixed(0)}</strong></td>
                    <td style={s.td}>
                      <span style={{
                        ...s.attBadge,
                        background: p.status==='paid' ? '#F0F7EE' : '#FBF3E6',
                        color:      p.status==='paid' ? '#3F7D33' : '#8B5F2A'
                      }}>{p.status}</span>
                    </td>
                    <td style={s.td}>
                      {p.status === 'pending' && <button onClick={() => handleMarkPaid(p.id)} className="rhr-pay-btn">Mark Paid</button>}
                      {p.status === 'paid' && <span style={{ fontSize:'11.5px', color:'#3F7D33', fontWeight: '600' }}>✅ Paid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payrolls.length === 0 && <p style={s.emptyTable}>Generate payroll first</p>}
          </div>
        </>
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

  tabs: { display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid #E9E3D6' },

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

  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' },
  empCard: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'16px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  empClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  empTop: { display:'flex', gap:'12px', alignItems:'center', marginBottom:'12px' },
  avatar: { width:'42px', height:'42px', borderRadius:'4px', background:'#A97E44', color:'#1A1815', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: "'Bebas Neue', sans-serif", fontSize:'18px' },
  empName: { fontSize:'14.5px', fontWeight:'700', color:'#1A1815', margin:'0 0 4px' },
  roleBadge: { background:'#F0EDE4', color:'#7A7264', fontSize:'10.5px', padding:'2px 8px', borderRadius:'999px', fontWeight:'700', textTransform: 'capitalize' },
  empDetails: { marginBottom:'12px' },
  detail: { fontSize:'12px', color:'#7A7264', margin:'3px 0' },
  empActions: { display:'flex', gap:'8px', borderTop: '1px dashed #E9E3D6', paddingTop:'10px' },

  filterRow: { display:'flex', gap:'10px', marginBottom:'18px' },

  tableWrap: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', overflow:'hidden', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#FBF9F4' },
  th: { padding:'12px 16px', textAlign:'left', fontSize:'10.5px', fontWeight:'700', color:'#7A7264', textTransform:'uppercase', letterSpacing: '0.06em', borderBottom:'1px solid #E9E3D6' },
  tr: { borderBottom:'1px dashed #E9E3D6' },
  td: { padding:'12px 16px', fontSize:'13px', color:'#1A1815' },
  attBadge: { fontSize:'10.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', textTransform: 'capitalize' },
  emptyTable: { textAlign:'center', padding:'40px', color:'#B9B0A0', fontSize:'13px' },
};

export default Employees;