import { C } from '../constants/superAdmin.constants';

/**
 * props.config shape: { title, body, confirmLabel, danger, onConfirm } | null
 * Rendered once near the root; callers open it via a small piece of state,
 * e.g. setConfirm({ title: 'Suspend Restaurant?', body: '...', onConfirm: fn }).
 */
export default function ConfirmDialog({ config, onClose }) {
  if (!config) return null;
  const { title, body, confirmLabel = 'Confirm', danger = true } = config;

  const handleConfirm = async () => {
    await config.onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90] p-4 sa-fade-in" onClick={onClose}>
      <div
        className="bg-white border border-[#E9E3D6] rounded-lg w-[420px] max-w-full p-6 shadow-[0_20px_60px_rgba(26,24,21,0.25)] sa-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[19px] text-[#1A1815]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{title}</h3>
        <p className="text-[13px] text-[#7A7264] mt-2 leading-relaxed">{body}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="sa-nav-btn">Cancel</button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-[4px] text-[11px] font-bold tracking-wide"
            style={{ background: danger ? C.red : C.ink, color: '#fff' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        .sa-fade-in { animation: sa-fade 180ms ease-out; }
        .sa-slide-up { animation: sa-slide-up 200ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes sa-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sa-slide-up { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
