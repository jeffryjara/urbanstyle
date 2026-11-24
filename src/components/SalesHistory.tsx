import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Store,
  MessageCircle,
  Globe,
  Building2,
  X,
  Receipt,
  FileSpreadsheet,
  ArrowUpRight,
} from 'lucide-react';
import { SegmentedControl, type SegmentOption } from './ui/SegmentedControl';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { Toast, useToastNotification } from './ui/Toast';
import { InvoiceModal } from './ui/InvoiceModal';
import type { UserSession, AuditRecord, Product, CartItem, PaymentMethod } from '../types';

interface SalesHistoryProps {
  user: UserSession;
  auditRecords: AuditRecord[];
  onNavigateToPos: () => void;
  products?: Product[];
}

type PeriodFilter = 'todos' | 'hoy' | 'boletas' | 'facturas';

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  auditRecords,
  onNavigateToPos,
  products = [],
}) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordForInvoice, setSelectedRecordForInvoice] = useState<AuditRecord | null>(null);
  const { toast, showNotification, clearToast } = useToastNotification();

  const filterOptions: SegmentOption<PeriodFilter>[] = [
    { id: 'todos', label: 'Todas' },
    { id: 'hoy', label: 'Hoy' },
    { id: 'boletas', label: 'Boletas' },
    { id: 'facturas', label: 'Facturas' },
  ];

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, []);

  // Filter records dynamically
  const filteredRecords = useMemo(() => {
    return auditRecords.filter((rec) => {
      // Period filter
      if (periodFilter === 'hoy') {
        const recordDate = rec.date || todayStr;
        if (recordDate !== todayStr) return false;
      } else if (periodFilter === 'boletas') {
        if (rec.type !== 'Boleta') return false;
      } else if (periodFilter === 'facturas') {
        if (rec.type !== 'Factura') return false;
      }

      // Text search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          rec.client.toLowerCase().includes(q) ||
          rec.sunatNumber.toLowerCase().includes(q) ||
          rec.id.toLowerCase().includes(q) ||
          (rec.clientDoc && rec.clientDoc.toLowerCase().includes(q)) ||
          rec.payment.toLowerCase().includes(q) ||
          rec.channel.toLowerCase().includes(q) ||
          (rec.itemsSummary && rec.itemsSummary.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [auditRecords, periodFilter, searchQuery, todayStr]);

  // Financial Stats
  const totalRevenue = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.total, 0);
  }, [filteredRecords]);

  const totalPairsSold = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (r.itemsCount || 1), 0);
  }, [filteredRecords]);

  const averageTicket = useMemo(() => {
    return filteredRecords.length > 0 ? totalRevenue / filteredRecords.length : 0;
  }, [totalRevenue, filteredRecords.length]);

  const todayRevenue = useMemo(() => {
    return auditRecords
      .filter((r) => (r.date || todayStr) === todayStr)
      .reduce((sum, r) => sum + r.total, 0);
  }, [auditRecords, todayStr]);

  // Synthesize cart items for InvoiceModal when viewing receipt
  const mockCartItemsForInvoice = useMemo((): CartItem[] => {
    if (!selectedRecordForInvoice) return [];
    const sampleProduct = products[0] || {
      id: 'prod-custom',
      name: 'Calzado Urban Style',
      brand: 'Adidas',
      category: 'Calzado',
      sku: 'US-ITEM',
      price: selectedRecordForInvoice.total,
      stock: 10,
      sizes: [40, 41, 42],
      image: '/logo-icon.png',
    };

    return [
      {
        product: {
          ...sampleProduct,
          price: selectedRecordForInvoice.total,
        },
        selectedSize: 41,
        quantity: selectedRecordForInvoice.itemsCount || 1,
      },
    ];
  }, [selectedRecordForInvoice, products]);

  return (
    <div className="space-y-8 pb-10">
      {/* Centered Pill Toast Notification */}
      <Toast message={toast} onClose={clearToast} />

      {/* Minimalist Oversized Header — Exactly like Dashboard & Pos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 stagger-1">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Mis Ventas
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#8E8E93] mt-1.5">
            Historial cronológico de transacciones registradas por fecha y hora con comprobante SUNAT
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            variant="primary"
            size="md"
            icon={<ShoppingBag className="w-4.5 h-4.5" />}
            onClick={onNavigateToPos}
            className="rounded-full px-6 py-3 text-base font-bold shadow-lg"
          >
            Nueva Venta
          </GlassButton>
        </div>
      </div>

      {/* 3 Minimalist Oversized Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 stagger-2">
        {/* KPI 1: Total Recaudado */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[190px] p-6 sm:p-7">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#8E8E93]">Total Recaudado</span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#007AFF] bg-[#007AFF]/10 px-3 py-1 rounded-full border border-[#007AFF]/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {filteredRecords.length} ventas
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight block">
              S/ {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-sm font-medium text-[#8E8E93]">
            <span>Ticket promedio: </span>
            <span className="text-white font-bold">
              S/ {averageTicket.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </GlassCard>

        {/* KPI 2: Ventas de Hoy */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[190px] p-6 sm:p-7">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#8E8E93]">Ventas de Hoy</span>
            <span className="text-sm font-bold text-[#30D158] bg-[#30D158]/10 px-3 py-1 rounded-full border border-[#30D158]/20">
              {todayStr}
            </span>
          </div>

          <div className="my-3">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight block">
              S/ {todayRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-sm font-medium text-[#8E8E93]">
            <span>Operaciones del día en tienda y canales</span>
          </div>
        </GlassCard>

        {/* KPI 3: Calzados Despachados */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[190px] p-6 sm:p-7">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#8E8E93]">Calzados Despachados</span>
            <span className="text-sm font-bold text-white/70">Inventario Vendido</span>
          </div>

          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              {totalPairsSold}
            </span>
            <span className="text-lg text-[#8E8E93] font-semibold">pares</span>
          </div>

          <div className="text-sm font-medium text-[#8E8E93]">
            <span>Trazabilidad completa con deducción de stock</span>
          </div>
        </GlassCard>
      </div>

      {/* Spacious Minimalist Table Card — Identical to Dashboard Table */}
      <GlassCard className="p-6 sm:p-8 space-y-6 stagger-3">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Transacciones
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Minimalist Oversized Rounded Search */}
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#8E8E93] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente o comprobante..."
                className="pl-12 pr-10 py-2.5 rounded-full bg-[#141414] border border-white/[0.08] text-base text-white placeholder-[#636366] focus:outline-none focus:border-white/30 transition-all duration-300 ease-spring w-64 sm:w-72 md:w-80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Segmented Filter */}
            <SegmentedControl<PeriodFilter>
              options={filterOptions}
              value={periodFilter}
              onChange={setPeriodFilter}
              size="md"
            />
          </div>
        </div>

        {/* Spacious Minimalist Table (5 Key Columns, generous padding) */}
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#8E8E93] font-semibold text-sm">
                <th className="py-4 px-6">Comprobante</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Canal</th>
                <th className="py-4 px-6">Pago</th>
                <th className="py-4 px-6 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-base">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#8E8E93] text-base">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-8 h-8 text-white/20 mb-1" />
                      <p className="font-bold text-white">Sin transacciones registradas</p>
                      <p className="text-xs text-[#8E8E93]">No se encontraron ventas para los filtros seleccionados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecordForInvoice(rec)}
                    className="hover:bg-white/[0.03] transition-colors duration-200 cursor-pointer group"
                    title="Haga clic para ver el ticket fiscal e imprimir"
                  >
                    {/* Comprobante */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                            rec.type === 'Factura'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : 'bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30'
                          }`}
                        >
                          {rec.type}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-white text-base block group-hover:text-[#007AFF] transition-colors">
                            {rec.sunatNumber}
                          </span>
                          <span className="text-xs text-[#8E8E93] font-mono block mt-0.5">
                            {rec.date || todayStr} • {rec.time}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-5 px-6">
                      <span className="text-white font-bold text-base block">
                        {rec.client}
                      </span>
                      <span className="text-xs text-[#8E8E93] font-mono block mt-0.5">
                        {rec.clientDoc ? `DOC: ${rec.clientDoc}` : 'Consumidor Final'} {rec.itemsSummary ? `• ${rec.itemsSummary}` : ''}
                      </span>
                    </td>

                    {/* Canal */}
                    <td className="py-5 px-6 text-[#A1A1A6] font-medium text-base">
                      <span className="inline-flex items-center gap-2.5">
                        {rec.channel === 'Tienda física' && <Store className="w-4.5 h-4.5 text-white/60" />}
                        {rec.channel === 'WhatsApp' && <MessageCircle className="w-4.5 h-4.5 text-[#30D158]" />}
                        {rec.channel === 'Web' && <Globe className="w-4.5 h-4.5 text-[#007AFF]" />}
                        {rec.channel === 'B2B Corporativo' && <Building2 className="w-4.5 h-4.5 text-purple-400" />}
                        {rec.channel}
                      </span>
                    </td>

                    {/* Pago */}
                    <td className="py-5 px-6 text-[#8E8E93] font-medium text-base">
                      {rec.payment}
                    </td>

                    {/* Monto */}
                    <td className="py-5 px-6 text-right">
                      <span className="font-display font-extrabold text-xl text-white block">
                        S/ {rec.total.toFixed(2)}
                      </span>
                      <span className="text-xs font-semibold text-[#30D158] block mt-0.5">
                        ✓ {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Table Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-medium text-[#8E8E93]">
            {filteredRecords.length} transacciones registradas • Haga clic sobre cualquier fila para abrir el comprobante
          </span>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="glass"
              size="md"
              icon={<FileSpreadsheet className="w-4.5 h-4.5" />}
              onClick={() => showNotification('Reporte de ventas exportado a Excel', 'success')}
            >
              Exportar
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Invoice Receipt Modal */}
      {selectedRecordForInvoice && (
        <InvoiceModal
          isOpen={!!selectedRecordForInvoice}
          onClose={() => setSelectedRecordForInvoice(null)}
          documentType={selectedRecordForInvoice.type === 'Factura' ? 'Factura' : 'Boleta'}
          orderNumber={`#ORD-${selectedRecordForInvoice.id.replace('TR-', '')}`}
          items={mockCartItemsForInvoice}
          subtotal={Number((selectedRecordForInvoice.total / 1.18).toFixed(2))}
          igv={Number((selectedRecordForInvoice.total - selectedRecordForInvoice.total / 1.18).toFixed(2))}
          total={selectedRecordForInvoice.total}
          paymentMethod={
            (selectedRecordForInvoice.payment.includes('Tarjeta') || selectedRecordForInvoice.payment.includes('POS')
              ? 'Tarjeta'
              : selectedRecordForInvoice.payment.includes('Yape')
              ? 'Yape'
              : selectedRecordForInvoice.payment.includes('Plin')
              ? 'Plin'
              : selectedRecordForInvoice.payment.includes('Transferencia')
              ? 'Transferencia'
              : 'Efectivo') as PaymentMethod
          }
          clientDoc={selectedRecordForInvoice.clientDoc || '00000000'}
          clientName={selectedRecordForInvoice.client}
        />
      )}
    </div>
  );
};
