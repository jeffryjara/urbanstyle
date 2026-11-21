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
import { ETL_LOGS } from '../../data/initialData';
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
              <span className="text-[10px] font-extrabold text-[#A1A1A6] uppercase tracking-wider">
                Vistas de Pantalla
              </span>
              <span className="text-[9px] text-apple-blue font-mono font-medium">
                Navegación
              </span>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-apple-blue text-white shadow-apple-glow font-semibold border border-apple-blueLight/30'
                    : 'text-[#86868B] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Dashboard Gerencial</span>
                </span>
                {currentView === 'dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>

              <button
                onClick={() => onViewChange('pos')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  currentView === 'pos'
                    ? 'bg-apple-blue text-white shadow-apple-glow font-semibold border border-apple-blueLight/30'
                    : 'text-[#86868B] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  <span>Terminal POS</span>
                </span>
                {currentView === 'pos' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
            </nav>
          </div>

          {/* SECTION 2: Consultas & Modales (Claramente separado) */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between px-2.5 mb-2.5">
              <span className="text-[10px] font-extrabold text-[#A1A1A6] uppercase tracking-wider">
                Consultas & Modales
              </span>
              <span className="text-[9px] text-[#86868B] font-mono">
                Ventanas
              </span>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => setIsStockOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-xs font-medium border border-white/5 transition-all duration-200 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-apple-blueLight" />
                  <span>Inventario & Stock</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#86868B] border border-white/5">
                  Modal
                </span>
              </button>

              <button
                onClick={() => setIsComprobantesOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-xs font-medium border border-white/5 transition-all duration-200 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#30D158]" />
                  <span>Comprobantes SUNAT</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#86868B] border border-white/5">
                  Modal
                </span>
              </button>

              <button
                onClick={() => setIsEtlOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] text-xs font-medium border border-white/5 transition-all duration-200 cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-apple-purple" />
                  <span>Bitácora ETL & DW</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Status Block: Floating inside the sidebar */}
        <div className="pt-4 border-t border-white/10 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#86868B] truncate max-w-[130px]">{user.location}</span>
              <Badge variant="emerald" dot className="text-[10px] py-0 px-2">En Línea</Badge>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#86868B] mb-1">
                <span>Sincronización SUNAT</span>
                <span className="text-[#30D158] font-mono font-medium">100%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#30D158] w-full rounded-full shadow-[0_0_8px_#30D158]" />
              </div>
            </div>

            <div className="pt-1.5 flex justify-between items-center text-[10px] text-[#86868B] border-t border-white/5">
              <span>Caja POS Activa</span>
              <span className="font-mono text-white font-semibold">Caja 04</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive Modals */}
      <StockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} />
      <ComprobantesModal isOpen={isComprobantesOpen} onClose={() => setIsComprobantesOpen(false)} />

      {/* ETL / Data Warehouse Modal */}
      {isEtlOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden animate-scale-in text-[#F5F5F7]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-apple-purple/15 border border-apple-purple/30 flex items-center justify-center text-apple-purple">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Bitácora ETL & Data Warehouse Kimball
                  </h3>
                  <p className="text-xs text-[#86868B]">
                    Procedimientos almacenados en T-SQL y Agregación PySpark
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEtlOpen(false)}
                className="p-1.5 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1 text-xs">
              {ETL_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-apple-blue font-semibold">{log.process}</span>
                    <div className="flex items-center gap-3 text-[11px] text-[#86868B] mt-0.5">
                      <span>Destino: <strong className="text-white">{log.table}</strong></span>
                      <span>Inicio: {log.startTime}</span>
                      <span>Duración: {log.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white text-xs">{log.records} regs</span>
                    <Badge variant="emerald" dot>{log.status}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-[#86868B]">Esquemas dw.FactVentas / meta.BitacoraETL</span>
              <button
                onClick={() => setIsEtlOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-apple-blue text-white text-xs font-semibold hover:bg-apple-blueLight transition-colors cursor-pointer"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
