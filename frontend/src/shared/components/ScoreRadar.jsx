import { memo } from 'react';

/**
 * ScoreRadar — 4-axis SVG polygon chart
 * Dimensions: Local Sourcing, Zero-Plastic Packaging, Low Carbon Footprint, Water/Soil Stewardship
 */
const ScoreRadar = memo(({ baseScore = 8.5 }) => {
    // Derive deterministic scores based on the product's base sustainability score
    const score = Math.max(1, Math.min(10, Number(baseScore) || 8.5));

    const dimensions = [
        { label: 'Local Sourcing', value: Math.min(10, +(score * 0.98).toFixed(1)), desc: 'Proximity & direct community harvest' },
        { label: 'Zero-Plastic', value: Math.min(10, +(score * 1.02).toFixed(1)), desc: '100% biodegradable or circular wrapping' },
        { label: 'Carbon Offset', value: Math.min(10, +(score * 0.94).toFixed(1)), desc: 'Low transportation footprint' },
        { label: 'Soil & Water', value: Math.min(10, +(score * 0.96).toFixed(1)), desc: 'Chemical-free and regenerative care' },
    ];

    const size = 200;
    const center = size / 2;
    const radius = 70;

    // Angles for 4 axes (0, 90, 180, 270 degrees)
    const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

    // Web background rings
    const ringLevels = [0.25, 0.5, 0.75, 1.0];

    // Compute polygon points for the current values
    const points = dimensions.map((d, i) => {
        const r = (d.value / 10) * radius;
        const x = center + r * Math.cos(angles[i]);
        const y = center + r * Math.sin(angles[i]);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                <div>
                    <h4 className="text-sm font-bold font-display text-[var(--text-main)]">
                        Sustainability Lifecycle Breakdown
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-sans">
                        Multi-dimensional impact assessment across 4 ecological axes
                    </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    AVG: {score.toFixed(1)}/10
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* SVG Radar */}
                <div className="sm:col-span-6 flex items-center justify-center">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                        {/* Background Web Rings */}
                        {ringLevels.map((lvl, idx) => {
                            const r = lvl * radius;
                            const ringPts = angles.map(a => `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`).join(' ');
                            return (
                                <polygon
                                    key={idx}
                                    points={ringPts}
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth={0.75}
                                    className="text-black/10 dark:text-white/10"
                                />
                            );
                        })}

                        {/* Axis lines */}
                        {angles.map((a, idx) => (
                            <line
                                key={idx}
                                x1={center}
                                y1={center}
                                x2={center + radius * Math.cos(a)}
                                y2={center + radius * Math.sin(a)}
                                stroke="currentColor"
                                strokeWidth={0.75}
                                className="text-black/10 dark:text-white/10"
                            />
                        ))}

                        {/* Value Polygon */}
                        <polygon
                            points={points}
                            fill="rgba(16, 185, 129, 0.25)"
                            stroke="#10b981"
                            strokeWidth={2}
                            style={{ transition: 'all 0.5s ease' }}
                        />

                        {/* Points */}
                        {dimensions.map((d, i) => {
                            const r = (d.value / 10) * radius;
                            const x = center + r * Math.cos(angles[i]);
                            const y = center + r * Math.sin(angles[i]);
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r={3.5}
                                    fill="#10b981"
                                    stroke="#041c15"
                                    strokeWidth={1.5}
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* Legend & Text Breakdown */}
                <div className="sm:col-span-6 space-y-2.5">
                    {dimensions.map((dim, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <div>
                                <span className="font-semibold text-[var(--text-main)] block">{dim.label}</span>
                                <span className="text-xs text-[var(--text-muted)] font-sans">{dim.desc}</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 pl-2">
                                {dim.value}/10
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default ScoreRadar;
