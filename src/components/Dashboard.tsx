import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  ShoppingBag,
  Store,
  Globe,
  MessageCircle,
  Building2,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { Badge } from './ui/Badge';
import { Toast } from './ui/Toast';
import { SegmentedControl, type SegmentOption } from './ui/SegmentedControl';
import type { UserSession, AuditRecord, Product } from '../types';
import { INITIAL_AUDIT_RECORDS, MONTHLY_SALES_DATA } from '../data/initialData';

interface DashboardProps {
  user: UserSession;
  onNavigateToPos: () => void;
  auditRecords?: AuditRecord[];
  products?: Product[];
}

type Timeframe = 'hoy' | 'semana' | 'mes' | 'anio';
type DocFilter = 'todos' | 'boletas' | 'facturas';

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigateToPos,
  auditRecords,
  products,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('mes');
  const [docFilter, setDocFilter] = useState<DocFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const timeframeOptions: SegmentOption<Timeframe>[] = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'anio', label: 'Año' },
  ];

  const docFilterOptions: SegmentOption<DocFilter>[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'boletas', label: 'Boletas' },
    { id: 'facturas', label: 'Facturas' },
  ];

  // Dynamic KPI calculations based on timeframe
  const kpiData = {
    hoy: { total: 'S/ 8,450.00', change: '+8.4%', topCount: 16, digitalPct: 58, storePct: 42, metaPct: '94.1%' },
    semana: { total: 'S/ 48,920.00', change: '+11.7%', topCount: 88, digitalPct: 56, storePct: 44, metaPct: '91.5%' },
    mes: { total: 'S/ 185,400.00', change: '+14.2%', topCount: 340, digitalPct: 54, storePct: 46, metaPct: '92.7%' },
    anio: { total: 'S/ 1,480,200.00', change: '+22.6%', topCount: 2840, digitalPct: 52, storePct: 48, metaPct: '96.2%' },
  }[timeframe];

  const records = auditRecords || INITIAL_AUDIT_RECORDS;

  // Filtered audit records
  const filteredRecords = records.filter((rec) => {
    const matchesDoc =
      docFilter === 'todos'
        ? true
        : docFilter === 'boletas'
        ? rec.type === 'Boleta'
        : rec.type === 'Factura';

    const matchesSearch =
      searchQuery.trim() === '' ||
      rec.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sunatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.channel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDoc && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      <Toast message={notification} onClose={() => setNotification(null)} />

      {/* Welcome Headline & Timeframe Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white">
            Bienvenido, {user.name}
          </h2>
          <p className="text-sm md:text-base text-[#86868B] mt-1 font-medium">
            Resumen Ejecutivo Omnicanal de Calzado Deportivo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
            size="md"
          />
          <GlassButton
            variant="glass"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={() => showNotification('Reporte Ejecutivo BI exportado exitosamente.')}
          >
            Exportar BI
          </GlassButton>
        </div>
      </div>

      {/* 3 Featured KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Ingresos Totales */}
        <GlassCard hoverEffect className="relative overflow-hidden p-6">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-[#86868B]">Ingresos Totales</span>
            <Badge variant="emerald" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              {kpiData.change}
            </Badge>
          </div>

          <div className="mt-3">
            <span className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">
              {kpiData.total}
            </span>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/5">
            <div className="flex justify-between text-xs text-[#86868B] mb-2 font-medium">
              <span>Meta: S/ 200,000</span>
              <span className="font-mono text-apple-blue font-semibold">{kpiData.metaPct}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-apple-blue to-apple-blueLight rounded-full transition-all duration-500"
                style={{ width: kpiData.metaPct }}
              />
            </div>
          </div>
        </GlassCard>

        {/* KPI 2: Calzado Top Ventas */}
        <GlassCard hoverEffect className="relative overflow-hidden p-6">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-[#86868B]">Calzado Top Ventas</span>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-apple-blue">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold font-display text-white truncate max-w-[170px]">
                Adidas Ultraboost 22
              </h4>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-extrabold font-display text-white">
                  {kpiData.topCount}
                </span>
                <span className="text-sm text-[#86868B] font-medium">unds</span>
              </div>
            </div>

            {/* Sneaker Thumbnail */}
            <div className="w-18 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=200&q=80"
                alt="Ultraboost 22"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-between text-xs text-[#86868B] font-medium">
            <span>Margen: <strong className="text-[#30D158]">42.8%</strong></span>
            <span>Ticket Prom: <strong className="text-white font-mono">S/ 545.30</strong></span>
          </div>
        </GlassCard>

        {/* KPI 3: Distribución por Canal */}
        <GlassCard hoverEffect className="relative overflow-hidden p-6">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-[#86868B]">Distribución por Canal</span>
            <span className="text-xs font-mono text-[#86868B] font-medium">1,648 ops</span>
          </div>

          {/* Dual Visual Bar */}
          <div className="mt-4">
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-apple-blue transition-all duration-500"
                style={{ width: `${kpiData.digitalPct}%` }}
                title={`Digital: ${kpiData.digitalPct}%`}
              />
              <div
                className="h-full bg-white/20 transition-all duration-500"
                style={{ width: `${kpiData.storePct}%` }}
                title={`Tienda: ${kpiData.storePct}%`}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-white font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-apple-blue" />
                {kpiData.digitalPct}% Digital
              </span>
              <span className="text-xs text-[#86868B] mt-0.5 font-medium">890 pedidos</span>
            </div>

            <div className="flex flex-col text-right">
              <span className="flex items-center justify-end gap-2 text-white font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                {kpiData.storePct}% Tienda
              </span>
              <span className="text-xs text-[#86868B] mt-0.5 font-medium">758 compras</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Middle Row: Monthly Sales Comparison Chart + Side Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart (8 cols) */}
        <GlassCard className="lg:col-span-8 p-5 md:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Comparativa de Ventas Mensuales
              </h3>
              <p className="text-xs text-[#86868B]">Canales Digitales vs. Tienda Física</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#86868B]">
                <span className="w-2.5 h-2.5 rounded-sm bg-apple-blue" /> Digital
              </span>
              <span className="flex items-center gap-1.5 text-[#86868B]">
                <span className="w-2.5 h-2.5 rounded-sm bg-white/20" /> Tienda
              </span>
            </div>
          </div>

          {/* Chart Visualizer */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-white/10 relative">
            {MONTHLY_SALES_DATA.map((item) => {
              const maxVal = 65000;
              const digitalHeight = (item.digital / maxVal) * 100;
              const storeHeight = (item.store / maxVal) * 100;
              const isHovered = hoveredMonth === item.month;

              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-xl bg-black/90 border border-white/20 backdrop-blur-xl shadow-xl text-[10px] text-white whitespace-nowrap pointer-events-none animate-scale-in">
                      <span className="font-bold text-apple-blue">{item.month}:</span> S/ {item.total.toLocaleString()}
                      <div className="text-[#86868B] text-[9px]">
                        Dig: S/ {item.digital.toLocaleString()} | Tie: S/ {item.store.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Bar Pair */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Store Bar */}
                    <div
                      className="w-1/2 max-w-[12px] bg-white/20 group-hover:bg-white/35 rounded-t-sm transition-all duration-300"
                      style={{ height: `${storeHeight}%` }}
                    />
                    {/* Digital Bar */}
                    <div
                      className="w-1/2 max-w-[12px] bg-apple-blue group-hover:bg-apple-blueLight rounded-t-sm transition-all duration-300 shadow-[0_0_10px_rgba(0,122,255,0.3)]"
                      style={{ height: `${digitalHeight}%` }}
                    />
                  </div>

                  <span className={`text-[10px] mt-2 font-mono ${isHovered ? 'text-white font-bold' : 'text-[#86868B]'}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between items-center text-[11px] text-[#86868B]">
            <span>Cifras consolidadas en Nuevos Soles (S/)</span>
            <span className="font-mono text-apple-emerald font-medium">+18.4% Crecimiento Interanual</span>
          </div>
        </GlassCard>

        {/* Side Metric Widgets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Conversion Rate with Circular Indicator */}
          <GlassCard hoverEffect className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] block">Conversión Digital</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-white">3.8%</span>
                <span className="text-[10px] text-apple-emerald font-semibold">+0.6%</span>
              </div>
              <span className="text-[10px] text-[#86868B] mt-0.5 block">Embudo Web & WhatsApp</span>
            </div>

            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="#007AFF"
                  strokeWidth="3"
                  strokeDasharray="113"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-white font-mono">+0.6%</span>
            </div>
          </GlassCard>

          {/* Delivery Average */}
          <GlassCard hoverEffect className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] block">Entrega Promedio</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-display text-white">24h</span>
                <span className="text-xs text-apple-emerald font-medium">Lima Metrop.</span>
              </div>
              <span className="text-[10px] text-[#86868B] mt-0.5 block">Logística Same/Next-Day</span>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-apple-blue shrink-0">
              <Truck className="w-5 h-5" />
            </div>
          </GlassCard>

          {/* NPS Score */}
          <GlassCard hoverEffect className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] block">Índice NPS Clientes</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-display text-white">94</span>
                <span className="text-xs text-[#86868B]">/ 100</span>
              </div>
            </div>

            <Badge variant="emerald" className="font-semibold text-xs px-3 py-1">
              Excelente
            </Badge>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Row: Real-time Audit Table */}
      <GlassCard className="p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold font-display text-white">
              Auditoría de Transacciones en Tiempo Real
            </h3>
            <p className="text-sm text-[#86868B] mt-0.5">
              Sincronización continua de comprobantes electrónicos con SUNAT
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticket o cliente..."
                className="pl-10 pr-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all w-52 md:w-64"
              />
            </div>

            <SegmentedControl
              options={docFilterOptions}
              value={docFilter}
              onChange={setDocFilter}
              size="md"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#86868B] font-bold uppercase text-xs tracking-wider">
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-3.5">Hora</th>
                <th className="py-3 px-3.5">Cliente</th>
                <th className="py-3 px-3.5">Canal</th>
                <th className="py-3 px-3.5">Medio de Pago</th>
                <th className="py-3 px-3.5 text-right">Total</th>
                <th className="py-3 px-3.5">Comprobante SUNAT</th>
                <th className="py-3 px-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#86868B] text-sm">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    <td className="py-3.5 px-3.5 font-mono text-apple-blue font-semibold text-xs">
                      {rec.id}
                    </td>
                    <td className="py-3.5 px-3.5 text-[#86868B] text-xs">{rec.time}</td>
                    <td className="py-3.5 px-3.5 text-white font-medium">{rec.client}</td>
                    <td className="py-3.5 px-3.5 text-[#A1A1A6]">
                      <span className="inline-flex items-center gap-1.5">
                        {rec.channel === 'Tienda Física' && <Store className="w-3.5 h-3.5 text-white/60" />}
                        {rec.channel === 'WhatsApp Store' && <MessageCircle className="w-3.5 h-3.5 text-[#30D158]" />}
                        {rec.channel === 'Web' && <Globe className="w-3.5 h-3.5 text-apple-blue" />}
                        {rec.channel === 'B2B Corporativo' && <Building2 className="w-3.5 h-3.5 text-[#BF5AF2]" />}
                        {rec.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-[#86868B]">{rec.payment}</td>
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold text-white">
                      S/ {rec.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-xs text-apple-blueLight font-medium">
                      {rec.sunatNumber}
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      <Badge variant="emerald" dot className="text-xs py-0.5 px-2.5">
                        {rec.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#86868B]">
          <span>
            Mostrando {filteredRecords.length} de {records.length} registros auditados
          </span>

          <div className="flex items-center gap-2.5">
            <GlassButton
              variant="glass"
              size="md"
              icon={<FileSpreadsheet className="w-4 h-4 text-apple-emerald" />}
              onClick={() => showNotification('Libro de Ventas exportado en formato Excel.')}
            >
              Excel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => showNotification('Estructura PLE 14.1 (Registro de Ventas e Ingresos) generada.')}
            >
              Declarar PLE
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
