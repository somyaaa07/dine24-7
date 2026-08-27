import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { C } from '../constants/superAdmin.constants';
import { groupBranchesForMap, markerColorFor, markerSizeFor, createBubbleIcon } from '../utils/map.utils';

export default function BranchMap({ branches }) {
  const cityGroups = useMemo(() => groupBranchesForMap(branches), [branches]);

  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg p-5 shadow-[0_1px_2px_rgba(26,24,21,0.03)]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-[12px] font-bold tracking-wide text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Branch Distribution</h3>
        <span className="text-[10.5px] text-[#B9B0A0]">Bubble size = order volume · color = branch health</span>
      </div>
      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        <div className="w-full lg:w-[62%] rounded-lg overflow-hidden border border-[#E9E3D6]" style={{ height: 380 }}>
          <MapContainer center={[22.9734, 78.6569]} zoom={4.4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: C.surfaceRaised }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {cityGroups.map(g => {
              const color = markerColorFor(g);
              const size = markerSizeFor(g);
              const icon = createBubbleIcon({ label: g.branches.length, color, size });
              return (
                <Marker key={g.city + g.lat + g.lng} position={[g.lat, g.lng]} icon={icon}>
                  <Popup closeButton={false} offset={[0, -size / 2]}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 150 }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <strong style={{ fontSize: 13, color: C.ink }}>{g.city}</strong>
                      </div>
                      <p style={{ fontSize: 11, color: C.muted, margin: '2px 0' }}>
                        {g.branches.length} branch{g.branches.length !== 1 ? 'es' : ''} · {g.activeCount} active
                      </p>
                      <p style={{ fontSize: 11, color: C.muted, margin: '2px 0' }}>
                        ₹{g.revenue.toLocaleString('en-IN')} · {g.orderCount} orders
                      </p>
                      {!g.resolved && <p style={{ fontSize: 10, color: C.faint, margin: '4px 0 0', fontStyle: 'italic' }}>location approximate</p>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <div className="flex-1 min-w-[220px] space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {cityGroups.map(g => (
            <div key={g.city + g.lat + g.lng} className="flex items-center justify-between text-[12px] px-3 py-2.5 rounded-lg bg-[#FBF8F2] border border-[#E9E3D6]">
              <div>
                <p className="text-[#1A1815] font-semibold">{g.city}</p>
                <p className="text-[#B9B0A0] text-[10px]">{g.branches.length} branch{g.branches.length !== 1 ? 'es' : ''} · {g.activeCount} active</p>
              </div>
              <div className="text-right">
                <p className="font-bold tabular-nums" style={{ color: C.green }}>₹{g.revenue.toLocaleString('en-IN')}</p>
                <p className="text-[#B9B0A0] text-[10px]">{g.orderCount} orders</p>
              </div>
            </div>
          ))}
          {cityGroups.length === 0 && <p className="text-[#B9B0A0] text-[12px]">No branches yet</p>}
        </div>
      </div>
    </div>
  );
}
