import { C, PLANS, STATUS, ALL_FEATURES, PLAN_FEATURES } from '../constants/superAdmin.constants';

function Badge({ color, bg, children }) {
  return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>{children}</span>;
}

function GhostBtn({ children, onClick, color, bg, border, active }) {
  return (
    <button onClick={onClick} className="sa-nav-btn" style={{ background: active ? color : bg, color: active ? '#fff' : color, borderColor: border || color }}>
      {children}
    </button>
  );
}

export default function TenantDrawer({ tenant, onClose, onChangePlan, onRequestStatusChange }) {
  if (!tenant) return null;
  const pl = PLANS[tenant.plan] || PLANS.starter;
  const st = STATUS[tenant.status] || STATUS.trial;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40 sa-fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-[#F7F5F0] border-l border-[#E9E3D6] overflow-y-auto sa-drawer-in-right">
        <div className="flex justify-between items-start px-6 py-5 border-b border-[#E9E3D6] sticky top-0 bg-[#F7F5F0] z-10">
          <div>
            <h2 className="text-[24px] text-[#1A1815] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{tenant.name?.toUpperCase()}</h2>
            <div className="flex gap-1.5 mt-2">
              <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
              <Badge color={pl.color} bg={pl.bg}>{pl.label}</Badge>
            </div>
          </div>
          <button onClick={onClose} className="text-[#7A7264] hover:text-[#1A1815] text-lg leading-none">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Users', tenant.userCount ?? tenant.stats?.users ?? 0],
              ['Branches', tenant.branchCount ?? tenant.stats?.branches ?? '—'],
              ['Orders', tenant.orderCount ?? tenant.stats?.orders ?? 0],
              ['Revenue', tenant.revenue != null ? `₹${Number(tenant.revenue).toLocaleString('en-IN')}` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-white border border-[#E9E3D6] rounded-lg px-3.5 py-3">
                <p className="text-[10px] font-bold tracking-wide text-[#B9B0A0] uppercase">{label}</p>
                <p className="text-[19px] text-[#1A1815] mt-0.5" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{val}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-1.5">Subdomain</p>
            <p className="text-[13px] text-[#1A1815]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tenant.subdomain}.debox.com</p>
            {tenant.email && <p className="text-[12px] text-[#7A7264] mt-1">{tenant.email}</p>}
          </div>

          <div className="border-t border-[#E9E3D6] pt-5">
            <h4 className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-2.5">Subscription — features update automatically</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLANS).map(([key, plan]) => (
                <GhostBtn key={key} color={plan.color} bg={plan.bg} active={tenant.plan === key} onClick={() => onChangePlan(tenant.id, key)}>
                  {plan.label} · {plan.price}
                </GhostBtn>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E9E3D6] pt-5">
            <h4 className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-2.5">Account Status</h4>
            <div className="flex flex-wrap gap-2">
              <GhostBtn color={C.green} bg={C.greenBg} border={C.greenBorder} active={tenant.status === 'active'} onClick={() => onRequestStatusChange(tenant, 'active')}>Activate</GhostBtn>
              <GhostBtn color={C.warn} bg={C.warnBg} border={C.warnBorder} active={tenant.status === 'trial'} onClick={() => onRequestStatusChange(tenant, 'trial')}>Trial</GhostBtn>
              <GhostBtn color={C.red} bg={C.redBg} border={C.redBorder} active={tenant.status === 'suspended'} onClick={() => onRequestStatusChange(tenant, 'suspended')}>Suspend</GhostBtn>
            </div>
          </div>

          <div className="border-t border-[#E9E3D6] pt-5">
            <h4 className="text-[11px] font-bold tracking-wide text-[#7A7264] uppercase mb-2.5">Features in the {pl.label} plan</h4>
            <div className="flex flex-wrap gap-1.5">
              {ALL_FEATURES.map(f => {
                const has = (PLAN_FEATURES[tenant.plan] || []).includes(f);
                return (
                  <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: has ? C.greenBg : '#F1EEE7', color: has ? C.green : C.faint }}>
                    {has ? '✓' : '·'} {f}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .sa-fade-in { animation: sa-fade 180ms ease-out; }
        .sa-drawer-in-right { animation: sa-drawer-right 240ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes sa-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sa-drawer-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
