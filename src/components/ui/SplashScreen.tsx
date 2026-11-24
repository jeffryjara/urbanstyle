import React, { useEffect, useState } from 'react';
import type { UserSession } from '../../types';

interface SplashScreenProps {
  onFinish: () => void;
  user?: UserSession | null;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, user }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // High-precision smooth progress animation over 1.6s
    const startTime = performance.now();
    const duration = 1650;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 320); // Smooth 320ms crossfade into main content
      }
    };

    const animFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrame);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000000] text-white transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute w-[520px] h-[520px] rounded-full bg-apple-blue/15 blur-[160px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute w-[440px] h-[440px] rounded-full bg-apple-purple/10 blur-[180px] pointer-events-none -bottom-24" />

      {/* Center Showcase */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        {/* Animated App Icon with subtle Liquid Glass Glow */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-r from-apple-blue via-apple-blueLight to-apple-purple opacity-30 blur-xl animate-pulse-subtle" />
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-[28px] overflow-hidden border border-white/20 bg-[#0a0b12]/90 backdrop-blur-2xl p-2.5 shadow-[0_20px_60px_rgba(0,122,255,0.3)] flex items-center justify-center animate-scale-in">
            <img
              src="/logo-icon.png"
              alt="Urban Style"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1.5 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white">
            Urban Style
          </h1>
          <p className="text-xs md:text-sm text-[#86868B] font-medium tracking-wide">
            Calzado Deportivo • Plataforma Omnicanal
          </p>
        </div>

        {/* Minimalist Apple Progress Bar */}
        <div className="w-52 space-y-2 pt-2">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-apple-blue via-apple-blueLight to-[#30D158] rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center text-[11px] font-mono text-[#86868B]">
            {progress < 85 ? (
              <span>Cargando plataforma... {progress}%</span>
            ) : (
              <span className="text-apple-emerald flex items-center gap-1.5 font-semibold">
                <span>Iniciando sesión {user ? `• ${user.name.split(' ')[0]}` : ''}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
