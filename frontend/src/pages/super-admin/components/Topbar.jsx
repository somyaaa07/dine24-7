import { C } from '../constants/superAdmin.constants';
import { PulseDot } from './StatCard';
import { IconSearch, IconBell, IconGrid } from './Icons';

export default function Topbar({ title, globalQuery, setGlobalQuery, onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#E9E3D6]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-3.5 flex items-center gap-4">
        <button onClick={onOpenMobileNav} className="md:hidden w-8 h-8 flex items-center justify-center rounded-md border border-[#E9E3D6] text-[#4A453D]">
          <IconGrid className="w-4 h-4" />
        </button>

        <div className="shrink-0">
          <span className="text-[9.5px] font-bold tracking-[0.16em] text-[#A97E44]" style={{ fontFamily: "'Inter', sans-serif" }}>SUPER ADMIN</span>
          <h2 className="text-[19px] text-[#1A1815] leading-none mt-0.5" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}>
            {title}
          </h2>
        </div>

        <div className="flex-1 hidden sm:flex justify-center px-4">
          <label className="relative w-full max-w-[420px]">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B9B0A0]" />
            <input
              value={globalQuery}
              onChange={e => setGlobalQuery(e.target.value)}
              placeholder="Search restaurants, users, branches…"
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#E9E3D6] bg-[#FBF8F2] text-[12.5px] outline-none focus:border-[#A97E44] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </label>
        </div>

        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E9E3D6]">
            <PulseDot color={C.green} />
            <span className="text-[9.5px] font-bold tracking-wider" style={{ color: C.green }}>LIVE</span>
          </div>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FBF8F2] text-[#4A453D] transition-colors" title="Notifications">
            <IconBell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: C.ink, fontFamily: "'Inter', sans-serif" }}>
            A
          </div>
        </div>
      </div>
    </header>
  );
}
