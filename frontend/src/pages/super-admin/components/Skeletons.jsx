export function ChartSkeleton({ height = 240 }) {
  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg p-5">
      <div className="h-3 w-40 rounded sa-shimmer mb-4" />
      <div className="rounded sa-shimmer" style={{ height }} />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="sa-card">
      <div className="flex gap-3 items-center flex-1">
        <div className="w-11 h-11 rounded-md sa-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-40 rounded sa-shimmer" />
          <div className="h-3 w-24 rounded sa-shimmer" />
        </div>
      </div>
      <div className="h-3 w-20 rounded sa-shimmer" />
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} />)}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="bg-white border border-[#E9E3D6] rounded-lg p-5">
      <div className="h-3 w-48 rounded sa-shimmer mb-4" />
      <div className="rounded-lg sa-shimmer" style={{ height: 380 }} />
    </div>
  );
}
