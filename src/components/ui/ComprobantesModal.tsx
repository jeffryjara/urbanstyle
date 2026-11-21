import React from 'react';
import { X, FileText } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { ModalPortal } from './ModalPortal';
import { INITIAL_AUDIT_RECORDS } from '../../data/initialData';

interface ComprobantesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComprobantesModal: React.FC<ComprobantesModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-3xl bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden animate-scale-in text-[#F5F5F7]">
        {/* Soft Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-apple-blue/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Comprobantes Electrónicos Emitidos (SUNAT)
              </h3>
              <p className="text-xs md:text-sm text-[#86868B]">
                Registro oficial de Boletas (Serie B001) y Facturas (Serie F001)
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

        {/* Records Table */}
        <div className="my-4 max-h-80 overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl relative z-10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] border-b border-white/10 text-xs text-[#86868B] uppercase tracking-wider font-bold sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-3 px-3.5">Comprobante</th>
                <th className="py-3 px-3.5">Fecha / Hora</th>
                <th className="py-3 px-3.5">Cliente / Razón Social</th>
                <th className="py-3 px-3.5">Canal</th>
                <th className="py-3 px-3.5 text-right">Total (S/)</th>
                <th className="py-3 px-3.5 text-center">Estado SUNAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {INITIAL_AUDIT_RECORDS.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3.5 font-mono text-apple-blueLight text-xs font-bold">
                    {rec.sunatNumber}
                  </td>
                  <td className="py-3 px-3.5 text-[#86868B] text-xs">{rec.time}</td>
                  <td className="py-3 px-3.5 font-semibold text-white">{rec.client}</td>
                  <td className="py-3 px-3.5 text-[#A1A1A6] text-xs">{rec.channel}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    S/ {rec.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <Badge variant="emerald" dot>
                      Aceptado
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-sm text-[#86868B] relative z-10">
          <span>Conexión OSE/SUNAT en tiempo real</span>
          <GlassButton variant="primary" size="md" onClick={onClose} className="text-sm font-semibold">
            Cerrar
          </GlassButton>
        </div>
      </div>
    </ModalPortal>
  );
};
