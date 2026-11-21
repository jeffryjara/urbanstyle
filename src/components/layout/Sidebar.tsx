import React, { useState } from 'react';
import {
  TrendingUp,
  Store,
  Package,
  FileText,
  Database,
} from 'lucide-react';
import { StockModal } from '../ui/StockModal';
import { ComprobantesModal } from '../ui/ComprobantesModal';
import { EtlModal } from '../ui/EtlModal';
import type { UserSession } from '../../types';

interface SidebarProps {
  user?: UserSession;
  currentView: 'dashboard' | 'pos';
  onViewChange: (view: 'dashboard' | 'pos') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isComprobantesOpen, setIsComprobantesOpen] = useState(false);
  const [isEtlOpen, setIsEtlOpen] = useState(false);

  return (
    <>
      <aside className="relative w-64 min-w-[256px] max-w-[256px] shrink-0 h-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#12141c]/80 via-[#0c0d14]/70 to-[#0a0a0f]/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between p-4 hidden lg:flex overflow-hidden">
        {/* Soft diffused glow orbs behind the glass */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-apple-blue/15 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-[#30D158]/12 rounded-full blur-[80px] pointer-events-none" />

        {/* TOP: Section 1 - Vistas de Pantalla */}
        <div className="relative z-10">
          <div className="px-2.5 mb-3">
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
                <span>Dashboard Gerencial</span>
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

        {/* BOTTOM: Section 2 - Consultas & Modales (Bajadas al fondo con separación limpia) */}
        <div className="pt-4 border-t border-white/10 relative z-10">
          <div className="px-2.5 mb-3">
            <span className="text-xs font-bold text-[#A1A1A6] uppercase tracking-wider">
              Consultas & Modales
            </span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setIsStockOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-sm font-medium border border-white/5 transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Package className="w-4.5 h-4.5 text-apple-blueLight" />
                <span>Inventario & Stock</span>
              </span>
            </button>

            <button
              onClick={() => setIsComprobantesOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-sm font-medium border border-white/5 transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5 text-[#30D158]" />
                <span>Comprobantes SUNAT</span>
              </span>
            </button>

            <button
              onClick={() => setIsEtlOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-sm font-medium border border-white/5 transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Database className="w-4.5 h-4.5 text-apple-purple" />
                <span>Bitácora ETL & DW</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
            </button>
          </nav>
        </div>
      </aside>

      {/* Interactive Modals with Viewport Centering */}
      <StockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} />
      <ComprobantesModal isOpen={isComprobantesOpen} onClose={() => setIsComprobantesOpen(false)} />
      <EtlModal isOpen={isEtlOpen} onClose={() => setIsEtlOpen(false)} />
    </>
  );
};
