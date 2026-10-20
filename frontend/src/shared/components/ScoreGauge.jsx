import { memo } from 'react';

/**
 * ScoreGauge — Radial SVG gauge (0–10) with animated stroke-dashoffset
 * Variants: 'sm' (40px), 'md' (70px), 'lg' (110px)
 */
const ScoreGauge = memo(({ score = 0, size = 'sm', showLabel = true }) => {
    const numericScore = Math.max(0, Math.min(10, Number(score) || 0));
    const normalized = numericScore / 10; // 0 to 1

    // Size mappings
    const dimensions = {
        sm: { size: 42, stroke: 3.5, fontSize: '11px', labelSize: '8px' },
        md: { size: 72, stroke: 5, fontSize: '18px', labelSize: '10px' },
        lg: { size: 110, stroke: 7, fontSize: '28px', labelSize: '12px' },
    }[size] || { size: 42, stroke: 3.5, fontSize: '11px', labelSize: '8px' };

    const radius = (dimensions.size - dimensions.stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - normalized * circumference;

    // Semantic Color Calibration
    const getStrokeColor = (s) => {
        if (s >= 8.5) return '#10b981'; // Vibrant emerald
        if (s >= 7.0) return '#059669'; // Forest emerald
        if (s >= 5.0) return '#34d399'; // Sage green
        return '#f59e0b'; // Amber alert
    };

    const strokeColor = getStrokeColor(numericScore);

    return (
        <div className="inline-flex flex-col items-center justify-center relative" style={{ width: dimensions.size, height: dimensions.size }}>
            <svg
                width={dimensions.size}
                height={dimensions.size}
                className="transform -rotate-90"
                aria-label={`Sustainability score: ${numericScore.toFixed(1)} out of 10`}
                role="img"
            >
                {/* Background Ring */}
                <circle
                    cx={dimensions.size / 2}
                    cy={dimensions.size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={dimensions.stroke}
                    className="text-black/10 dark:text-white/10"
                />
                {/* Animated Value Ring */}
                <circle
                    cx={dimensions.size / 2}
                    cy={dimensions.size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth={dimensions.stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
            </svg>

            {/* Centered Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono leading-none">
                <span
                    className="font-bold text-[var(--text-main)]"
                    style={{ fontSize: dimensions.fontSize }}
                >
                    {numericScore.toFixed(1)}
                </span>
                {showLabel && size !== 'sm' && (
                    <span
                        className="text-[var(--text-muted)] font-mono uppercase tracking-widest mt-0.5"
                        style={{ fontSize: dimensions.labelSize }}
                    >
                        ECO
                    </span>
                )}
            </div>
        </div>
    );
});

export default ScoreGauge;
