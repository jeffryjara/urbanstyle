import React from 'react';
import { CheckCircle2, Printer, Download, X, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassButton } from './GlassButton';
import type { CartItem, PaymentMethod } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'Boleta' | 'Factura';
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  paymentMethod: PaymentMethod;
  clientDoc?: string;
  clientName?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  documentType,
  orderNumber,
  items,
  subtotal,
  igv,
  total,
  paymentMethod,
  clientDoc = '00000000',
  clientName = 'CONSUMIDOR FINAL',
}) => {
  if (!isOpen) return null;

  const isFactura = documentType === 'Factura';
  const serieCorrelativo = isFactura ? `F001-${orderNumber.replace('#ORD-', '000')}` : `B001-${orderNumber.replace('#ORD-', '000')}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-[#F5F5F7] animate-scale-in">
        {/* Glow ambient light */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-apple-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#30D158]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-center text-[#30D158]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#30D158]">
                Comprobante Emitido y Autorizado
              </span>
              <h3 className="text-lg font-bold font-display tracking-tight text-white">
                {documentType} Electrónica {serieCorrelativo}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corporate Tax Header */}
        <div className="py-4 my-2 rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-xs space-y-1.5">
          <div className="flex justify-between items-center text-sm font-bold font-display text-white">
            <span>URBAN STYLE S.A.C.</span>
            <span className="text-apple-blue font-mono font-medium">RUC 10449598569</span>
          </div>
          <p className="text-[#86868B]">Comercialización Omnicanal de Calzado Deportivo</p>
          <p className="text-[#86868B]">Sede Central: Av. Conquistadores 480, San Isidro — Lima</p>
          <div className="pt-2 flex justify-between text-[#A1A1A6] border-t border-white/5">
            <span>Fecha: {formattedDate} — {formattedTime}</span>
            <span>Canal: Tienda Física</span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1 mb-3">
          <div className="flex justify-between text-[#86868B]">
            <span>Adquirente:</span>
            <span className="font-medium text-white">{clientName}</span>
          </div>
          <div className="flex justify-between text-[#86868B]">
            <span>Documento ({isFactura ? 'RUC' : 'DNI'}):</span>
            <span className="font-mono text-white">{clientDoc}</span>
          </div>
          <div className="flex justify-between text-[#86868B]">
            <span>Medio de Pago:</span>
            <span className="font-medium text-apple-emerald">{paymentMethod} (Cancelado)</span>
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-44 overflow-y-auto custom-scrollbar my-3 space-y-2 pr-1">
          {items.map((item, idx) => (
            <div
              key={`${item.product.id}-${item.selectedSize}-${idx}`}
              className="flex items-center justify-between py-2 border-b border-white/5 text-xs"
            >
              <div className="flex flex-col">
                <span className="font-medium text-white">{item.product.name}</span>
                <span className="text-[11px] text-[#86868B]">
                  Talla: {item.selectedSize} | SKU: {item.product.sku} | Cant: {item.quantity}
                </span>
              </div>
              <span className="font-mono font-semibold text-white">
                S/ {(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
          <div className="flex justify-between text-[#86868B]">
            <span>Operación Gravada (Subtotal):</span>
            <span className="font-mono text-white">S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#86868B]">
            <span>I.G.V. (18.00%):</span>
            <span className="font-mono text-white">S/ {igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold font-display text-white pt-2 border-t border-white/5">
            <span>Importe Total:</span>
            <span className="text-apple-emerald font-mono">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* SUNAT Verification footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#86868B]">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-white/80" />
            <div>
              <p className="text-white font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
                Representación Impresa SUNAT
              </p>
              <p className="text-[10px] text-[#86868B]">Hash CPE: 4e82b7...b10a</p>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-[#30D158]/10 text-[#30D158] font-mono text-[10px] font-semibold">
            VALIDEZ FISCAL
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <GlassButton
            variant="glass"
            size="md"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Imprimir
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={onClose}
          >
            Nueva Venta
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
