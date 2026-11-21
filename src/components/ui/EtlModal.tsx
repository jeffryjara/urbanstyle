import React from 'react';
import { Database, X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { Badge } from './Badge';
import { ETL_LOGS } from '../../data/initialData';

interface EtlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EtlModal: React.FC<EtlModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-2xl bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-[#F5F5F7] animate-scale-in">
        {/* Soft background ambient blur */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-apple-purple/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-apple-purple/15 border border-apple-purple/30 flex items-center justify-center text-apple-purple">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Bitácora ETL & Data Warehouse Kimball
              </h3>
              <p className="text-xs md:text-sm text-[#86868B]">
                Procedimientos almacenados en T-SQL y Agregación PySpark
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 max-h-72 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 text-sm relative z-10">
          {ETL_LOGS.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-apple-blue font-bold text-sm">{log.process}</span>
                <div className="flex items-center gap-3 text-xs text-[#86868B] mt-1">
                  <span>Destino: <strong className="text-white">{log.table}</strong></span>
                  <span>Inicio: {log.startTime}</span>
                  <span>Duración: {log.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-white text-sm font-semibold">{log.records} regs</span>
                <Badge variant="emerald" dot>{log.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm relative z-10">
          <span className="text-[#86868B]">Esquemas dw.FactVentas / meta.BitacoraETL</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-apple-blue text-white text-sm font-semibold hover:bg-apple-blueLight transition-colors cursor-pointer shadow-apple-glow"
          >
            Cerrar Auditoría
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};
