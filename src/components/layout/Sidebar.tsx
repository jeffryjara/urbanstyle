import React, { useState } from 'react';
import {
  TrendingUp,
  Store,
  Package,
  LogOut,
} from 'lucide-react';
import { StockModal } from '../ui/StockModal';
import type { UserSession } from '../../types';

interface SidebarProps {
  user: UserSession;
  onLogout: () => void;
  currentView: 'dashboard' | 'pos';
  onViewChange: (view: 'dashboard' | 'pos') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  currentView,
  onViewChange,
}) => {
  const [isStockOpen, setIsStockOpen] = useState(false);

  return (
    <>
      <aside className="relative w-64 min-w-[256px] max-w-[256px] shrink-0 h-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#12141c]/90 via-[#0c0d14]/85 to-[#0a0a0f]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between p-4 hidden lg:flex overflow-hidden">
        {/* Soft diffused glow orbs behind the glass */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-apple-blue/15 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-apple-purple/15 rounded-full blur-[80px] pointer-events-none" />

        {/* TOP SECTION: Brand Identity & Navigation */}
        <div className="relative z-10 flex flex-col">
          {/* Brand Identity moved from Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-white/10 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/15 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(0,122,255,0.25)] shrink-0 overflow-hidden">
              <img
                src="/logo-icon.png"
                alt="Urban Style"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold font-display text-lg text-white tracking-tight leading-tight truncate">
                Urban Style
              </span>
              <span className="text-xs text-[#86868B] font-medium tracking-wide mt-0.5 leading-tight truncate">
                Venta de Calzado
              </span>
            </div>
          </div>

          {/* Section 1: Vistas Principales */}
          <div className="space-y-4">
            <div>
              <div className="px-2.5 mb-2.5">
                <span className="text-xs font-bold text-[#A1A1A6] uppercase tracking-wider">
                  Vistas de Pantalla
                </span>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'bg-apple-blue text-white shadow-apple-glow font-semibold border border-apple-blueLight/30'
                      : 'text-[#86868B] hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <TrendingUp className="w-4.5 h-4.5" />
                    <span>Dashboard</span>
                  </span>
                  {currentView === 'dashboard' && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>

                <button
                  onClick={() => onViewChange('pos')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    currentView === 'pos'
                      ? 'bg-apple-blue text-white shadow-apple-glow font-semibold border border-apple-blueLight/30'
                      : 'text-[#86868B] hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Store className="w-4.5 h-4.5" />
                    <span>Terminal POS</span>
                  </span>
                  {currentView === 'pos' && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              </nav>
            </div>

            {/* Section 2: Inventario & Stock (Opción 2) */}
            <div className="pt-3 border-t border-white/10">
              <div className="px-2.5 mb-2.5">
                <span className="text-xs font-bold text-[#A1A1A6] uppercase tracking-wider">
                  Almacén
                </span>
              </div>

              <button
                onClick={() => setIsStockOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-sm font-medium border border-white/5 transition-all duration-200 cursor-pointer group"
              >
                <span className="flex items-center gap-3">
                  <Package className="w-4.5 h-4.5 text-apple-blueLight group-hover:scale-110 transition-transform" />
                  <span>Inventario & Stock</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: User Profile & Logout moved from Header */}
        <div className="pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-[#86868B] truncate leading-tight mt-0.5">
                  {user.title}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl text-[#86868B] hover:text-[#FF453A] hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Interactive Stock Modal with Viewport Centering */}
      <StockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} />
    </>
  );
};
