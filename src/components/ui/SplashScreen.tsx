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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000000] text-white transition-all duration-200 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-apple-blue/20 blur-[180px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-apple-purple/15 blur-[200px] pointer-events-none -bottom-28" />

      {/* Center Showcase: Only the large prominent Logo & Brand Name (sin contenedores ni box-shadow) */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-scale-in">
        {/* Logo directo sin contenedores adicionales ni box-shadow */}
        <img
          src="/logo-icon.png"
          alt="Urban Style"
          className="w-44 h-44 md:w-56 md:h-56 rounded-[36px] md:rounded-[44px] object-contain"
        />

        {/* Brand Name & Tagline */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white drop-shadow-sm">
            Urban Style
          </h1>
          <p className="text-xs md:text-sm text-[#86868B] font-medium tracking-wide">
            Calzado Deportivo • Plataforma Omnicanal
          </p>
        </div>
      </div>
    </div>
  );
};
