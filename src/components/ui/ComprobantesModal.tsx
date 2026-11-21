import React from 'react';
import { X, FileText, CheckCircle2, Download, Printer } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { INITIAL_AUDIT_RECORDS } from '../../data/initialData';

interface ComprobantesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComprobantesModal: React.FC<ComprobantesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden animate-scale-in text-[#F5F5F7]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Comprobantes Electrónicos Emitidos (SUNAT)
              </h3>
              <p className="text-xs text-[#86868B]">
                Registro oficial de Boletas (Serie B001) y Facturas (Serie F001)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records Table */}
        <div className="my-4 max-h-80 overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-[10px] text-[#86868B] uppercase tracking-wider font-semibold sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-2.5 px-3">Comprobante</th>
                <th className="py-2.5 px-3">Fecha / Hora</th>
                <th className="py-2.5 px-3">Cliente / Razón Social</th>
                <th className="py-2.5 px-3">Canal</th>
                <th className="py-2.5 px-3 text-right">Total (S/)</th>
                <th className="py-2.5 px-3 text-center">Estado SUNAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {INITIAL_AUDIT_RECORDS.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono text-apple-blueLight text-[11px] font-semibold">
                    {rec.sunatNumber}
                  </td>
                  <td className="py-3 px-3 text-[#86868B]">{rec.time}</td>
                  <td className="py-3 px-3 font-medium text-white">{rec.client}</td>
                  <td className="py-3 px-3 text-[#A1A1A6]">{rec.channel}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    S/ {rec.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
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
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#86868B]">
          <span>Conexión OSE/SUNAT en tiempo real</span>
          <GlassButton variant="primary" size="sm" onClick={onClose}>
            Cerrar
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
