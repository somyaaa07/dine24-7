import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { C, PLANS } from '../constants/superAdmin.constants';

export default function PlanDistribution({ planData }) {
  const total = planData.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
      <h3 className="text-[12px] font-bold tracking-wide text-[#7A7264] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Plan Distribution</h3>
      {planData.length === 0 ? (
        <p className="text-[#B9B0A0] text-[12px] py-8 text-center">No restaurants yet</p>
      ) : (
        <div className="flex items-center gap-8 flex-wrap">
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie data={planData} dataKey="count" nameKey="plan" innerRadius={46} outerRadius={66} paddingAngle={3} stroke="none">
                {planData.map(entry => <Cell key={entry.plan} fill={PLANS[entry.plan]?.color || C.faint} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 min-w-[200px] space-y-2.5">
            {planData.map(p => {
              const pct = total ? Math.round((p.count / total) * 100) : 0;
              return (
                <div key={p.plan} className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-[#4A453D] capitalize">
                    <span className="w-2 h-2 rounded-full" style={{ background: PLANS[p.plan]?.color || C.faint }} />
                    {PLANS[p.plan]?.label || p.plan}
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-bold text-[#1A1815] tabular-nums">{p.count}</span>
                    <span className="text-[10.5px] text-[#B9B0A0] tabular-nums">{pct}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
