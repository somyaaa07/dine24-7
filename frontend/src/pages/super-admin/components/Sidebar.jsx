import { NAV_SECTIONS, C } from '../constants/superAdmin.constants';
import { PulseDot } from './StatCard';
import {
  IconGrid, IconStore, IconMapPin, IconUsers, IconGem,
  IconCard, IconWallet, IconChart, IconSettings, IconArrowLeft,
} from './Icons';

const ICONS = {
  grid: IconGrid, store: IconStore, mapPin: IconMapPin, users: IconUsers,
  gem: IconGem, card: IconCard, wallet: IconWallet, chart: IconChart, settings: IconSettings,
};

export default function Sidebar({ tab, setTab, counts, onBack, mobileOpen, onCloseMobile }) {
  const body = (
    <>
      <div className="px-5 py-6 border-b border-[#E9E3D6]">
        <div className="flex items-center gap-2">
          <PulseDot color={C.amber} />
          <span className="text-[10px] tracking-[0.2em] font-bold text-[#A97E44]">DINE24-7</span>
        </div>
        <h1 className="mt-2 text-[27px] text-[#1A1815] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}>
          Control Tower
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.14em] text-[#B9B0A0]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(item => {
                const Icon = ICONS[item.icon];
                const active = tab === item.id;
                const count = item.countKey ? counts?.[item.countKey] : undefined;
                if (!item.implemented) {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-medium text-[#C7BFAE] cursor-not-allowed select-none"
                      title="Coming soon"
                    >
                      <Icon className="w-4 h-4 text-[#DDD5C6]" />
                      {item.label}
                      <span className="ml-auto text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-[#F1EEE7] text-[#B9B0A0]">SOON</span>
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); onCloseMobile?.(); }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-semibold tracking-wide transition-colors duration-150 ${
                      active ? 'bg-[#FBF8F2] text-[#1A1815]' : 'text-[#8B8474] hover:text-[#1A1815] hover:bg-[#FBF8F2]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#A97E44]' : 'text-[#C7BFAE] group-hover:text-[#A97E44]'}`} />
                    {item.label}
                    {count != null && (
                      <span
                        className="ml-auto text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                        style={{ fontFamily: "'JetBrains Mono', monospace", background: active ? '#F1EBDD' : 'transparent', color: active ? C.amber : '#B9B0A0' }}
                      >
                        {count}
                      </span>
                    )}
                    {active && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.amber }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[#E9E3D6]">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11.5px] font-semibold text-[#8B8474] hover:text-[#1A1815] hover:bg-[#FBF8F2] transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" /> My Dashboard
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex w-[240px] shrink-0 bg-white border-r border-[#E9E3D6] flex-col">
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="absolute inset-0 bg-black/40 sa-fade-in" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#E9E3D6] flex flex-col sa-drawer-in">
            {body}
          </aside>
        </div>
      )}

      <style>{`
        .sa-fade-in { animation: sa-fade 180ms ease-out; }
        .sa-drawer-in { animation: sa-drawer-slide 220ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes sa-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sa-drawer-slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
