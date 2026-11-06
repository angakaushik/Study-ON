import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showSubtitle = false }) => {
  const sizeMap = {
    sm: { box: 36, fontSize: 13, circleSize: 'w-9 h-9' },
    md: { box: 48, fontSize: 17, circleSize: 'w-12 h-12' },
    lg: { box: 72, fontSize: 26, circleSize: 'w-18 h-18' },
    xl: { box: 96, fontSize: 34, circleSize: 'w-24 h-24' },
    '2xl': { box: 128, fontSize: 46, circleSize: 'w-32 h-32' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Clean circular logo in deep emerald & mint gradient */}
      <div
        className={`${current.circleSize} rounded-full flex items-center justify-center shadow-lg shadow-[#5cc79a]/20 transition-transform select-none shrink-0 border border-[#5cc79a]/40`}
        style={{
          background: 'linear-gradient(135deg, #1f3d30 0%, #16271f 50%, #0f1c18 100%)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle clean inner ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="rgba(92, 199, 154, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Handwritten style text "StudyOn" rendered in mint emerald */}
          <text
            x="50"
            y="56"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#5cc79a"
            fontFamily="'Caveat', cursive"
            fontWeight="700"
            fontSize="32"
            letterSpacing="-0.5px"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
            }}
          >
            StudyOn
          </text>
        </svg>
      </div>

      {showSubtitle && (
        <div className="mt-3 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#f0fdf4]">StudyOn</h1>
          <p className="text-sm font-medium text-[#5cc79a] tracking-wide">ClassWatch Student Educator</p>
        </div>
      )}
    </div>
  );
};
