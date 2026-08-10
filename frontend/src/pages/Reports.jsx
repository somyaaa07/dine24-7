import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Reports = () => {
  const navigate = useNavigate();
  const [tab,       setTab]       = useState('sales');
  const [loading,   setLoading]   = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [topItems,  setTopItems]  = useState([]);
  const [invData,   setInvData]   = useState(null);
  const [finData,   setFinData]   = useState(null);
  const [month,     setMonth]     = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = startDate && endDate ? `start_date=${startDate}&end_date=${endDate}` : '';
      const [salesRes, topRes] = await Promise.all([
        api.get(`/reports/sales?${params}`),
        api.get(`/reports/top-items?${params}`)
      ]);
      setSalesData(salesRes.data.data);
      setTopItems(topRes.data.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try { const res = await api.get('/reports/inventory'); setInvData(res.data.data); }
    catch(e) { console.error(e); }
    setLoading(false);
  };

  const fetchFinancial = async () => {
    setLoading(true);
    try { const res = await api.get(`/reports/financial?month=${month}&year=${year}`); setFinData(res.data.data); }
    catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'sales')     fetchSales();
    if (tab === 'inventory') fetchInventory();
    if (tab === 'financial') fetchFinancial();
  }, [tab]);

  useEffect(() => { if (tab === 'financial') fetchFinancial(); }, [month, year]);

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rrep-outline-btn {
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
      .rrep-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rrep-primary-btn {
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
      .rrep-primary-btn:hover { background: #A97E44; }

      .rrep-tab {
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
      .rrep-tab:hover { color: #1A1815; }
      .rrep-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rrep-filter-input, select.rrep-filter-input {
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
      .rrep-filter-input:focus { border-color: #A97E44; }
      select.rrep-filter-input { cursor: pointer; }

      .rrep-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rrep-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rrep-row:hover { background: #FBF9F4; }

      @media (max-width: 860px) {
        .rrep-two-col { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        .rrep-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rrep-filter-row { flex-wrap: wrap; }
      }
    `}</style>
  );

  return (
    <div style={s.page}>
      <GlobalStyle />

      <div className="rrep-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>END OF DAY</span>
          <h1 style={s.title}>Reports</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="rrep-outline-btn">← Dashboard</button>
      </div>

      <div style={s.tabs}>
        {['sales','inventory','financial'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rrep-tab ${tab === t ? 'rrep-tab-active' : ''}`}
          >
            {t === 'sales' ? '📊 Sales' : t === 'inventory' ? '📦 Inventory' : '💰 Financial'}
          </button>
        ))}
      </div>

      {loading && (
        <div style={s.loading}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em', margin: 0 }}>
            LOADING…
          </p>
        </div>
      )}

      {/* SALES REPORT */}
      {tab === 'sales' && !loading && salesData && (
        <div>
          <div className="rrep-filter-row" style={s.filterRow}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rrep-filter-input" />
            <span style={{ color:'#B9B0A0', fontSize: '12px' }}>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rrep-filter-input" />
            <button onClick={fetchSales} className="rrep-primary-btn">Apply</button>
          </div>

          <div style={s.statsGrid}>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Revenue</p>
              <p style={s.statValue}>₹{parseFloat(salesData.summary.totalRevenue||0).toLocaleString()}</p>
            </div>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Orders</p>
              <p style={s.statValue}>{salesData.summary.totalOrders}</p>
            </div>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Avg Order Value</p>
              <p style={s.statValue}>₹{parseFloat(salesData.summary.avgOrderValue||0).toFixed(0)}</p>
            </div>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Items Sold</p>
              <p style={s.statValue}>{salesData.summary.totalCovers}</p>
            </div>
          </div>

          <div className="rrep-two-col" style={s.twoCol}>
            <div style={s.card}>
              <div style={s.perforation} />
              <h3 style={s.cardTitle}>Payment Methods</h3>
              {Object.entries(salesData.byPaymentMethod||{}).map(([method, amt]) => (
                <div key={method} className="rrep-row" style={s.reportRow}>
                  <span style={s.reportLabel}>{method}</span>
                  <span style={s.reportValue}>₹{parseFloat(amt).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={s.perforation} />
              <h3 style={s.cardTitle}>Order Types</h3>
              {Object.entries(salesData.byOrderType||{}).map(([type, amt]) => (
                <div key={type} className="rrep-row" style={s.reportRow}>
                  <span style={s.reportLabel}>{type}</span>
                  <span style={s.reportValue}>₹{parseFloat(amt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Daily Sales</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  <th style={s.th}>Date</th><th style={s.th}>Orders</th><th style={s.th}>Revenue</th>
                </tr></thead>
                <tbody>
                  {(salesData.dailySales||[]).map((day, i) => (
                    <tr key={i} className="rrep-row" style={s.tr}>
                      <td style={s.td}>{day.date}</td>
                      <td style={s.td}>{day.orders}</td>
                      <td style={s.td}>₹{parseFloat(day.revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {topItems.length > 0 && (
            <div style={{ ...s.card, marginTop:'16px' }}>
              <div style={s.perforation} />
              <h3 style={s.cardTitle}>Top Selling Items</h3>
              {topItems.map((item, i) => (
                <div key={i} className="rrep-row" style={s.reportRow}>
                  <span style={s.reportLabel}>#{i+1} {item.name}</span>
                  <span style={s.reportValue}>{item.dataValues?.total_qty || item.total_qty} sold — ₹{parseFloat(item.dataValues?.total_revenue || item.total_revenue || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVENTORY REPORT */}
      {tab === 'inventory' && !loading && invData && (
        <div>
          <div style={s.statsGrid}>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Items</p>
              <p style={s.statValue}>{invData.items.length}</p>
            </div>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={{ ...s.statClip, background: invData.low_stock_count > 0 ? '#B33F2C' : '#3F7D33' }} />
              <p style={s.statLabel}>Low Stock Items</p>
              <p style={{ ...s.statValue, color: invData.low_stock_count > 0 ? '#B33F2C' : '#3F7D33' }}>{invData.low_stock_count}</p>
            </div>
            <div className="rrep-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Inventory Value</p>
              <p style={s.statValue}>₹{parseFloat(invData.total_inventory_value||0).toLocaleString()}</p>
            </div>
          </div>

          {invData.low_stock_count > 0 && (
            <div style={s.alertCard}>
              <h3 style={{ ...s.cardTitle, color: '#B33F2C' }}>⚠️ Low Stock Items</h3>
              {invData.low_stock_items.map(item => (
                <div key={item.id} style={s.reportRow}>
                  <span style={s.reportLabel}>{item.name}</span>
                  <span style={{ color:'#B33F2C', fontSize:'12.5px', fontWeight: '600' }}>{item.current_quantity} {item.unit} left (min: {item.minimum_threshold})</span>
                </div>
              ))}
            </div>
          )}

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>All Inventory Items</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  <th style={s.th}>Item</th><th style={s.th}>Category</th>
                  <th style={s.th}>Stock</th><th style={s.th}>Min</th>
                  <th style={s.th}>Unit Price</th><th style={s.th}>Value</th>
                </tr></thead>
                <tbody>
                  {invData.items.map(item => {
                    const isLow = parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold);
                    return (
                      <tr key={item.id} className="rrep-row" style={{ ...s.tr, background: isLow ? '#FBEEEB' : 'transparent' }}>
                        <td style={s.td}>{item.name}</td>
                        <td style={s.td}>{item.category || '—'}</td>
                        <td style={{ ...s.td, color: isLow ? '#B33F2C' : '#3F7D33', fontWeight:'700' }}>{item.current_quantity} {item.unit}</td>
                        <td style={s.td}>{item.minimum_threshold} {item.unit}</td>
                        <td style={s.td}>₹{item.purchase_price}</td>
                        <td style={s.td}>₹{(parseFloat(item.current_quantity) * parseFloat(item.purchase_price)).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL REPORT */}
      {tab === 'financial' && !loading && finData && (
        <div>
          <div className="rrep-filter-row" style={s.filterRow}>
            <select value={month} onChange={e => setMonth(e.target.value)} className="rrep-filter-input">
              {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en',{month:'long'})}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="rrep-filter-input" style={{ width:'90px' }} />
          </div>

          <div style={s.statsGrid}>
            <div className="rrep-stat-card" style={{ ...s.statCard, background:'#F0F7EE' }}>
              <div style={{ ...s.statClip, background: '#3F7D33' }} />
              <p style={s.statLabel}>Revenue</p>
              <p style={{ ...s.statValue, color:'#3F7D33' }}>₹{parseFloat(finData.revenue||0).toLocaleString()}</p>
            </div>
            <div className="rrep-stat-card" style={{ ...s.statCard, background:'#FBEEEB' }}>
              <div style={{ ...s.statClip, background: '#B33F2C' }} />
              <p style={s.statLabel}>Expenses</p>
              <p style={{ ...s.statValue, color:'#B33F2C' }}>₹{parseFloat(finData.total_expenses||0).toLocaleString()}</p>
            </div>
            <div className="rrep-stat-card" style={{ ...s.statCard, background:'#FBEEEB' }}>
              <div style={{ ...s.statClip, background: '#B33F2C' }} />
              <p style={s.statLabel}>Payroll</p>
              <p style={{ ...s.statValue, color:'#B33F2C' }}>₹{parseFloat(finData.total_payroll||0).toLocaleString()}</p>
            </div>
            <div className="rrep-stat-card" style={{ ...s.statCard, background: parseFloat(finData.gross_profit)>=0 ? '#F0F7EE' : '#FBEEEB' }}>
              <div style={{ ...s.statClip, background: parseFloat(finData.gross_profit)>=0 ? '#3F7D33' : '#B33F2C' }} />
              <p style={s.statLabel}>Gross Profit</p>
              <p style={{ ...s.statValue, color: parseFloat(finData.gross_profit)>=0 ? '#3F7D33' : '#B33F2C' }}>₹{parseFloat(finData.gross_profit||0).toLocaleString()}</p>
            </div>
          </div>

          <div className="rrep-two-col" style={s.twoCol}>
            <div style={s.card}>
              <div style={s.perforation} />
              <h3 style={s.cardTitle}>Revenue Breakdown</h3>
              <div className="rrep-row" style={s.reportRow}><span style={s.reportLabel}>Gross Revenue</span><span style={s.reportValue}>₹{parseFloat(finData.revenue||0).toLocaleString()}</span></div>
              <div className="rrep-row" style={s.reportRow}><span style={s.reportLabel}>Tax Collected</span><span style={s.reportValue}>₹{parseFloat(finData.tax_collected||0).toLocaleString()}</span></div>
              <div className="rrep-row" style={s.reportRow}><span style={s.reportLabel}>Discounts Given</span><span style={{ ...s.reportValue, color:'#B33F2C' }}>-₹{parseFloat(finData.discounts_given||0).toLocaleString()}</span></div>
              <div className="rrep-row" style={s.reportRow}><span style={s.reportLabel}>Total Orders</span><span style={s.reportValue}>{finData.orders_count}</span></div>
            </div>
            <div style={s.card}>
              <div style={s.perforation} />
              <h3 style={s.cardTitle}>Cost Breakdown</h3>
              <div className="rrep-row" style={s.reportRow}><span style={s.reportLabel}>Operating Expenses</span><span style={{ ...s.reportValue, color:'#B33F2C' }}>₹{parseFloat(finData.total_expenses||0).toLocaleString()}</span></div>
              <div className="rrep-row" style={s.reportRow}><span style={s.reportLabel}>Payroll</span><span style={{ ...s.reportValue, color:'#B33F2C' }}>₹{parseFloat(finData.total_payroll||0).toLocaleString()}</span></div>
              <div className="rrep-row" style={{ ...s.reportRow, borderTop:'1px dashed #D8D1C2', marginTop:'8px', paddingTop:'12px' }}>
                <span style={{ ...s.reportLabel, fontWeight:'700', color: '#1A1815' }}>Net Profit</span>
                <span style={{ ...s.reportValue, color: parseFloat(finData.gross_profit)>=0 ? '#3F7D33' : '#B33F2C', fontWeight:'700' }}>₹{parseFloat(finData.gross_profit||0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { padding:'32px', background:'#F7F5F0', minHeight:'100vh', fontFamily: "'JetBrains Mono', monospace" },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  eyebrow: { display:'inline-block', fontSize:'11px', fontWeight:'700', letterSpacing:'0.14em', color:'#A97E44', marginBottom:'6px' },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'28px', letterSpacing:'0.01em', color:'#1A1815', margin:0 },

  tabs: { display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid #E9E3D6' },
  loading: { textAlign:'center', padding:'40px' },

  filterRow: { display:'flex', gap:'10px', marginBottom:'18px', alignItems:'center' },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'14px', marginBottom:'22px' },
  statCard: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'16px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  statLabel: { fontSize:'10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color:'#7A7264', margin:'0 0 9px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'25px', letterSpacing: '0.01em', color:'#1A1815', margin:0 },

  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' },
  card: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'18px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', marginBottom:'16px', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  alertCard: { background:'#FBEEEB', border:'1px solid #EBC7BC', borderRadius:'6px', padding:'16px', marginBottom:'16px' },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'18px', letterSpacing: '0.01em', color:'#1A1815', margin:'0 0 12px' },
  reportRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px dashed #E9E3D6' },
  reportLabel: { fontSize:'12.5px', color:'#7A7264', textTransform: 'capitalize' },
  reportValue: { fontSize:'12.5px', fontWeight:'700', color:'#1A1815' },

  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#FBF9F4' },
  th: { padding:'10px 12px', textAlign:'left', fontSize:'10.5px', fontWeight:'700', color:'#7A7264', textTransform:'uppercase', letterSpacing: '0.06em', borderBottom:'1px solid #E9E3D6' },
  tr: { borderBottom:'1px dashed #E9E3D6' },
  td: { padding:'10px 12px', fontSize:'12.5px', color:'#1A1815' },
};

export default Reports;