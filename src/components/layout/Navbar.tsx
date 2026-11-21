import React from 'react';
import { LogOut, Store, TrendingUp } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import type { UserSession } from '../../types';

interface NavbarProps {
  user: UserSession;
  currentView: 'dashboard' | 'pos';
  onViewChange: (view: 'dashboard' | 'pos') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onViewChange,
  onLogout,
}) => {
  return (
    <header className="w-full h-16 border-b border-white/10 bg-[#09090b]/85 backdrop-blur-2xl sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/15 to-white/[0.03] border border-white/15 p-1.5 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 40 40" className="w-full h-full text-white" fill="none">
              <path
                d="M10 26C13 26 15 22 20 22C25 22 26 25 31 25C34 25 36 23 37 20L34 14C32 11 29 11 26 14L20 20C17 23 13 23 10 21V26Z"
                fill="url(#nav_grad)"
              />
              <circle cx="15" cy="14" r="2.5" fill="#007AFF" />
              <defs>
                <linearGradient id="nav_grad" x1="10" y1="11" x2="37" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#007AFF" />
                  <stop offset="1" stopColor="#58A6FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold font-display text-base text-white tracking-tight">
              Urban Style
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-[#86868B] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
              RUC 10449598569
            </span>
          </div>
        </div>

        {/* Center-Left: Segmented Switcher for View */}
        <div className="hidden sm:inline-flex rounded-full bg-white/[0.06] border border-white/10 p-1">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-apple-blue" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onViewChange('pos')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'pos'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Terminal POS</span>
          </button>
        </div>
      </div>

      {/* Right: Active User Pill & Logout Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover border border-white/20"
          />
          <div className="text-left hidden md:block">
            <span className="text-xs font-medium text-white block leading-none">
              {user.name}
            </span>
            <span className="text-[10px] text-[#86868B] leading-none">
              {user.title}
            </span>
          </div>
        </div>

        <GlassButton
          variant="glass"
          size="sm"
          onClick={onLogout}
          icon={<LogOut className="w-3.5 h-3.5" />}
          title="Cerrar Sesión"
        >
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </GlassButton>
      </div>
    </header>
  );
};
