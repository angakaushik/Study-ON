import React, { useEffect, useState } from 'react';
import { Logo } from './Logo.tsx';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Quick, smooth progress bar that settles in 1.4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1c18] via-[#16271f] to-[#0f1c18] flex flex-col items-center justify-center p-6 text-[#e2e8f0]">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* StudyOn Circular Logo */}
        <div className="relative mb-6">
          <Logo size="2xl" />
        </div>

        {/* App Title & Subtitle */}
        <h1 className="text-3xl font-bold tracking-tight text-[#f0fdf4] mb-1">
          StudyOn
        </h1>
        <p className="text-base font-semibold text-[#5cc79a] tracking-wide mb-8">
          ClassWatch Student Educator
        </p>

        {/* Clean green loading indicator */}
        <div className="w-48 h-1.5 bg-[#1f3d30] rounded-full overflow-hidden shadow-inner mb-6 border border-[#233a30]">
          <div
            className="h-full bg-[#5cc79a] rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(92,199,154,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip button for instant access without waiting */}
        <button
          onClick={onComplete}
          className="text-xs font-medium text-[#94a3b8] hover:text-[#5cc79a] transition-colors py-1.5 px-4 rounded-full border border-[#233a30] bg-[#16271f] shadow-sm cursor-pointer"
        >
          Tap to Open Immediately
        </button>
      </div>
    </div>
  );
};
