import { C } from '../constants/superAdmin.constants';

// Controlled by the parent's existing showMsg()/msg state — this component
// only renders it, as a compact bottom-right toast instead of a banner.
export default function Toast({ toast }) {
  if (!toast?.text) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div className="fixed bottom-5 right-5 z-[100] sa-toast-in" style={{ maxWidth: 360 }}>
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-lg border shadow-[0_10px_30px_rgba(26,24,21,0.16)]"
        style={{
          background: '#FFFFFF',
          borderColor: isSuccess ? C.greenBorder : C.redBorder,
        }}
      >
        <span
          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: isSuccess ? C.greenBg : C.redBg, color: isSuccess ? C.green : C.red }}
        >
          {isSuccess ? '✓' : '×'}
        </span>
        <p className="text-[12.5px] leading-snug font-medium" style={{ color: C.ink, fontFamily: "'Inter', sans-serif" }}>
          {toast.text}
        </p>
      </div>
      <style>{`
        .sa-toast-in { animation: sa-toast-slide 220ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes sa-toast-slide {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}
