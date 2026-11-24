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
      <aside className="relative w-72 min-w-[288px] max-w-[288px] shrink-0 h-full border-r border-white/[0.07] bg-[#080808] flex flex-col justify-between p-6 hidden lg:flex overflow-hidden z-20">
        {/* TOP SECTION: Brand Identity & Primary Views */}
        <div className="relative z-10 flex flex-col">
          {/* Brand Identity: Direct logo without extra containers, rounded corners */}
          <div className="flex items-center gap-4 pb-7 border-b border-white/[0.07] mb-7 px-1">
            <img
              src="/logo-icon.png"
              alt="Urban Style"
              className="w-11 h-11 rounded-2xl object-contain shrink-0"
            />
            <span className="font-extrabold text-xl font-display text-white tracking-tight">
              Urban Style
            </span>
          </div>

          {/* Primary Views (Sin contenedor blanco pesado ni puntito lateral) */}
          <nav className="space-y-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`relative w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer active:scale-[0.96] group ${
                currentView === 'dashboard'
                  ? 'bg-[#151518] text-white border border-white/[0.10]'
                  : 'text-[#71717A] hover:text-white hover:bg-[#111113] border border-transparent'
              }`}
            >
              {currentView === 'dashboard' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#007AFF]" />
              )}
              <TrendingUp
                className={`w-5 h-5 transition-colors duration-300 ${
                  currentView === 'dashboard'
                    ? 'text-[#007AFF]'
                    : 'text-[#71717A] group-hover:text-white'
                }`}
              />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange('pos')}
              className={`relative w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer active:scale-[0.96] group ${
                currentView === 'pos'
                  ? 'bg-[#151518] text-white border border-white/[0.10]'
                  : 'text-[#71717A] hover:text-white hover:bg-[#111113] border border-transparent'
              }`}
            >
              {currentView === 'pos' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#007AFF]" />
              )}
              <Store
                className={`w-5 h-5 transition-colors duration-300 ${
                  currentView === 'pos'
                    ? 'text-[#007AFF]'
                    : 'text-[#71717A] group-hover:text-white'
                }`}
              />
              <span>Catálogo</span>
            </button>
          </nav>
        </div>

        {/* BOTTOM SECTION: Script + Inventario + Divider Below + User Profile */}
        <div className="mt-auto relative z-10 space-y-2.5">
          {/* Script Button (Above Inventario) */}
          <button
            onClick={() => setIsScriptOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[#A1A1A6] hover:text-white bg-[#0f0f12] hover:bg-[#16161a] text-base font-semibold border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 ease-spring cursor-pointer active:scale-[0.96] group"
          >
            <span className="flex items-center gap-3.5">
              <Terminal className="w-5 h-5 text-[#71717A] group-hover:text-[#007AFF] transition-colors duration-300" />
              <span>Script</span>
            </span>
          </button>

          {/* Inventario Button */}
          <button
            onClick={() => setIsStockOpen(true)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[#A1A1A6] hover:text-white bg-[#0f0f12] hover:bg-[#16161a] text-base font-semibold border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 ease-spring cursor-pointer active:scale-[0.96] group"
          >
            <span className="flex items-center gap-3.5">
              <Package className="w-5 h-5 text-[#71717A] group-hover:text-[#007AFF] transition-colors duration-300" />
              <span>Inventario</span>
            </span>
          </button>

          {/* Divider Line Below Inventario */}
          <div className="pt-3.5 border-t border-white/[0.08]">
            {/* User Profile Card */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0f0f12] border border-white/[0.06] hover:bg-[#151519] transition-all duration-300 ease-spring">
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
                  <span className="text-xs text-[#8E8E93] truncate leading-tight mt-0.5 font-medium">
                    {user.role === 'gerencia' ? 'Gerencia' : 'Ventas'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-2.5 rounded-xl text-[#8E8E93] hover:text-[#FF453A] hover:bg-red-500/10 transition-all duration-300 ease-spring cursor-pointer shrink-0 ml-1 active:scale-90"
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
