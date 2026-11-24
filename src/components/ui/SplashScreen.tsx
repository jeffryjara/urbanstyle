import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Quick & snappy entry: ~700ms display, then smooth 200ms fade-out (resta ~1 segundo a la animación anterior)
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onFinish();
      }, 200);
    }, 700);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070709] text-white transition-all duration-300 ease-spring ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Center Showcase: Pure Prominent Logo & Brand Name */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 animate-scale-in">
        <img
          src="/logo-icon.png"
          alt="Urban Style"
          className="w-44 h-44 md:w-56 md:h-56 rounded-[38px] md:rounded-[46px] object-contain"
        />

        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
          Urban Style
        </h1>
      </div>
    </div>
  );
};
