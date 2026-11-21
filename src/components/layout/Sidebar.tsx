import React, { useState } from 'react';
import {
  TrendingUp,
  Store,
  Package,
  FileText,
  Database,
  Building2,
  CheckCircle2,
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
      <aside className="w-64 min-w-[256px] max-w-[256px] shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-white/10 bg-[#09090b]/60 backdrop-blur-xl flex flex-col justify-between p-4 hidden lg:flex">
        {/* Navigation Sections */}
        <div className="space-y-6">
          {/* Section 1: Operaciones Principales */}
          <div>
            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block px-2.5 mb-2">
              Operaciones
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-white/10 border border-white/10 text-white shadow-sm font-semibold'
                    : 'text-[#86868B] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-apple-blue' : ''}`} />
                <span>Dashboard Gerencial</span>
              </button>

              <button
                onClick={() => onViewChange('pos')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  currentView === 'pos'
                    ? 'bg-white/10 border border-white/10 text-white shadow-sm font-semibold'
                    : 'text-[#86868B] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Store className={`w-4 h-4 ${currentView === 'pos' ? 'text-apple-blue' : ''}`} />
                <span>Terminal POS</span>
              </button>
            </nav>
          </div>

          {/* Section 2: Gestión Comercial */}
          <div>
            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block px-2.5 mb-2">
              Gestión Comercial
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => setIsStockOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[#86868B] hover:text-white hover:bg-white/5 text-xs font-medium transition-all duration-200 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Inventario & Stock</span>
              </button>

              <button
                onClick={() => setIsComprobantesOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[#86868B] hover:text-white hover:bg-white/5 text-xs font-medium transition-all duration-200 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Comprobantes SUNAT</span>
              </button>
            </nav>
          </div>

          {/* Section 3: Data Warehouse & Pipeline (SQL Server / Spark) */}
          <div>
            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block px-2.5 mb-2">
              Auditoría & BI
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => setIsEtlOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#86868B] hover:text-white hover:bg-white/5 text-xs font-medium transition-all duration-200 cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Database className="w-4 h-4" />
                  <span>Bitácora ETL (meta)</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Status Block: Always at the bottom of the full-height sidebar */}
        <div className="pt-4 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
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

      {/* Interactive Modals triggered from the Sidebar */}
      <StockModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} />
      <ComprobantesModal isOpen={isComprobantesOpen} onClose={() => setIsComprobantesOpen(false)} />

      {/* ETL / Data Warehouse Modal */}
      {isEtlOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden animate-scale-in text-[#F5F5F7]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue">
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
                className="p-1.5 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors"
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
                className="px-4 py-1.5 rounded-xl bg-apple-blue text-white text-xs font-semibold hover:bg-apple-blueLight transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
