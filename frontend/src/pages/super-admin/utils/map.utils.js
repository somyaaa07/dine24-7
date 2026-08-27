import L from 'leaflet';
import { CITY_COORDS, CITY_ALIASES, C } from '../constants/superAdmin.constants';

export function normalizeCityName(raw) {
  const cleaned = (raw || '')
    .toLowerCase()
    .replace(/[0-9]/g, '')
    .replace(/\b(india|dist\.?|district)\b/g, '')
    .trim();
  return CITY_ALIASES[cleaned] || cleaned;
}

export function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Custom "ping" bubble marker — a soft gradient circle with a pulsing
// halo behind it, replacing Leaflet's default teardrop pin so the map
// matches the rest of the dashboard's language.
export function createBubbleIcon({ label, color, size }) {
  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      <span style="position:absolute;inset:-8px;border-radius:9999px;background:${color};opacity:0.4;animation:sa-map-pulse 1.8s ease-out infinite;"></span>
      <div style="
        position:relative;width:${size}px;height:${size}px;border-radius:9999px;
        background:linear-gradient(150deg, ${color}, ${color}CC);
        border:2.5px solid #FFFFFF; box-shadow:0 4px 12px rgba(26,24,21,0.3);
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-family:'JetBrains Mono',monospace;font-weight:700;
        font-size:${Math.max(10, Math.round(size * 0.34))}px;">
        ${label}
      </div>
    </div>
  `;
  return L.divIcon({ html, className: 'sa-map-bubble', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

/**
 * Groups branches into map markers.
 *
 * Preferred path: branch.latitude / branch.longitude, when the backend
 * provides them — each branch becomes (or joins) a marker keyed by
 * rounded coordinates, no address parsing needed.
 *
 * Fallback path (current data shape): parse the last comma-segment of
 * branch.address as a city name and resolve it against CITY_COORDS.
 * Anything unresolved is pooled into "Other Locations" near India's
 * geographic centre, flagged with resolved:false so the UI can say so.
 */
export function groupBranchesForMap(branches) {
  const groups = {};

  const pushInto = (groupKey, seed, branch) => {
    if (!groups[groupKey]) {
      groups[groupKey] = { ...seed, branches: [], orderCount: 0, revenue: 0, activeCount: 0 };
    }
    groups[groupKey].branches.push(branch);
    groups[groupKey].orderCount += branch.orderCount || 0;
    groups[groupKey].revenue += Number(branch.revenue || 0);
    if (branch.is_active) groups[groupKey].activeCount += 1;
  };

  branches.forEach(b => {
    if (b.latitude != null && b.longitude != null) {
      const lat = Number(b.latitude), lng = Number(b.longitude);
      const groupKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
      pushInto(groupKey, { city: b.city || b.name, lat, lng, resolved: true }, b);
      return;
    }
    const parts = (b.address || '').split(',').map(s => s.trim()).filter(Boolean);
    const rawCity = parts.length ? parts[parts.length - 1] : 'Unknown';
    const key = normalizeCityName(rawCity);
    const coords = CITY_COORDS[key];
    const groupKey = coords ? key : 'other';
    pushInto(groupKey, {
      city: coords ? toTitleCase(key) : 'Other Locations',
      lat: coords ? coords[0] : 22.9734,
      lng: coords ? coords[1] : 78.6569,
      resolved: !!coords,
    }, b);
  });

  return Object.values(groups).sort((a, b) => b.orderCount - a.orderCount);
}

export function markerColorFor(group) {
  const allActive = group.activeCount === group.branches.length;
  const noneActive = group.activeCount === 0;
  return noneActive ? C.red : allActive ? C.green : C.warn;
}

export function markerSizeFor(group) {
  return Math.min(56, Math.max(26, 20 + Math.sqrt(group.orderCount || 1) * 4.5));
}
