import { useState } from 'react';

interface Reading {
  date: string;
  value: number;
  refLow?: number;
  refHigh?: number;
}

export default function TrendDots({ readings, refLow, refHigh }: { readings: Reading[]; refLow?: number; refHigh?: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (readings.length < 2) return null;

  const values = readings.map(r => r.value);
  const low = refLow ?? Math.min(...values);
  const high = refHigh ?? Math.max(...values);
  const range = high - low || 1;
  const padding = range * 0.3;
  const min = low - padding;
  const max = high + padding;
  const chartH = 32;
  const W = 200;
  const labelH = 14;
  const totalH = chartH + labelH;
  const padX = 16;
  const usableW = W - padX * 2;

  const shortDate = (d: string) =>
    d.replace(' Jul ', '/7').replace(' Feb ', '/2').replace(' Jun ', '/6').replace(' Mar ', '/3').replace(' Sep ', '/9');

  return (
    <div className="mt-2 relative">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${totalH}`}
        className="w-full"
        onMouseLeave={() => setHovered(null)}
      >
        {refLow !== undefined && refHigh !== undefined && (
          <rect
            x={padX}
            y={chartH - ((high - refLow) / (max - min)) * chartH}
            width={usableW}
            height={((refHigh - refLow) / (max - min)) * chartH}
            fill="#d1fae5" rx="2"
          />
        )}
        {readings.map((r, i) => {
          if (i === 0) return null;
          const x1 = padX + ((i - 1) / (readings.length - 1)) * usableW;
          const x2 = padX + (i / (readings.length - 1)) * usableW;
          const prevY = chartH - ((readings[i - 1].value - min) / (max - min)) * chartH;
          const y2 = chartH - ((r.value - min) / (max - min)) * chartH;
          return (
            <line key={i} x1={x1} y1={prevY} x2={x2} y2={y2} stroke={hovered === i || hovered === i - 1 ? '#64748b' : '#cbd5e1'} strokeWidth="1.5" />
          );
        })}
        {readings.map((r, i) => {
          const x = padX + (i / Math.max(1, readings.length - 1)) * usableW;
          const y = chartH - ((r.value - min) / (max - min)) * chartH;
          const isOutOfRange = (refLow !== undefined && r.value < refLow) || (refHigh !== undefined && r.value > refHigh);
          const isHovered = hovered === i;
          return (
            <g key={i}>
              <circle
                cx={x} cy={y} r="8"
                fill="transparent"
                onMouseEnter={(e) => { e.stopPropagation(); setHovered(i); }}
              />
              <circle
                cx={x} cy={y}
                r={isHovered ? 4.5 : 3}
                fill={isOutOfRange ? '#ef4444' : '#0d9488'}
                stroke="white"
                strokeWidth="1.5"
                style={{ transition: 'r 0.15s ease' }}
              />
              <text x={x} y={chartH + 10} textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">
                {shortDate(r.date)}
              </text>
            </g>
          );
        })}
      </svg>
      {hovered !== null && (() => {
        const r = readings[hovered];
        const x = padX + (hovered / Math.max(1, readings.length - 1)) * usableW;
        const yPct = ((r.value - min) / (max - min)) * 100;
        const isOutOfRange = (refLow !== undefined && r.value < refLow) || (refHigh !== undefined && r.value > refHigh);
        return (
          <div
            className="absolute bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: `${(x / W) * 100}%`,
              top: `${Math.max(0, yPct - 8)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold">{r.value}</div>
            <div className="text-slate-300 text-[10px]">{r.date}</div>
            {(refLow !== undefined || refHigh !== undefined) && (
              <div className="text-slate-400 text-[10px]">
                Range: {refLow ?? '?'} – {refHigh ?? '?'}
              </div>
            )}
            {isOutOfRange && (
              <div className={`text-[10px] font-medium ${r.value < refLow! ? 'text-amber-300' : 'text-red-300'}`}>
                {r.value < refLow ? 'Below range' : 'Above range'}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
