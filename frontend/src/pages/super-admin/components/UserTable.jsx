import { C, PLANS } from '../constants/superAdmin.constants';
import { IconStoreSmall } from './Icons';

function Badge({ color, bg, children }) {
  return (
    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: bg, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded uppercase" style={{ background: C.violetBg, color: C.violet }}>
      {role || '—'}
    </span>
  );
}

function TenantChip({ tenant, onClick }) {
  const plan = PLANS[tenant?.plan] || { color: C.faint, bg: '#F1EEE7' };
  return (
    <button
      onClick={onClick}
      title="View parent restaurant"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold transition-transform hover:-translate-y-[1px]"
      style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.color}44` }}
    >
      <IconStoreSmall className="w-3 h-3" />
      {tenant?.name || 'Unknown restaurant'}
    </button>
  );
}

function GhostBtn({ children, onClick, color, bg, border }) {
  return (
    <button onClick={onClick} className="sa-nav-btn" style={{ background: bg, color, borderColor: border }}>
      {children}
    </button>
  );
}

export default function UserTable({ users, onOpenTenant, onRequestStatusChange }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-[#E9E3D6] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9E3D6] bg-[#FBF8F2]">
              {['User', 'Restaurant', 'Role', 'Status', 'Last Login', ''].map(h => (
                <th key={h} className="px-4 py-3 text-[10.5px] font-bold tracking-wider text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[#F1EEE7] hover:bg-[#FBF8F2] transition-colors duration-150 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[15px] shrink-0" style={{ background: u.is_active ? C.blue : C.red, fontFamily: "'Bebas Neue', sans-serif" }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A1815]">{u.name}</p>
                      <p className="text-[10.5px] text-[#B9B0A0]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><TenantChip tenant={u.Tenant} onClick={() => onOpenTenant(u.Tenant)} /></td>
                <td className="px-4 py-3"><RoleBadge role={u.Role?.name} /></td>
                <td className="px-4 py-3"><Badge color={u.is_active ? C.green : C.red} bg={u.is_active ? C.greenBg : C.redBg}>{u.is_active ? 'Active' : 'Suspended'}</Badge></td>
                <td className="px-4 py-3 text-[11px] text-[#B9B0A0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <GhostBtn
                    color={u.is_active ? C.red : C.green}
                    bg={u.is_active ? C.redBg : C.greenBg}
                    border={u.is_active ? C.redBorder : C.greenBorder}
                    onClick={() => onRequestStatusChange(u)}
                  >
                    {u.is_active ? 'Suspend' : 'Activate'}
                  </GhostBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2.5">
        {users.map(u => (
          <div key={u.id} className="sa-card">
            <div className="flex gap-3 items-center">
              <div className="w-11 h-11 rounded-md flex items-center justify-center text-white text-[20px] shrink-0" style={{ background: u.is_active ? C.blue : C.red, fontFamily: "'Bebas Neue', sans-serif" }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-[14.5px] font-bold text-[#1A1815]">{u.name}</h3>
                <p className="text-[11px] text-[#B9B0A0]">{u.email}</p>
                <div className="flex gap-2 flex-wrap mt-1 items-center">
                  <TenantChip tenant={u.Tenant} onClick={() => onOpenTenant(u.Tenant)} />
                  <RoleBadge role={u.Role?.name} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge color={u.is_active ? C.green : C.red} bg={u.is_active ? C.greenBg : C.redBg}>{u.is_active ? 'Active' : 'Suspended'}</Badge>
              <GhostBtn
                color={u.is_active ? C.red : C.green}
                bg={u.is_active ? C.redBg : C.greenBg}
                border={u.is_active ? C.redBorder : C.greenBorder}
                onClick={() => onRequestStatusChange(u)}
              >
                {u.is_active ? 'Suspend' : 'Activate'}
              </GhostBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
