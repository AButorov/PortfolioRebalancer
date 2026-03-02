import { useMemo } from "react";
import { usePortfolioStore } from "@/store/portfolioStore";

interface Segment {
  label: string;
  value: number; // percent
  target: number;
  color: string;
}

const PALETTE = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
  "#6366f1", // indigo
];

function buildArcs(
  segments: Segment[],
  cx: number,
  cy: number,
  r: number,
): string[] {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return [];

  const paths: string[] = [];
  let startAngle = -Math.PI / 2;

  for (const seg of segments) {
    const angle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    paths.push(
      `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    );
    startAngle = endAngle;
  }

  return paths;
}

export function PortfolioChart() {
  const { enrichedStocks, enrichedCash, portfolio } = usePortfolioStore();

  const segments: Segment[] = useMemo(() => {
    const result: Segment[] = [];
    let colorIdx = 0;

    for (const s of enrichedStocks) {
      const value =
        s.currentPercent !== null ? s.currentPercent : s.targetPercent;
      result.push({
        label: s.ticker || "?",
        value,
        target: s.targetPercent,
        color: PALETTE[colorIdx++ % PALETTE.length],
      });
    }
    for (const c of enrichedCash) {
      const value =
        c.currentPercent !== null ? c.currentPercent : c.targetPercent;
      result.push({
        label: c.currency || "?",
        value,
        target: c.targetPercent,
        color: PALETTE[colorIdx++ % PALETTE.length],
      });
    }

    return result.filter((s) => s.value > 0);
  }, [enrichedStocks, enrichedCash]);

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">
        Добавьте позиции
      </div>
    );
  }

  const cx = 80;
  const cy = 80;
  const outerR = 65;
  const innerR = 42;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const arcs = buildArcs(segments, cx, cy, outerR);

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        {/* SVG donut */}
        <svg
          width={160}
          height={160}
          viewBox="0 0 160 160"
          className="shrink-0"
        >
          {arcs.map((d, i) => (
            <path key={i} d={d} fill={segments[i].color} opacity={0.85} />
          ))}
          {/* Hole */}
          <circle cx={cx} cy={cy} r={innerR} fill="var(--background)" />
          {/* Center text */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-medium"
            fontSize={10}
            fontFamily="inherit"
          >
            {segments.length}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={8}
            fontFamily="inherit"
            fill="currentColor"
            style={{ fill: "var(--muted-foreground)" }}
          >
            позиций
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-36">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5 min-w-0">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs font-mono truncate">{seg.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums ml-auto pl-2">
                {((seg.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Target vs actual mini bars */}
      {enrichedStocks.some((s) => s.currentPercent !== null) && (
        <div className="space-y-1.5 pt-1 border-t">
          <p className="text-xs text-muted-foreground">Факт vs цель</p>
          {segments.map((seg) => (
            <div key={seg.label} className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="font-mono">{seg.label}</span>
                <span className="tabular-nums">
                  {seg.value.toFixed(1)}% / {seg.target.toFixed(1)}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (seg.value / Math.max(seg.target, 0.01)) * 100)}%`,
                    backgroundColor: seg.color,
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
