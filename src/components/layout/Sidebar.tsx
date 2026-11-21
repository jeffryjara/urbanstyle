import React, { useState } from 'react';
import {
  TrendingUp,
  Store,
  Package,
  FileText,
  Database,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { StockModal } from '../ui/StockModal';
import { ComprobantesModal } from '../ui/ComprobantesModal';
import { EtlModal } from '../ui/EtlModal';
import type { UserSession } from '../../types';

interface SidebarProps {
  user: UserSession;
  currentView: 'dashboard' | 'pos';
  onViewChange: (view: 'dashboard' | 'pos') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
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

        {/* Navigation Sections */}
        <div className="space-y-6 relative z-10">
          {/* SECTION 1: Vistas Principales (Navegación de Pantalla) */}
          <div>
            <div className="flex items-center justify-between px-2.5 mb-2.5">
              <span className="text-xs font-bold text-[#A1A1A6] uppercase tracking-wider">
                Vistas de Pantalla
              </span>
              <span className="text-[10px] text-apple-blue font-mono font-medium">
                Navegación
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

          {/* SECTION 2: Consultas & Modales (Claramente separado) */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between px-2.5 mb-2.5">
              <span className="text-xs font-bold text-[#A1A1A6] uppercase tracking-wider">
                Consultas & Modales
              </span>
              <span className="text-[10px] text-[#86868B] font-mono">
                Ventanas
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
        </div>

        {/* Bottom Status Block: Floating inside the sidebar */}
        <div className="pt-4 border-t border-white/10 relative z-10">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#86868B] truncate max-w-[130px] font-medium">{user.location}</span>
              <Badge variant="emerald" dot className="text-xs py-0.5 px-2.5">En Línea</Badge>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#86868B] mb-1.5">
                <span>Sincronización SUNAT</span>
                <span className="text-[#30D158] font-mono font-medium">100%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#30D158] w-full rounded-full shadow-[0_0_8px_#30D158]" />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-[#86868B] border-t border-white/5">
              <span>Caja POS Activa</span>
              <span className="font-mono text-white font-semibold">Caja 04</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive Modals with Viewport Centering */}
      <StockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} />
      <ComprobantesModal isOpen={isComprobantesOpen} onClose={() => setIsComprobantesOpen(false)} />
      <EtlModal isOpen={isEtlOpen} onClose={() => setIsEtlOpen(false)} />
    </>
  );
};
