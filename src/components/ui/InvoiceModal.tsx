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
      {/* On-Screen Apple Liquid Glass Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-[#F5F5F7] animate-scale-in">
        {/* Glow ambient light - hidden on print */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-apple-blue/20 rounded-full blur-3xl pointer-events-none no-print" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#30D158]/15 rounded-full blur-3xl pointer-events-none no-print" />

        {/* Modal Top Header Bar - hidden on print */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 no-print">
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
            className="p-1.5 rounded-full text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT SECTION: ID #printable-receipt is captured by @media print */}
        <div id="printable-receipt" className="space-y-3 pt-2">
          {/* Corporate Header */}
          <div className="py-3 px-4 rounded-2xl bg-white/[0.02] border border-white/5 print:border-black print:bg-white text-xs space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold font-display text-white print:text-black">
              <span className="tracking-tight text-base font-extrabold">URBAN STYLE S.A.C.</span>
              <span className="text-apple-blue print:text-black font-mono font-semibold text-xs border border-apple-blue/30 print:border-black px-2 py-0.5 rounded">
                RUC 10449598569
              </span>
            </div>
            <p className="text-[#86868B] print:text-gray-700 text-[11px]">
              Comercialización Omnicanal de Calzado Deportivo de Alta Gama
            </p>
            <p className="text-[#86868B] print:text-gray-700 text-[11px]">
              Sede Central: Av. Conquistadores 480, San Isidro — Lima, Perú
            </p>
            <div className="pt-2 flex justify-between text-[#A1A1A6] print:text-gray-800 text-[11px] border-t border-white/5 print:border-gray-300">
              <span>Fecha: {formattedDate} — {formattedTime}</span>
              <span className="font-semibold text-white print:text-black">{documentType.toUpperCase()} ELECTRÓNICA: {serieCorrelativo}</span>
            </div>
          </div>

          {/* Customer & Transaction Info */}
          <div className="p-3 bg-white/[0.02] border border-white/5 print:border-gray-300 print:bg-white rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-[#86868B] print:text-gray-700">
              <span>Adquirente / Cliente:</span>
              <span className="font-medium text-white print:text-black">{clientName}</span>
            </div>
            <div className="flex justify-between text-[#86868B] print:text-gray-700">
              <span>Documento ({isFactura ? 'RUC' : 'DNI'}):</span>
              <span className="font-mono text-white print:text-black font-semibold">{clientDoc}</span>
            </div>
            <div className="flex justify-between text-[#86868B] print:text-gray-700">
              <span>Medio de Pago:</span>
              <span className="font-medium text-apple-emerald print:text-black">{paymentMethod} (Cancelado)</span>
            </div>
            <div className="flex justify-between text-[#86868B] print:text-gray-700">
              <span>Punto de Emisión:</span>
              <span className="font-mono text-white print:text-black">Caja 04 — Tienda Principal San Isidro</span>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar my-2 space-y-1.5 pr-1 print:max-h-none print:overflow-visible">
            <div className="hidden print:grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-black border-b border-black pb-1 mb-1">
              <span className="col-span-1">Cant</span>
              <span className="col-span-7">Descripción / Calzado</span>
              <span className="col-span-2 text-right">P. Unit</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            {items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${idx}`}
                className="flex items-center justify-between py-1.5 border-b border-white/5 print:border-gray-200 text-xs"
              >
                <div className="flex flex-col print:w-3/4">
                  <span className="font-medium text-white print:text-black text-xs">
                    <span className="print:inline hidden font-bold mr-2">{item.quantity}x</span>
                    {item.product.name}
                  </span>
                  <span className="text-[11px] text-[#86868B] print:text-gray-600">
                    Talla: <strong className="text-white print:text-black">{item.selectedSize}</strong> | SKU: {item.product.sku} | Cant: {item.quantity}
                  </span>
                </div>
                <span className="font-mono font-semibold text-white print:text-black text-xs">
                  S/ {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-2 border-t border-white/10 print:border-black space-y-1 text-xs">
            <div className="flex justify-between text-[#86868B] print:text-gray-700">
              <span>Op. Gravada (Subtotal sin IGV):</span>
              <span className="font-mono text-white print:text-black">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#86868B] print:text-gray-700">
              <span>I.G.V. (18.00%):</span>
              <span className="font-mono text-white print:text-black">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold font-display text-white print:text-black pt-1.5 border-t border-white/5 print:border-black">
              <span>Importe Total:</span>
              <span className="text-apple-emerald print:text-black font-mono font-extrabold text-lg">
                S/ {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* SUNAT Verification footer */}
          <div className="mt-3 pt-2.5 border-t border-white/10 print:border-gray-300 flex items-center justify-between text-[11px] text-[#86868B] print:text-gray-800">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-white/80 print:text-black shrink-0" />
              <div>
                <p className="text-white print:text-black font-medium flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#30D158] print:text-black shrink-0" />
                  Representación Impresa SUNAT
                </p>
                <p className="text-[10px] text-[#86868B] print:text-gray-600 font-mono">
                  Hash CPE: 4e82b7c93fa8802d91b...b10a
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#30D158]/10 print:bg-gray-100 text-[#30D158] print:text-black font-mono text-[10px] font-semibold border border-[#30D158]/20 print:border-black">
              VALIDEZ FISCAL
            </span>
          </div>

          {/* Print note */}
          <div className="hidden print:block text-center text-[10px] text-gray-500 pt-2 border-t border-dashed border-gray-300">
            ¡Gracias por su compra en Urban Style! — Pasión por el Deporte
          </div>
        </div>

        {/* Modal Action Buttons - strictly hidden during print */}
        <div className="mt-6 grid grid-cols-2 gap-3 no-print">
          <GlassButton
            variant="glass"
            size="md"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
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
    </ModalPortal>
  );
};
