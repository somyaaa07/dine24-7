import { C } from '../constants/superAdmin.constants';

export default function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-lg border border-[#E9E3D6]">
      {icon && (
        <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: C.surfaceRaised, color: C.faint }}>
          {icon}
        </div>
      )}
      <p className="text-[15px] font-semibold text-[#1A1815]">{title}</p>
      {description && <p className="text-[12.5px] text-[#7A7264] mt-1.5 max-w-[320px] mx-auto leading-relaxed">{description}</p>}
      {actionLabel && (
        <button onClick={onAction} className="sa-primary-btn mt-4">{actionLabel}</button>
      )}
    </div>
  );
}
