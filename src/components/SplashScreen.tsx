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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100/70 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* StudyOn Circular Logo */}
        <div className="relative mb-6">
          <Logo size="2xl" />
        </div>

        {/* App Title & Subtitle */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
          StudyOn
        </h1>
        <p className="text-base font-semibold text-sky-700 tracking-wide mb-8">
          Student Educator
        </p>

        {/* Clean minimal loading indicator */}
        <div className="w-48 h-1.5 bg-sky-100 rounded-full overflow-hidden shadow-inner mb-6">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip button for instant access without waiting */}
        <button
          onClick={onComplete}
          className="text-xs font-medium text-slate-500 hover:text-sky-800 transition-colors py-1.5 px-4 rounded-full border border-sky-200/80 bg-white/70 shadow-sm"
        >
          Tap to Open Immediately
        </button>
      </div>
    </div>
  );
};
