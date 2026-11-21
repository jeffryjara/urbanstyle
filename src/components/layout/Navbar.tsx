import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, ShieldCheck, MapPin, Mail } from 'lucide-react';
import type { UserSession } from '../../types';

interface NavbarProps {
  user: UserSession;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative w-full h-16 shrink-0 border-b border-white/10 bg-gradient-to-r from-[#09090b]/95 via-[#0c101c]/90 to-[#09090b]/95 backdrop-blur-2xl z-40 px-4 lg:px-6 flex items-center justify-between overflow-visible">
      {/* Top subtle diffused ambient glow orbs */}
      <div className="absolute -top-12 left-1/4 w-96 h-24 bg-apple-blue/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -top-12 right-1/4 w-80 h-24 bg-apple-purple/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Left: Brand Identity with Subtitle (NO RUC, NO dashboard/terminal pills) */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-apple-blue/25 to-white/[0.04] border border-white/15 p-1.5 flex items-center justify-center shadow-[0_0_18px_rgba(0,122,255,0.3)] shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full text-white" fill="none">
            <path
              d="M10 26C13 26 15 22 20 22C25 22 26 25 31 25C34 25 36 23 37 20L34 14C32 11 29 11 26 14L20 20C17 23 13 23 10 21V26Z"
              fill="url(#nav_logo_grad)"
            />
            <circle cx="15" cy="14" r="2.5" fill="#007AFF" />
            <defs>
              <linearGradient id="nav_logo_grad" x1="10" y1="11" x2="37" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007AFF" />
                <stop offset="1" stopColor="#58A6FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold font-display text-base text-white tracking-tight leading-none">
            Urban Style
          </span>
          <span className="text-[11px] text-[#86868B] font-medium tracking-wide mt-1 leading-none">
            Venta de Calzado Deportivo
          </span>
        </div>
      </div>

      {/* Right: User Profile Pill with Interactive Dropdown (Cerrar Sesión inside) */}
      <div className="relative z-10" ref={menuRef}>
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover border border-white/20"
          />
          <div className="text-left hidden sm:block">
            <span className="text-xs font-semibold text-white block leading-none">
              {user.name}
            </span>
            <span className="text-[10px] text-[#86868B] leading-none mt-0.5">
              {user.title}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#86868B] transition-transform duration-200 ${
              isProfileMenuOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Apple HIG Liquid Glass Profile Popover Menu */}
        {isProfileMenuOpen && (
          <div className="absolute right-0 mt-2.5 w-64 rounded-3xl bg-[#0f1118]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-scale-in text-[#F5F5F7] overflow-hidden">
            {/* Header info inside dropdown */}
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl mb-1.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-apple-blue font-medium truncate">
                    {user.title}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1 text-[11px] text-[#86868B]">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-[#86868B] shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-[#30D158] shrink-0" />
                  <span className="text-[#A1A1A6] truncate">{user.location}</span>
                </div>
              </div>
            </div>

            {/* Logout Option */}
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-medium text-[#FF453A] hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#FF453A]" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
