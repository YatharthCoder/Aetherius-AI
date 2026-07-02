import React from 'react';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  glow?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  size = 32,
  strokeWidth = 3,
  children,
  glow = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          className="text-slate-800"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress stroke with glowing shadow if enabled */}
        <circle
          className="text-orange-500 transition-all duration-500 ease-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={glow ? { filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))' } : undefined}
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
