import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Analytics = () => {
  const navigate = useNavigate();
  const [tab,          setTab]          = useState('overview');
  const [overview,     setOverview]     = useState(null);
  const [peakHours,    setPeakHours]    = useState([]);
  const [revenueData,  setRevenueData]  = useState([]);
  const [tableData,    setTableData]    = useState([]);
  const [custInsights, setCustInsights] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [days,         setDays]         = useState(30);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, phRes, rdRes, tiRes, ciRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/peak-hours'),
          api.get(`/analytics/revenue-by-day?days=${days}`),
          api.get('/analytics/table-utilization'),
          api.get('/analytics/customer-insights')
        ]);
        setOverview(ovRes.data.data);
        setPeakHours(phRes.data.data.hourly || []);
        setRevenueData(rdRes.data.data || []);
        setTableData(tiRes.data.data || []);
        setCustInsights(ciRes.data.data);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [days]);

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rana-outline-btn {
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
      .rana-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rana-tab {
        font-family: 'JetBrains Mono', monospace;
        padding: 9px 16px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: #7A7264;
        margin-bottom: -1px;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .rana-tab:hover { color: #1A1815; }
      .rana-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rana-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rana-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rana-day-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        color: #7A7264;
        transition: all 0.15s ease;
      }
      .rana-day-active { background: #1A1815 !important; color: #F7F5F0 !important; border-color: #1A1815 !important; }

      .rana-bar { transition: height 0.3s ease, opacity 0.15s ease; }
      .rana-bar-col:hover .rana-bar { opacity: 0.8; }

      .rana-row:hover { background: #FBF9F4; }

      @media (max-width: 640px) {
        .rana-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING ANALYTICS…
        </p>
      </div>
    );
  }

  const maxPeak = Math.max(...peakHours.map(h => h.orders), 1);
  const maxRev  = Math.max(...revenueData.map(d => d.revenue), 1);
  const busiestHourOrders = peakHours.length ? Math.max(...peakHours.map(x => x.orders)) : 0;

  return (
    <div style={s.page}>
      <GlobalStyle />

      <div className="rana-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>THE NUMBERS</span>
          <h1 style={s.title}>Analytics</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="rana-outline-btn">← Dashboard</button>
      </div>

      <div style={s.tabs}>
        {['overview','peak-hours','revenue','tables','customers'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rana-tab ${tab === t ? 'rana-tab-active' : ''}`}
          >
            {t==='overview'?'📊 Overview':t==='peak-hours'?'⏰ Peak Hours':t==='revenue'?'💰 Revenue':t==='tables'?'🪑 Tables':'👥 Customers'}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && overview && (
        <div>
          <div style={s.statsGrid}>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Today Revenue</p>
              <p style={s.statValue}>₹{parseFloat(overview.today.revenue||0).toLocaleString()}</p>
              <p style={s.statSub}>{overview.today.orders} orders</p>
            </div>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>This Week</p>
              <p style={s.statValue}>₹{parseFloat(overview.week.revenue||0).toLocaleString()}</p>
              <p style={s.statSub}>{overview.week.orders} orders</p>
            </div>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>This Month</p>
              <p style={s.statValue}>₹{parseFloat(overview.month.revenue||0).toLocaleString()}</p>
              <p style={s.statSub}>{overview.month.orders} orders</p>
            </div>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Avg Order Value</p>
              <p style={s.statValue}>₹{parseFloat(overview.avg_order_value||0).toFixed(0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* PEAK HOURS */}
      {tab === 'peak-hours' && (
        <div style={s.card}>
          <div style={s.perforation} />
          <h3 style={s.cardTitle}>Orders by Hour (Last 30 Days)</h3>
          <div style={s.barChart}>
            {peakHours.map(h => (
              <div key={h.hour} className="rana-bar-col" style={s.barCol}>
                <div style={s.barWrap}>
                  <div className="rana-bar" style={{
                    ...s.bar,
                    height: `${(h.orders / maxPeak) * 160}px`,
                    background: h.orders === busiestHourOrders ? '#A97E44' : '#E7D2AC'
                  }} />
                </div>
                <div style={s.barLabel}>{h.hour}:00</div>
                <div style={s.barVal}>{h.orders}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVENUE TREND */}
      {tab === 'revenue' && (
        <div>
          <div style={s.filterRow}>
            {[7,14,30,60].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rana-day-btn ${days === d ? 'rana-day-active' : ''}`}
              >{d} days</button>
            ))}
          </div>
          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Daily Revenue — Last {days} Days</h3>
            <div style={s.barChart}>
              {revenueData.map((day, i) => (
                <div key={i} className="rana-bar-col" style={s.barCol}>
                  <div style={s.barWrap}>
                    <div className="rana-bar" style={{ ...s.bar, height: `${(day.revenue / maxRev) * 160}px`, background: '#7FA66C' }} />
                  </div>
                  <div style={s.barLabel}>{day.date?.slice(5)}</div>
                  <div style={s.barVal}>₹{(day.revenue/1000).toFixed(1)}k</div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Revenue Table</h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr style={s.thead}>
                  <th style={s.th}>Date</th><th style={s.th}>Orders</th><th style={s.th}>Revenue</th>
                </tr></thead>
                <tbody>
                  {revenueData.slice().reverse().map((d,i) => (
                    <tr key={i} className="rana-row" style={s.tr}>
                      <td style={s.td}>{d.date}</td>
                      <td style={s.td}>{d.orders}</td>
                      <td style={s.td}>₹{parseFloat(d.revenue).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TABLE UTILIZATION */}
      {tab === 'tables' && (
        <div style={s.card}>
          <div style={s.perforation} />
          <h3 style={s.cardTitle}>Table Performance (Last 30 Days)</h3>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr style={s.thead}>
                <th style={s.th}>Table</th><th style={s.th}>Section</th>
                <th style={s.th}>Capacity</th><th style={s.th}>Orders</th><th style={s.th}>Revenue</th>
              </tr></thead>
              <tbody>
                {tableData.map(t => (
                  <tr key={t.id} className="rana-row" style={s.tr}>
                    <td style={s.td}><strong style={{ color: '#1A1815' }}>{t.table_number}</strong></td>
                    <td style={s.td}>{t.section}</td>
                    <td style={s.td}>{t.capacity}</td>
                    <td style={s.td}>{t.orders}</td>
                    <td style={s.td}>₹{parseFloat(t.revenue||0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMERS */}
      {tab === 'customers' && custInsights && (
        <div>
          <div style={s.statsGrid}>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Total Customers</p>
              <p style={s.statValue}>{custInsights.totalCustomers}</p>
            </div>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>New This Month</p>
              <p style={s.statValue}>{custInsights.newThisMonth}</p>
            </div>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Avg Spend</p>
              <p style={s.statValue}>₹{parseFloat(custInsights.avgSpend||0).toFixed(0)}</p>
            </div>
            <div className="rana-stat-card" style={s.statCard}>
              <div style={s.statClip} />
              <p style={s.statLabel}>Retention Rate</p>
              <p style={s.statValue}>{custInsights.retentionRate}%</p>
              <p style={s.statSub}>{custInsights.repeatCustomers} repeat customers</p>
            </div>
          </div>
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

  tabs: { display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid #E9E3D6', flexWrap:'wrap' },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'14px', marginBottom:'22px' },
  statCard: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'16px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  statLabel: { fontSize:'10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color:'#7A7264', margin:'0 0 9px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'24px', letterSpacing: '0.01em', color:'#1A1815', margin:0 },
  statSub: { fontSize:'11px', color:'#B9B0A0', margin:'5px 0 0' },

  card: { background:'#FFFFFF', border: '1px solid #E9E3D6', borderRadius:'6px', padding:'20px', boxShadow:'0 1px 2px rgba(26,24,21,0.03)', marginBottom:'16px', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize:'18px', letterSpacing: '0.01em', color:'#1A1815', margin:'0 0 18px' },

  barChart: { display:'flex', alignItems:'flex-end', gap:'4px', overflowX:'auto', paddingBottom:'8px' },
  barCol: { display:'flex', flexDirection:'column', alignItems:'center', minWidth:'36px' },
  barWrap: { height:'160px', display:'flex', alignItems:'flex-end' },
  bar: { width:'26px', borderRadius:'3px 3px 0 0', minHeight:'2px' },
  barLabel: { fontSize:'9.5px', color:'#B9B0A0', marginTop:'6px', whiteSpace:'nowrap' },
  barVal: { fontSize:'10px', color:'#7A7264', fontWeight:'700', marginTop: '2px' },

  filterRow: { display:'flex', gap:'8px', marginBottom:'16px' },

  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#FBF9F4' },
  th: { padding:'10px 12px', textAlign:'left', fontSize:'10.5px', fontWeight:'700', color:'#7A7264', textTransform:'uppercase', letterSpacing: '0.06em', borderBottom:'1px solid #E9E3D6' },
  tr: { borderBottom:'1px dashed #E9E3D6' },
  td: { padding:'10px 12px', fontSize:'12.5px', color:'#1A1815' },
};

export default Analytics;