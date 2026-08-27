import { useState, useRef, useEffect } from 'react';
import { C, PLANS, STATUS } from '../constants/superAdmin.constants';
import { IconDots } from './Icons';

function Badge({ color, bg, children }) {
  return (
    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: bg, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

function RowActions({ tenant, onView, onSuspend }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#FBF8F2] text-[#7A7264]">
        <IconDots className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-[#E9E3D6] rounded-lg shadow-[0_10px_28px_rgba(26,24,21,0.12)] py-1 sa-menu-in">
          <button onClick={() => { onView(tenant); setOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] font-medium text-[#1A1815] hover:bg-[#FBF8F2]">View Details</button>
          {tenant.status !== 'suspended' ? (
            <button onClick={() => { onSuspend(tenant); setOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-[#FBEEEB]" style={{ color: C.red }}>Suspend</button>
          ) : (
            <button onClick={() => { onSuspend(tenant); setOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-[#EFF6F1]" style={{ color: C.green }}>Reactivate</button>
          )}
        </div>
      )}
      <style>{`
        .sa-menu-in { animation: sa-menu 140ms ease-out; }
        @keyframes sa-menu { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function TenantTable({ tenants, onViewDetails, onRequestSuspend, onChangePlan }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-[#E9E3D6] rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9E3D6] bg-[#FBF8F2]">
              {['Restaurant', 'Owner Email', 'Plan', 'Status', 'Users', 'Orders', 'Created', ''].map(h => (
                <th key={h} className="px-4 py-3 text-[10.5px] font-bold tracking-wider text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map(tenant => {
              const pl = PLANS[tenant.plan] || PLANS.starter;
              const st = STATUS[tenant.status] || STATUS.trial;
              return (
                <tr key={tenant.id} className="border-b border-[#F1EEE7] hover:bg-[#FBF8F2] transition-colors duration-150 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[15px] shrink-0" style={{ background: pl.color, fontFamily: "'Bebas Neue', sans-serif" }}>
                        {tenant.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A1815]">{tenant.name}</p>
                        <p className="text-[10.5px] text-[#B9B0A0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tenant.subdomain}.debox.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#4A453D]">{tenant.email || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={tenant.plan}
                      onChange={e => onChangePlan(tenant.id, e.target.value)}
                      className="text-[11px] font-semibold rounded px-1.5 py-1 border-0 outline-none cursor-pointer"
                      style={{ background: pl.bg, color: pl.color }}
                    >
                      {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><Badge color={st.color} bg={st.bg}>{st.label}</Badge></td>
                  <td className="px-4 py-3 text-[12px] tabular-nums text-[#4A453D]">{tenant.userCount || 0}</td>
                  <td className="px-4 py-3 text-[12px] tabular-nums text-[#4A453D]">{(tenant.orderCount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[11px] text-[#B9B0A0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions tenant={tenant} onView={onViewDetails} onSuspend={onRequestSuspend} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2.5">
        {tenants.map(tenant => {
          const pl = PLANS[tenant.plan] || PLANS.starter;
          const st = STATUS[tenant.status] || STATUS.trial;
          return (
            <div key={tenant.id} className="sa-card" onClick={() => onViewDetails(tenant)}>
              <div className="flex gap-3 items-center">
                <div className="w-11 h-11 rounded-md flex items-center justify-center text-white text-[20px] shrink-0" style={{ background: pl.color, fontFamily: "'Bebas Neue', sans-serif" }}>
                  {tenant.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#1A1815]">{tenant.name}</h3>
                  <p className="text-[11px] text-[#B9B0A0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tenant.subdomain}.debox.com</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Badge color={pl.color} bg={pl.bg}>{pl.label}</Badge>
                <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
