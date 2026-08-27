import { ALL_FEATURES, PLAN_FEATURES, PLANS } from '../constants/superAdmin.constants';

export function PlanCard({ planKey, plan, count }) {
  return (
    <div className="relative bg-white border border-[#E9E3D6] rounded-lg p-6 overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
      <div className="absolute top-0 left-0 w-full h-[4px]" style={{ background: plan.color }} />
      <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: plan.color }}>{plan.label}</span>
      <p className="text-[34px] leading-tight text-[#1A1815] mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{plan.price}</p>
      <p className="text-[12.5px] text-[#7A7264] mt-1 mb-5">
        <span className="font-bold text-[#1A1815] tabular-nums">{count}</span> restaurant{count === 1 ? '' : 's'} on this plan
      </p>
      <button className="sa-nav-btn w-full justify-center">Edit Plan</button>
    </div>
  );
}

export function FeatureComparisonTable() {
  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[520px]">
        <thead>
          <tr className="border-b border-[#E9E3D6] bg-[#FBF8F2]">
            <th className="px-4 py-3 text-[10.5px] font-bold tracking-wider text-[#7A7264] uppercase">Feature</th>
            {Object.entries(PLANS).map(([key, plan]) => (
              <th key={key} className="px-4 py-3 text-[10.5px] font-bold tracking-wider uppercase text-center" style={{ color: plan.color }}>{plan.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_FEATURES.map(f => (
            <tr key={f} className="border-b border-[#F1EEE7] last:border-0">
              <td className="px-4 py-2.5 text-[12.5px] text-[#1A1815] font-medium">{f}</td>
              {Object.keys(PLANS).map(key => {
                const has = (PLAN_FEATURES[key] || []).includes(f);
                return (
                  <td key={key} className="px-4 py-2.5 text-center">
                    <span style={{ color: has ? PLANS[key].color : '#D8D1C2' }}>{has ? '✓' : '·'}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
