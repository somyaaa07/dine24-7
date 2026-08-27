import { useEffect, useState } from 'react';
import { C } from '../constants/superAdmin.constants';

export function AnimatedNumber({ value, prefix = '', duration = 700 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const to = Number(value) || 0;
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{prefix}{display.toLocaleString('en-IN')}</>;
}

export function PulseDot({ color = C.green }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
    </span>
  );
}

// Primary (large) KPI card — used for the four headline metrics.
export function PrimaryStatCard({ label, value, prefix = '', icon: Icon, accent = C.amber, live = false, sub }) {
  return (
    <div className="relative bg-white border border-[#E9E3D6] rounded-lg p-5 overflow-hidden shadow-[0_1px_2px_rgba(26,24,21,0.03)] hover:shadow-[0_4px_14px_rgba(26,24,21,0.06)] transition-shadow duration-200">
      <div className="absolute top-0 left-0 w-[4px] h-full" style={{ background: accent }} />
      <div className="flex items-center justify-between mb-3 pl-1.5">
        <span className="text-[10.5px] font-bold tracking-wider text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</span>
        {live ? <PulseDot color={accent} /> : Icon && <Icon className="w-4 h-4" style={{ color: accent }} />}
      </div>
      <p className="pl-1.5 text-[36px] leading-none text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.01em' }}>
        <AnimatedNumber value={value} prefix={prefix} />
      </p>
      {sub && <p className="pl-1.5 text-[11.5px] text-[#7A7264] mt-2">{sub}</p>}
    </div>
  );
}

// Secondary (small) metric — used for the row of minor counters below the KPIs.
export function SecondaryStatCard({ label, value, accent = C.muted }) {
  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-[11px] font-semibold text-[#7A7264]" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</span>
      <span className="text-[18px] tabular-nums" style={{ fontFamily: "'Bebas Neue', sans-serif", color: accent }}>
        <AnimatedNumber value={value} />
      </span>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="relative bg-white border border-[#E9E3D6] rounded-lg p-5 overflow-hidden">
      <div className="h-2.5 w-16 rounded sa-shimmer mb-4" />
      <div className="h-8 w-20 rounded sa-shimmer" />
    </div>
  );
}
