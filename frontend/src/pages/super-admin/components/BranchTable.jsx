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

export default function BranchTable({ branches, onOpenTenant, onRequestStatusChange }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-[#E9E3D6] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9E3D6] bg-[#FBF8F2]">
              {['Branch', 'Restaurant', 'Location', 'Orders', 'Revenue', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-[10.5px] font-bold tracking-wider text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.map(branch => (
              <tr key={branch.id} className="border-b border-[#F1EEE7] hover:bg-[#FBF8F2] transition-colors duration-150 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[15px] shrink-0" style={{ background: branch.is_active ? C.green : C.red, fontFamily: "'Bebas Neue', sans-serif" }}>
                      {branch.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A1815] flex items-center gap-1.5">
                        {branch.name}
                        {branch.is_main && <span className="text-[9px] font-bold text-[#A97E44]">MAIN</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><TenantChip tenant={branch.Tenant} onClick={() => onOpenTenant(branch.Tenant)} /></td>
                <td className="px-4 py-3 text-[12px] text-[#7A7264] max-w-[220px] truncate">{branch.address}</td>
                <td className="px-4 py-3 text-[12px] tabular-nums text-[#4A453D]">{branch.orderCount || 0}</td>
                <td className="px-4 py-3 text-[12px] tabular-nums text-[#4A453D]">₹{parseFloat(branch.revenue || 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><Badge color={branch.is_active ? C.green : C.red} bg={branch.is_active ? C.greenBg : C.redBg}>{branch.is_active ? 'Active' : 'Suspended'}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <GhostBtn
                    color={branch.is_active ? C.red : C.green}
                    bg={branch.is_active ? C.redBg : C.greenBg}
                    border={branch.is_active ? C.redBorder : C.greenBorder}
                    onClick={() => onRequestStatusChange(branch)}
                  >
                    {branch.is_active ? 'Suspend' : 'Activate'}
                  </GhostBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2.5">
        {branches.map(branch => (
          <div key={branch.id} className="sa-card">
            <div className="flex gap-3 items-center">
              <div className="w-11 h-11 rounded-md flex items-center justify-center text-white text-[20px] shrink-0" style={{ background: branch.is_active ? C.green : C.red, fontFamily: "'Bebas Neue', sans-serif" }}>
                {branch.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-[14.5px] font-bold text-[#1A1815]">{branch.name}</h3>
                  {branch.is_main && <span className="text-[9px] text-[#A97E44] font-bold">MAIN</span>}
                </div>
                <TenantChip tenant={branch.Tenant} onClick={() => onOpenTenant(branch.Tenant)} />
                <p className="text-[11px] text-[#B9B0A0] mt-1">{branch.address}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge color={branch.is_active ? C.green : C.red} bg={branch.is_active ? C.greenBg : C.redBg}>{branch.is_active ? 'Active' : 'Suspended'}</Badge>
              <GhostBtn
                color={branch.is_active ? C.red : C.green}
                bg={branch.is_active ? C.redBg : C.greenBg}
                border={branch.is_active ? C.redBorder : C.greenBorder}
                onClick={() => onRequestStatusChange(branch)}
              >
                {branch.is_active ? 'Suspend' : 'Activate'}
              </GhostBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
