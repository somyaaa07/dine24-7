import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import api from '../api';

// ---- brand tokens (unchanged from the existing design system) ----
const COLORS = {
  bg: '#F7F5F0',
  card: '#FFFFFF',
  border: '#E9E3D6',
  ink: '#1A1815',
  mute: '#7A7264',
  faint: '#B9B0A0',
  gold: '#A97E44',
  goldSoft: '#E7D2AC',
  green: '#7FA66C',
  red: '#C1554A',
};

const money = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const moneyShort = (n) => {
  const v = parseFloat(n || 0);
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v.toFixed(0)}`;
};

const Analytics = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [custInsights, setCustInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const load = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [ovRes, phRes, rdRes, tiRes, ciRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/peak-hours'),
        api.get(`/analytics/revenue-by-day?days=${days}`),
        api.get('/analytics/table-utilization'),
        api.get('/analytics/customer-insights'),
      ]);
      setOverview(ovRes.data.data);
      setPeakHours(phRes.data.data.hourly || []);
      setRevenueData(rdRes.data.data || []);
      setTableData(tiRes.data.data || []);
      setCustInsights(ciRes.data.data);
    } catch (e) {
      console.error(e);
      setError("Couldn't load analytics. Check your connection and try again.");
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  // last-7-day sparkline data for the overview cards (derived, no extra fetch)
  const last7 = useMemo(() => revenueData.slice(-7), [revenueData]);
  const revenueTrendPct = useMemo(() => {
    if (last7.length < 2) return null;
    const first = last7[0].revenue || 0;
    const lastV = last7[last7.length - 1].revenue || 0;
    if (first === 0) return null;
    return ((lastV - first) / first) * 100;
  }, [last7]);

  const busiestHour = peakHours.length
    ? peakHours.reduce((a, b) => (b.orders > a.orders ? b : a), peakHours[0])
    : null;

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

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
        transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
      }
      .rana-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }
      .rana-outline-btn:active { transform: scale(0.97); }
      .rana-outline-btn:focus-visible { outline: 2px solid #A97E44; outline-offset: 2px; }
      .rana-outline-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
        white-space: nowrap;
      }
      .rana-tab:hover { color: #1A1815; }
      .rana-tab:focus-visible { outline: 2px solid #A97E44; outline-offset: -2px; }
      .rana-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rana-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; animation: rana-rise 0.35s ease both; }
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
      .rana-day-btn:hover { border-color: #A97E44; }
      .rana-day-btn:focus-visible { outline: 2px solid #A97E44; outline-offset: 2px; }
      .rana-day-active { background: #1A1815 !important; color: #F7F5F0 !important; border-color: #1A1815 !important; }

      .rana-row { transition: background 0.1s ease; }
      .rana-row:hover { background: #FBF9F4; }

      .rana-tab-panel { animation: rana-fade 0.25s ease both; }

      @keyframes rana-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes rana-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes rana-spin { to { transform: rotate(360deg); } }
      .rana-spinner { animation: rana-spin 0.8s linear infinite; }

      @media (prefers-reduced-motion: reduce) {
        .rana-stat-card, .rana-tab-panel, .rana-spinner { animation: none !important; }
      }

      @media (max-width: 640px) {
        .rana-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
      }
    `}</style>
  );

  // ---- shared recharts tooltip, styled to match the brand ----
  const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={s.tooltip}>
        <div style={s.tooltipLabel}>{labelFormatter ? labelFormatter(label) : label}</div>
        {payload.map((p, i) => (
          <div key={i} style={s.tooltipRow}>
            <span style={{ ...s.tooltipDot, background: p.color || p.fill }} />
            <span style={s.tooltipName}>{p.name}</span>
            <span style={s.tooltipVal}>{formatter ? formatter(p.value) : p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const EmptyState = ({ label }) => (
    <div style={s.emptyState}>
      <span style={{ fontSize: '20px' }}>◌</span>
      <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.faint }}>{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div className="rana-spinner" style={s.spinner} />
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
            LOADING ANALYTICS…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <GlobalStyle />

      <div className="rana-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>THE NUMBERS</span>
          <h1 style={s.title}>Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => load(true)}
            className="rana-outline-btn"
            disabled={refreshing}
            title="Refresh data"
          >
            {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="rana-outline-btn">← Dashboard</button>
        </div>
      </div>

      {error && (
        <div style={s.errorBanner}>
          <span>{error}</span>
          <button onClick={() => load()} className="rana-outline-btn" style={{ padding: '5px 12px', fontSize: '11px' }}>Retry</button>
        </div>
      )}

      <div style={s.tabs}>
        {['overview', 'peak-hours', 'revenue', 'tables', 'customers'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rana-tab ${tab === t ? 'rana-tab-active' : ''}`}
          >
            {t === 'overview' ? '📊 Overview' : t === 'peak-hours' ? '⏰ Peak Hours' : t === 'revenue' ? '💰 Revenue' : t === 'tables' ? '🪑 Tables' : '👥 Customers'}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && overview && (
        <div key="overview" className="rana-tab-panel">
          <div style={s.statsGrid}>
            <StatCard label="Today Revenue" value={money(overview.today.revenue)} sub={`${overview.today.orders} orders`} />
            <StatCard label="This Week" value={money(overview.week.revenue)} sub={`${overview.week.orders} orders`} />
            <StatCard label="This Month" value={money(overview.month.revenue)} sub={`${overview.month.orders} orders`} />
            <StatCard
              label="Avg Order Value"
              value={money(overview.avg_order_value)}
              sub={revenueTrendPct !== null ? `${revenueTrendPct >= 0 ? '▲' : '▼'} ${Math.abs(revenueTrendPct).toFixed(1)}% vs 7d ago` : null}
              subColor={revenueTrendPct !== null ? (revenueTrendPct >= 0 ? COLORS.green : COLORS.red) : undefined}
            />
          </div>

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Revenue — Last 7 Days</h3>
            {last7.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={last7} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ranaOverviewFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey={(d) => d.date?.slice(5)} tick={s.axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                  <YAxis tick={s.axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={moneyShort} />
                  <Tooltip content={<ChartTooltip formatter={money} />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.gold} strokeWidth={2} fill="url(#ranaOverviewFill)" dot={{ r: 3, fill: COLORS.gold, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState label="No revenue data yet" />}
          </div>
        </div>
      )}

      {/* PEAK HOURS */}
      {tab === 'peak-hours' && (
        <div key="peak-hours" className="rana-tab-panel" style={s.card}>
          <div style={s.perforation} />
          <h3 style={s.cardTitle}>Orders by Hour (Last 30 Days)</h3>
          {busiestHour && (
            <p style={s.cardSub}>Busiest at <strong style={{ color: COLORS.ink }}>{busiestHour.hour}:00</strong> with {busiestHour.orders} orders</p>
          )}
          {peakHours.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={peakHours} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={COLORS.border} />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={s.axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} interval={1} />
                <YAxis tick={s.axisTick} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(169,126,68,0.08)' }} content={<ChartTooltip labelFormatter={(h) => `${h}:00`} />} />
                <Bar dataKey="orders" name="Orders" radius={[3, 3, 0, 0]}>
                  {peakHours.map((h, i) => (
                    <Cell key={i} fill={busiestHour && h.hour === busiestHour.hour ? COLORS.gold : COLORS.goldSoft} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState label="No order activity yet" />}
        </div>
      )}

      {/* REVENUE TREND */}
      {tab === 'revenue' && (
        <div key="revenue" className="rana-tab-panel">
          <div style={s.filterRow}>
            {[7, 14, 30, 60].map(d => (
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
            {revenueData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey={(d) => d.date?.slice(5)} tick={s.axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} minTickGap={20} />
                  <YAxis yAxisId="rev" tick={s.axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={moneyShort} />
                  <Tooltip content={<ChartTooltip formatter={money} />} />
                  <Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.green} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState label="No revenue data for this range" />}
          </div>

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Orders — Last {days} Days</h3>
            {revenueData.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={COLORS.border} />
                  <XAxis dataKey={(d) => d.date?.slice(5)} tick={s.axisTick} axisLine={{ stroke: COLORS.border }} tickLine={false} minTickGap={20} />
                  <YAxis tick={s.axisTick} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(127,166,108,0.08)' }} content={<ChartTooltip />} />
                  <Bar dataKey="orders" name="Orders" fill={COLORS.goldSoft} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState label="No order data for this range" />}
          </div>

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Revenue Table</h3>
            {revenueData.length ? (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>
                    <th style={s.th}>Date</th><th style={s.th}>Orders</th><th style={s.th}>Revenue</th>
                  </tr></thead>
                  <tbody>
                    {revenueData.slice().reverse().map((d, i) => (
                      <tr key={i} className="rana-row" style={s.tr}>
                        <td style={s.td}>{d.date}</td>
                        <td style={s.td}>{d.orders}</td>
                        <td style={s.td}>{money(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState label="Nothing to show yet" />}
          </div>
        </div>
      )}

      {/* TABLE UTILIZATION */}
      {tab === 'tables' && (
        <div key="tables" className="rana-tab-panel" style={s.card}>
          <div style={s.perforation} />
          <h3 style={s.cardTitle}>Table Performance (Last 30 Days)</h3>
          {tableData.length ? (
            <>
              <ResponsiveContainer width="100%" height={Math.max(180, tableData.length * 34)}>
                <BarChart
                  data={tableData.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0))}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                >
                  <CartesianGrid horizontal={false} stroke={COLORS.border} />
                  <XAxis type="number" tick={s.axisTick} axisLine={false} tickLine={false} tickFormatter={moneyShort} />
                  <YAxis type="category" dataKey="table_number" tick={s.axisTick} axisLine={false} tickLine={false} width={56} />
                  <Tooltip cursor={{ fill: 'rgba(169,126,68,0.08)' }} content={<ChartTooltip formatter={money} />} />
                  <Bar dataKey="revenue" name="Revenue" fill={COLORS.gold} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ ...s.tableWrap, marginTop: '18px' }}>
                <table style={s.table}>
                  <thead><tr style={s.thead}>
                    <th style={s.th}>Table</th><th style={s.th}>Section</th>
                    <th style={s.th}>Capacity</th><th style={s.th}>Orders</th><th style={s.th}>Revenue</th>
                  </tr></thead>
                  <tbody>
                    {tableData.map(t => (
                      <tr key={t.id} className="rana-row" style={s.tr}>
                        <td style={s.td}><strong style={{ color: COLORS.ink }}>{t.table_number}</strong></td>
                        <td style={s.td}>{t.section}</td>
                        <td style={s.td}>{t.capacity}</td>
                        <td style={s.td}>{t.orders}</td>
                        <td style={s.td}>{money(t.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : <EmptyState label="No table activity yet" />}
        </div>
      )}

      {/* CUSTOMERS */}
      {tab === 'customers' && custInsights && (
        <div key="customers" className="rana-tab-panel">
          <div style={s.statsGrid}>
            <StatCard label="Total Customers" value={custInsights.totalCustomers} />
            <StatCard label="New This Month" value={custInsights.newThisMonth} />
            <StatCard label="Avg Spend" value={money(custInsights.avgSpend)} />
            <StatCard label="Retention Rate" value={`${custInsights.retentionRate}%`} sub={`${custInsights.repeatCustomers} repeat customers`} />
          </div>

          <div style={s.card}>
            <div style={s.perforation} />
            <h3 style={s.cardTitle}>Customer Mix</h3>
            {custInsights.totalCustomers ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie
                      data={[
                        { name: 'Repeat', value: custInsights.repeatCustomers || 0 },
                        { name: 'One-time', value: Math.max((custInsights.totalCustomers || 0) - (custInsights.repeatCustomers || 0), 0) },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={COLORS.gold} />
                      <Cell fill={COLORS.goldSoft} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <LegendRow color={COLORS.gold} label="Repeat customers" value={custInsights.repeatCustomers} />
                  <LegendRow color={COLORS.goldSoft} label="One-time customers" value={Math.max((custInsights.totalCustomers || 0) - (custInsights.repeatCustomers || 0), 0)} />
                </div>
              </div>
            ) : <EmptyState label="No customer data yet" />}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, sub, subColor }) => (
  <div className="rana-stat-card" style={s.statCard}>
    <div style={s.statClip} />
    <p style={s.statLabel}>{label}</p>
    <p style={s.statValue}>{value}</p>
    {sub && <p style={{ ...s.statSub, color: subColor || s.statSub.color }}>{sub}</p>}
  </div>
);

const LegendRow = ({ color, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
    <span style={{ color: COLORS.mute }}>{label}</span>
    <span style={{ color: COLORS.ink, fontWeight: 700, marginLeft: 'auto' }}>{value}</span>
  </div>
);

const s = {
  page: { padding: '32px', background: COLORS.bg, minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: COLORS.bg },
  spinner: { width: '22px', height: '22px', border: `2px solid ${COLORS.border}`, borderTopColor: COLORS.gold, borderRadius: '50%' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  eyebrow: { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: COLORS.gold, marginBottom: '6px' },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: COLORS.ink, margin: 0 },

  errorBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#FBEEEC', border: `1px solid ${COLORS.red}33`, color: COLORS.red, borderRadius: '6px', padding: '10px 14px', fontSize: '12.5px', marginBottom: '16px' },

  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, flexWrap: 'wrap' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px', marginBottom: '18px' },
  statCard: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '6px', padding: '16px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  statClip: { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: COLORS.gold },
  statLabel: { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.mute, margin: '0 0 9px' },
  statValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '0.01em', color: COLORS.ink, margin: 0 },
  statSub: { fontSize: '11px', color: COLORS.faint, margin: '5px 0 0', fontWeight: 700 },

  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '6px', padding: '20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', marginBottom: '16px', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: `repeating-linear-gradient(to right, ${COLORS.border} 0, ${COLORS.border} 6px, transparent 6px, transparent 12px)`,
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px',
  },
  cardTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.01em', color: COLORS.ink, margin: '0 0 4px' },
  cardSub: { fontSize: '11.5px', color: COLORS.mute, margin: '0 0 14px' },

  axisTick: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fill: COLORS.faint },

  tooltip: { background: COLORS.ink, color: COLORS.bg, borderRadius: '5px', padding: '9px 11px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', boxShadow: '0 8px 20px rgba(26,24,21,0.25)' },
  tooltipLabel: { fontWeight: 700, marginBottom: '5px', letterSpacing: '0.03em' },
  tooltipRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  tooltipDot: { width: '7px', height: '7px', borderRadius: '2px', flexShrink: 0 },
  tooltipName: { color: '#C9C2B4' },
  tooltipVal: { marginLeft: 'auto', fontWeight: 700 },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: COLORS.faint },

  filterRow: { display: 'flex', gap: '8px', marginBottom: '16px' },

  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#FBF9F4' },
  th: { padding: '10px 12px', textAlign: 'left', fontSize: '10.5px', fontWeight: '700', color: COLORS.mute, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${COLORS.border}` },
  tr: { borderBottom: `1px dashed ${COLORS.border}` },
  td: { padding: '10px 12px', fontSize: '12.5px', color: COLORS.ink },
};

export default Analytics;