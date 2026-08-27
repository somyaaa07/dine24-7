import { C } from '../constants/superAdmin.constants';

const KIND_COLOR = {
  created:    C.green,
  plan_change: C.violet,
  suspended:  C.red,
  activated:  C.green,
  default:    C.amber,
};

/**
 * No `/super-admin/activity` (or similar) endpoint currently exists, so this
 * component is built to accept real data via `activities` and simply does
 * not render until that's wired up — per the brief, it must never show
 * fabricated events. Pass an array of { id, kind, title, detail, timestamp }
 * once a backend source is available.
 */
export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
      <h3 className="text-[12px] font-bold tracking-wide text-[#7A7264] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(a => (
          <div key={a.id} className="flex gap-3">
            <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: KIND_COLOR[a.kind] || KIND_COLOR.default }} />
            <div>
              <p className="text-[12.5px] font-semibold text-[#1A1815]">{a.title}</p>
              {a.detail && <p className="text-[12px] text-[#7A7264]">{a.detail}</p>}
              <p className="text-[10.5px] text-[#B9B0A0] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{a.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
