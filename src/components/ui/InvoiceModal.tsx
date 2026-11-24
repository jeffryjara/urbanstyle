import React from 'react';
import { CheckCircle2, Printer, X, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { ModalPortal } from './ModalPortal';
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
  const isFactura = documentType === 'Factura';
  const serieCorrelativo = isFactura
    ? `F001-${orderNumber.replace('#ORD-', '000')}`
    : `B001-${orderNumber.replace('#ORD-', '000')}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      {/* On-Screen Minimalist Monochrome Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.09] rounded-[34px] p-7 md:p-9 shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden text-[#F5F5F7] animate-scale-in">
        {/* Modal Top Header Bar - hidden on print */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] no-print">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#8E8E93]">
              Comprobante Emitido
            </span>
            <h3 className="text-2xl font-extrabold font-display tracking-tight text-white mt-0.5">
              {documentType} {serieCorrelativo}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#141414] text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT SECTION */}
        <div id="printable-receipt" className="space-y-4 pt-4">
          {/* Corporate Header with Official Logo */}
          <div className="py-4 px-5 rounded-2xl bg-[#121212] border border-white/[0.07] print:border-black print:bg-white text-sm space-y-2">
            <div className="flex justify-between items-center font-bold font-display text-white print:text-black">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-icon.png"
                  alt="Urban Style"
                  className="w-9 h-9 rounded-xl object-contain shrink-0"
                />
                <span className="tracking-tight text-lg font-extrabold">URBAN STYLE</span>
              </div>
              <span className="text-white print:text-black font-mono font-semibold text-xs border border-white/15 print:border-black px-2.5 py-1 rounded-lg">
                RUC 10449598569
              </span>
            </div>
            <div className="pt-2 flex justify-between text-[#8E8E93] print:text-gray-800 text-xs border-t border-white/[0.06] print:border-gray-300">
              <span>{formattedDate} • {formattedTime}</span>
              <span className="font-mono font-bold text-white print:text-black">{serieCorrelativo}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 bg-[#121212] border border-white/[0.07] print:border-gray-300 print:bg-white rounded-2xl text-sm space-y-2">
            <div className="flex justify-between text-[#8E8E93] print:text-gray-700">
              <span>Cliente</span>
              <span className="font-bold text-white print:text-black">{clientName}</span>
            </div>
            <div className="flex justify-between text-[#8E8E93] print:text-gray-700">
              <span>{isFactura ? 'RUC' : 'DNI'}</span>
              <span className="font-mono text-white print:text-black font-bold">{clientDoc}</span>
            </div>
            <div className="flex justify-between text-[#8E8E93] print:text-gray-700">
              <span>Pago</span>
              <span className="font-bold text-white print:text-black">{paymentMethod}</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar my-2 space-y-2 pr-1 print:max-h-none print:overflow-visible">
            {items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${idx}`}
                className="flex items-center justify-between py-2 border-b border-white/[0.06] print:border-gray-200 text-sm"
              >
                <div className="flex flex-col print:w-3/4">
                  <span className="font-bold text-white print:text-black">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="text-xs text-[#8E8E93] print:text-gray-600">
                    Talla {item.selectedSize}
                  </span>
                </div>
                <span className="font-mono font-bold text-white print:text-black text-base">
                  S/ {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-3 border-t border-white/[0.08] print:border-black space-y-1.5 text-sm">
            <div className="flex justify-between text-[#8E8E93] print:text-gray-700">
              <span>Subtotal</span>
              <span className="font-mono text-white print:text-black">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#8E8E93] print:text-gray-700">
              <span>IGV (18%)</span>
              <span className="font-mono text-white print:text-black">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline text-white print:text-black pt-2 border-t border-white/[0.06] print:border-black">
              <span className="text-base font-bold">Total</span>
              <span className="text-white print:text-black font-display font-extrabold text-3xl">
                S/ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* SUNAT Verification footer */}
          <div className="mt-3 pt-3 border-t border-white/[0.08] print:border-gray-300 flex items-center justify-between text-xs text-[#8E8E93] print:text-gray-800">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-8 h-8 text-white/80 print:text-black shrink-0" />
              <span className="text-white print:text-black font-semibold">
                Comprobante Electrónico SUNAT
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-white/10 print:bg-gray-100 text-white print:text-black font-mono text-[10px] font-bold">
              AUTORIZADO
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-7 grid grid-cols-2 gap-3 no-print">
          <GlassButton
            variant="glass"
            size="md"
            icon={<Printer className="w-4.5 h-4.5" />}
            onClick={handlePrint}
          >
            Imprimir
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4.5 h-4.5" />}
            iconPosition="right"
            onClick={onClose}
          >
            Listo
          </GlassButton>
        </div>
      </div>
    </ModalPortal>
  );
};
