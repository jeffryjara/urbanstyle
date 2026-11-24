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
      <aside className="relative w-64 min-w-[256px] max-w-[256px] shrink-0 h-full border-r border-white/10 bg-[#090a0f]/95 backdrop-blur-2xl flex flex-col justify-between p-5 hidden lg:flex overflow-hidden z-20">
        {/* Soft diffused ambient glow behind the sidebar */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-apple-blue/10 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-apple-purple/10 rounded-full blur-[80px] pointer-events-none" />

        {/* TOP SECTION: Brand Identity & Views (Sin subtítulos de sección) */}
        <div className="relative z-10 flex flex-col">
          {/* Brand Identity: Logo directo sin contenedores adicionales, con esquinas redondeadas */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/10 mb-6">
            <img
              src="/logo-icon.png"
              alt="Urban Style"
              className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-md"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base font-display text-white tracking-tight leading-tight">
                Urban Style
              </span>
              <span className="text-xs text-[#86868B] font-mono leading-tight mt-0.5">
                RUC 10449598569
              </span>
            </div>
          </div>

          {/* Vistas Principales (Dashboard y Terminal POS) */}
          <nav className="space-y-1.5">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-apple-blue text-white shadow-apple-glow'
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentView === 'pos'
                  ? 'bg-apple-blue text-white shadow-apple-glow'
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

        {/* BOTTOM SECTION: Botón Script + Botón Inventario + Línea Divisoria Debajo + Perfil de Usuario */}
        <div className="mt-auto relative z-10 space-y-2.5">
          {/* Botón de Script (Colocado ENCIMA del botón Inventario) */}
          <button
            onClick={() => setIsScriptOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-sm font-medium border border-white/5 transition-all duration-200 cursor-pointer group"
          >
            <span className="flex items-center gap-3">
              <Terminal className="w-4.5 h-4.5 text-apple-emerald group-hover:scale-110 transition-transform" />
              <span>Script</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-apple-emerald/10 text-apple-emerald border border-apple-emerald/20">
              SQL / Spark
            </span>
          </button>

          {/* Botón de Inventario & Stock */}
          <button
            onClick={() => setIsStockOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-sm font-medium border border-white/5 transition-all duration-200 cursor-pointer group"
          >
            <span className="flex items-center gap-3">
              <Package className="w-4.5 h-4.5 text-apple-blueLight group-hover:scale-110 transition-transform" />
              <span>Inventario & Stock</span>
            </span>
          </button>

          {/* Línea divisoria colocada DEBAJO del botón de Inventario */}
          <div className="pt-2.5 border-t border-white/10">
            {/* Tarjeta de Perfil de Usuario con Cerrar Sesión */}
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
        </div>
      </aside>

      {/* Interactive Stock Modal with Viewport Centering */}
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
