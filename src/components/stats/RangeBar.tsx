export default function RangeBar({ value, refLow, refHigh }: { value: number; refLow?: number; refHigh?: number }) {
  if (refLow === undefined && refHigh === undefined) return null;

  const low = refLow ?? 0;
  const high = refHigh ?? (low * 2 || 100);
  const range = high - low;
  const padding = range * 0.3;
  const min = low - padding;
  const max = high + padding;

  const pos = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const lowPos = ((low - min) / (max - min)) * 100;
  const highPos = ((high - min) / (max - min)) * 100;

  return (
    <div className="mt-2 mb-1">
      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-visible">
        <div
          className="absolute h-full bg-emerald-200 rounded-full"
          style={{ left: `${lowPos}%`, width: `${highPos - lowPos}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
            value < low ? 'bg-amber-500' : value > high ? 'bg-red-500' : 'bg-emerald-500'
          }`}
          style={{ left: `${pos}%`, marginLeft: '-5px' }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-slate-400">{refLow ?? '?'}</span>
        <span className="text-[10px] text-slate-400">{refHigh ?? '?'}</span>
      </div>
    </div>
  );
}
