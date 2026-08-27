import { useMemo, useState } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { C, REVENUE_RANGES } from '../constants/superAdmin.constants';

export default function RevenueChart({ trend, totalRevenue }) {
  const [range, setRange] = useState('14d');
  const [metric, setMetric] = useState('both'); // 'both' | 'revenue' | 'orders'

  // Trend currently comes back as a fixed 14-day window from
  // /super-admin/trend. We slice to the selected range client-side;
  // ranges longer than the data we have simply show everything available
  // rather than fabricating extra points.
  const rangeMeta = REVENUE_RANGES.find(r => r.id === range) || REVENUE_RANGES[1];
  const data = useMemo(() => trend.slice(Math.max(0, trend.length - rangeMeta.days)), [trend, rangeMeta]);

  const showRevenue = metric !== 'orders';
  const showOrders = metric !== 'revenue';

  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div>
          <h3 className="text-[12px] font-bold tracking-wide text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Revenue Overview</h3>
          <p className="text-[26px] leading-tight text-[#1A1815] mt-0.5" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            ₹{Number(totalRevenue || 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-full border border-[#E9E3D6] p-0.5 bg-[#FBF8F2]">
            {['both', 'revenue', 'orders'].map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className="px-2.5 py-1 rounded-full text-[10.5px] font-bold capitalize transition-colors"
                style={{ background: metric === m ? '#fff' : 'transparent', color: metric === m ? C.ink : C.muted, boxShadow: metric === m ? '0 1px 2px rgba(26,24,21,0.08)' : 'none' }}
              >
                {m === 'both' ? 'Both' : m}
              </button>
            ))}
          </div>
          <div className="flex rounded-full border border-[#E9E3D6] p-0.5 bg-[#FBF8F2]">
            {REVENUE_RANGES.map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className="px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-colors"
                style={{ background: range === r.id ? '#fff' : 'transparent', color: range === r.id ? C.ink : C.muted, boxShadow: range === r.id ? '0 1px 2px rgba(26,24,21,0.08)' : 'none' }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-[12px] text-[#B9B0A0] py-16 text-center">No trend data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.28} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={{ stroke: C.border }} tickLine={false} />
            {showRevenue && (
              <YAxis yAxisId="rev" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={46}
                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
            )}
            {showOrders && (
              <YAxis yAxisId="ord" orientation="right" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
            )}
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} labelStyle={{ color: C.muted }} />
            {showRevenue && (
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke={C.green} fill="url(#revGrad)" strokeWidth={2} />
            )}
            {showOrders && (
              <Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders" stroke={C.blue} strokeWidth={2} dot={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
