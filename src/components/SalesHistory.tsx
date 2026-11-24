import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Clock,
  ShoppingBag,
  Store,
  MessageCircle,
  Globe,
  Building2,
  X,
  Receipt,
  Eye,
} from 'lucide-react';
import { SegmentedControl, type SegmentOption } from './ui/SegmentedControl';
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
  user,
  auditRecords,
  onNavigateToPos,
  products = [],
}) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('todos');
  const [selectedRecordForInvoice, setSelectedRecordForInvoice] = useState<AuditRecord | null>(null);
  const { toast, showNotification, clearToast } = useToastNotification();

  const filterOptions: SegmentOption<PeriodFilter>[] = [
    { id: 'todos', label: 'Todas las Ventas' },
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

      // Channel filter
      if (selectedChannel !== 'todos' && rec.channel !== selectedChannel) {
        return false;
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
          (rec.itemsSummary && rec.itemsSummary.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [auditRecords, periodFilter, selectedChannel, searchQuery, todayStr]);

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
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <Toast message={toast} onClose={clearToast} />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 stagger-1">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#141416] border border-white/[0.08] text-[#007AFF]">
              <Receipt className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
                Mis Ventas
              </h2>
              <p className="text-sm sm:text-base font-medium text-[#8E8E93] mt-1">
                Historial cronológico de transacciones registradas por fecha y hora con comprobante SUNAT
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Nueva Venta */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToPos}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#007AFF] hover:bg-[#0066d6] text-white font-extrabold text-base flex items-center justify-center gap-2.5 transition-all duration-300 ease-spring active:scale-95 shadow-lg shadow-[#007AFF]/25 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Nueva Venta (Catálogo)</span>
          </button>
        </div>
      </div>

      {/* 4 Oversized Minimalist KPI Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-2">
        <div className="p-6 rounded-[28px] bg-[#121214] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#8E8E93] uppercase tracking-wider">
            Total Recaudado
          </span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
              S/ {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#007AFF] font-medium block mt-1">
              {filteredRecords.length} transacciones registradas
            </span>
          </div>
        </div>

        <div className="p-6 rounded-[28px] bg-[#121214] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#8E8E93] uppercase tracking-wider">
            Ventas de Hoy
          </span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
              S/ {todayRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#30D158] font-medium block mt-1">
              Jornada actual ({todayStr})
            </span>
          </div>
        </div>

        <div className="p-6 rounded-[28px] bg-[#121214] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#8E8E93] uppercase tracking-wider">
            Pares Vendidos
          </span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
              {totalPairsSold}
            </span>
            <span className="text-xs text-[#8E8E93] font-medium block mt-1">
              Calzados despachados
            </span>
          </div>
        </div>

        <div className="p-6 rounded-[28px] bg-[#121214] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-semibold text-[#8E8E93] uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
              S/ {averageTicket.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#8E8E93] font-medium block mt-1">
              Por comprobante fiscal
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 stagger-3">
        {/* Segmented Period Switcher */}
        <SegmentedControl<PeriodFilter>
          options={filterOptions}
          value={periodFilter}
          onChange={setPeriodFilter}
          className="w-full lg:w-auto"
        />

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Channel Filter Pills */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#121214] border border-white/[0.08] text-white text-sm font-bold focus:outline-none focus:border-[#007AFF] transition-all cursor-pointer"
          >
            <option value="todos">Todos los Canales</option>
            <option value="Tienda física">Tienda física</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Web">Web</option>
            <option value="B2B Corporativo">B2B Corporativo</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente, comprobante o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#121214] border border-white/[0.08] text-white placeholder-[#8E8E93] text-sm font-medium focus:outline-none focus:border-[#007AFF] transition-all"
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
        </div>
      </div>

      {/* Main Table / Card View */}
      <div className="rounded-[32px] bg-[#101012] border border-white/[0.08] overflow-hidden shadow-2xl stagger-4">
        {/* Table for Desktop */}
        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#141416]/50 text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                <th className="py-4.5 px-6">Comprobante</th>
                <th className="py-4.5 px-4">Fecha & Hora</th>
                <th className="py-4.5 px-6">Cliente & Documento</th>
                <th className="py-4.5 px-4">Artículos</th>
                <th className="py-4.5 px-4">Canal & Pago</th>
                <th className="py-4.5 px-6 text-right">Total</th>
                <th className="py-4.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8E8E93]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Receipt className="w-10 h-10 text-white/20" />
                      <p className="text-base font-bold text-white">No se encontraron ventas</p>
                      <p className="text-xs text-[#8E8E93]">Intente modificando los filtros de búsqueda o fecha.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-white/[0.02] transition-colors duration-150 group"
                  >
                    {/* Comprobante */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
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
                          <span className="font-mono font-bold text-white block">
                            {rec.sunatNumber}
                          </span>
                          <span className="text-[11px] font-mono text-[#8E8E93]">
                            ID: {rec.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Fecha y Hora */}
                    <td className="py-4.5 px-4">
                      <div className="flex flex-col text-sm">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                          {rec.date || todayStr}
                        </span>
                        <span className="text-xs text-[#8E8E93] font-mono flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />
                          {rec.time}
                        </span>
                      </div>
                    </td>

                    {/* Cliente & Documento */}
                    <td className="py-4.5 px-6">
                      <span className="font-bold text-white block text-sm">
                        {rec.client}
                      </span>
                      <span className="text-xs text-[#8E8E93] font-mono">
                        {rec.clientDoc ? `DOC: ${rec.clientDoc}` : 'Consumidor Final'}
                      </span>
                    </td>

                    {/* Artículos / Calzados */}
                    <td className="py-4.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-bold text-white">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#007AFF]" />
                        {rec.itemsCount || 1} {rec.itemsCount === 1 ? 'par' : 'pares'}
                      </span>
                      {rec.itemsSummary && (
                        <p className="text-[11px] text-[#8E8E93] truncate max-w-[200px] mt-1" title={rec.itemsSummary}>
                          {rec.itemsSummary}
                        </p>
                      )}
                    </td>

                    {/* Canal & Pago */}
                    <td className="py-4.5 px-4">
                      <div className="flex flex-col text-xs font-medium">
                        <span className="inline-flex items-center gap-1.5 text-white font-bold">
                          {rec.channel === 'Tienda física' && <Store className="w-3.5 h-3.5 text-white/60" />}
                          {rec.channel === 'WhatsApp' && <MessageCircle className="w-3.5 h-3.5 text-[#30D158]" />}
                          {rec.channel === 'Web' && <Globe className="w-3.5 h-3.5 text-[#007AFF]" />}
                          {rec.channel === 'B2B Corporativo' && <Building2 className="w-3.5 h-3.5 text-purple-400" />}
                          {rec.channel}
                        </span>
                        <span className="text-[#8E8E93] mt-0.5">{rec.payment}</span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-4.5 px-6 text-right">
                      <span className="font-display font-extrabold text-lg text-white">
                        S/ {rec.total.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#30D158] block">
                        ✓ {rec.status}
                      </span>
                    </td>

                    {/* Botón Ver Comprobante */}
                    <td className="py-4.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedRecordForInvoice(rec)}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#007AFF] text-white text-xs font-bold transition-all duration-200 ease-spring active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                        title="Ver comprobante y opción de impresión"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Responsive) */}
        <div className="lg:hidden divide-y divide-white/[0.08]">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-[#8E8E93]">
              <Receipt className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="font-bold text-white">Sin ventas que mostrar</p>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div key={rec.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase ${
                        rec.type === 'Factura'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-[#007AFF]/20 text-[#007AFF]'
                      }`}
                    >
                      {rec.type}
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {rec.sunatNumber}
                    </span>
                  </div>
                  <span className="font-display font-extrabold text-white text-lg">
                    S/ {rec.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                  <span className="text-white font-medium">{rec.client}</span>
                  <span className="font-mono">{rec.date || todayStr} • {rec.time}</span>
                </div>

                {rec.itemsSummary && (
                  <p className="text-xs text-[#8E8E93] bg-white/[0.03] p-2 rounded-xl">
                    🛍️ {rec.itemsSummary}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#A1A1A6] font-medium flex items-center gap-1.5">
                    <span>{rec.channel}</span>
                    <span>•</span>
                    <span>{rec.payment}</span>
                  </span>

                  <button
                    onClick={() => setSelectedRecordForInvoice(rec)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#007AFF]" />
                    <span>Ver Ticket</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
