import React, { useState } from 'react';
import {
  TrendingUp,
  Store,
  Package,
  LogOut,
  Terminal,
} from 'lucide-react';
import { StockModal } from '../ui/StockModal';
import { ScriptModal } from '../ui/ScriptModal';
import type { UserSession, Product } from '../../types';

interface SidebarProps {
  user: UserSession;
  onLogout: () => void;
  currentView: 'dashboard' | 'pos';
  onViewChange: (view: 'dashboard' | 'pos') => void;
  products?: Product[];
  onDatabaseMutated?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  currentView,
  onViewChange,
  products,
  onDatabaseMutated,
}) => {
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);

  return (
    <>
      <aside className="relative w-72 min-w-[288px] max-w-[288px] shrink-0 h-full border-r border-white/[0.06] bg-[#0b0c10] flex flex-col justify-between p-6 hidden lg:flex overflow-hidden z-20">
        {/* TOP SECTION: Brand Identity & Primary Views */}
        <div className="relative z-10 flex flex-col">
          {/* Brand Identity: Direct logo without extra containers, rounded corners */}
          <div className="flex items-center gap-4 pb-7 border-b border-white/[0.06] mb-7 px-1">
            <img
              src="/logo-icon.png"
              alt="Urban Style"
              className="w-11 h-11 rounded-2xl object-contain shrink-0"
            />
            <span className="font-extrabold text-xl font-display text-white tracking-tight">
              Urban Style
            </span>
          </div>

          {/* Primary Views */}
          <nav className="space-y-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer active:scale-[0.98] ${
                currentView === 'dashboard'
                  ? 'bg-apple-blue text-white shadow-apple-glow'
                  : 'text-[#86868B] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <TrendingUp className="w-5 h-5" />
                <span>Dashboard</span>
              </span>
              {currentView === 'dashboard' && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>

            <button
              onClick={() => onViewChange('pos')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer active:scale-[0.98] ${
                currentView === 'pos'
                  ? 'bg-apple-blue text-white shadow-apple-glow'
                  : 'text-[#86868B] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <Store className="w-5 h-5" />
                <span>Terminal POS</span>
              </span>
              {currentView === 'pos' && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>
          </nav>
        </div>

        {/* BOTTOM SECTION: Script + Inventario + Divider Below + User Profile */}
        <div className="mt-auto relative z-10 space-y-2.5">
          {/* Script Button (Above Inventario) */}
          <button
            onClick={() => setIsScriptOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[#A1A1A6] hover:text-white bg-white/[0.02] hover:bg-white/[0.06] text-base font-semibold border border-white/[0.05] transition-all duration-300 ease-spring cursor-pointer active:scale-[0.98] group"
          >
            <span className="flex items-center gap-3.5">
              <Terminal className="w-5 h-5 text-apple-emerald group-hover:scale-110 transition-transform duration-300 ease-spring" />
              <span>Script</span>
            </span>
          </button>

          {/* Inventario Button */}
          <button
            onClick={() => setIsStockOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[#A1A1A6] hover:text-white bg-white/[0.02] hover:bg-white/[0.06] text-base font-semibold border border-white/[0.05] transition-all duration-300 ease-spring cursor-pointer active:scale-[0.98] group"
          >
            <span className="flex items-center gap-3.5">
              <Package className="w-5 h-5 text-apple-blueLight group-hover:scale-110 transition-transform duration-300 ease-spring" />
              <span>Inventario</span>
            </span>
          </button>

          {/* Divider Line Below Inventario */}
          <div className="pt-3.5 border-t border-white/[0.08]">
            {/* User Profile Card */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all duration-300 ease-spring">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/15 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold text-white truncate leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-xs text-[#86868B] truncate leading-tight mt-0.5 font-medium">
                    {user.role === 'gerencia' ? 'Gerencia' : 'Ventas'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-2.5 rounded-xl text-[#86868B] hover:text-[#FF453A] hover:bg-red-500/10 transition-all duration-300 ease-spring cursor-pointer shrink-0 ml-1 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive Stock Modal */}
      <StockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} products={products} />

      {/* Interactive Script & SQL Studio Modal */}
      <ScriptModal
        isOpen={isScriptOpen}
        onClose={() => setIsScriptOpen(false)}
        onDatabaseMutated={onDatabaseMutated}
      />
    </>
  );
};
