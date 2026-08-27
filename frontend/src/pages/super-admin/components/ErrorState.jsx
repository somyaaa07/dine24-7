import { C } from '../constants/superAdmin.constants';
import { IconAlert } from './Icons';

export default function ErrorState({ title = 'Unable to load data', description = 'Something went wrong while fetching data.', onRetry }) {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-lg border" style={{ borderColor: C.redBorder }}>
      <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: C.redBg, color: C.red }}>
        <IconAlert className="w-5 h-5" />
      </div>
      <p className="text-[15px] font-semibold text-[#1A1815]">{title}</p>
      <p className="text-[12.5px] text-[#7A7264] mt-1.5">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="sa-nav-btn mt-4">Retry</button>
      )}
    </div>
  );
}
