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
    hoy: { total: 'S/ 8,450', change: '+8.4%', topCount: 16, digitalPct: 58, storePct: 42, metaPct: '94%' },
    semana: { total: 'S/ 48,920', change: '+11.7%', topCount: 88, digitalPct: 56, storePct: 44, metaPct: '91%' },
    mes: { total: 'S/ 185,400', change: '+14.2%', topCount: 340, digitalPct: 54, storePct: 46, metaPct: '93%' },
    anio: { total: 'S/ 1,480,200', change: '+22.6%', topCount: 2840, digitalPct: 52, storePct: 48, metaPct: '96%' },
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

  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-8 pb-8">
      {/* Toast Notification */}
      <Toast message={notification} onClose={() => setNotification(null)} />

      {/* Minimalist Oversized Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-1">
        <h2 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
          Hola, {firstName}
        </h2>

        <div className="flex flex-wrap items-center gap-3.5">
          <SegmentedControl
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
            size="md"
          />
          <GlassButton
            variant="glass"
            size="md"
            icon={<Download className="w-4.5 h-4.5" />}
            onClick={() => showNotification('Reporte exportado')}
          >
            Exportar
          </GlassButton>
        </div>
      </div>

      {/* 3 Minimalist Oversized Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-2">
        {/* KPI 1: Ingresos */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#86868B]">Ingresos</span>
            <Badge variant="emerald" icon={<ArrowUpRight className="w-4 h-4" />}>
              {kpiData.change}
            </Badge>
          </div>

          <div className="my-4">
            <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight block">
              {kpiData.total}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-[#86868B]">
              <span>Meta</span>
              <span className="text-white font-bold">{kpiData.metaPct}</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.07] rounded-full overflow-hidden">
              <div
                className="h-full bg-apple-blue rounded-full transition-all duration-700 ease-spring"
                style={{ width: kpiData.metaPct }}
              />
            </div>
          </div>
        </GlassCard>

        {/* KPI 2: Más Vendido */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#86868B]">Más Vendido</span>
            <span className="text-sm font-bold text-apple-blue">Ultraboost 22</span>
          </div>

          <div className="my-4 flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
                {kpiData.topCount}
              </span>
              <span className="text-lg text-[#86868B] font-semibold">pares</span>
            </div>

            <div className="w-24 h-16 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=240&q=80"
                alt="Ultraboost 22"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-[#86868B] font-medium">
            <span>Adidas Running</span>
            <span className="text-[#30D158] font-bold">+42.8% margen</span>
          </div>
        </GlassCard>

        {/* KPI 3: Canales */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#86868B]">Canales</span>
            <span className="text-sm font-semibold text-[#86868B]">Digital / Tienda</span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              {kpiData.digitalPct}%
            </span>
            <span className="text-2xl font-bold font-display text-[#636366]">
              / {kpiData.storePct}%
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="w-full h-3 bg-white/[0.07] rounded-full overflow-hidden flex gap-1">
              <div
                className="h-full bg-apple-blue rounded-full transition-all duration-700 ease-spring"
                style={{ width: `${kpiData.digitalPct}%` }}
              />
              <div
                className="h-full bg-white/25 rounded-full transition-all duration-700 ease-spring"
                style={{ width: `${kpiData.storePct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-medium text-[#86868B]">
              <span className="text-white">Digital</span>
              <span>Tienda Física</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Middle Row: Sales Chart + 3 Minimalist Metric Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-3">
        {/* Sales Chart (8 cols) */}
        <GlassCard className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
              Ventas Anuales
            </h3>

            <div className="flex items-center gap-5 text-sm font-semibold">
              <span className="flex items-center gap-2 text-white">
                <span className="w-3 h-3 rounded-full bg-apple-blue" /> Digital
              </span>
              <span className="flex items-center gap-2 text-[#86868B]">
                <span className="w-3 h-3 rounded-full bg-white/25" /> Tienda
              </span>
            </div>
          </div>

          {/* Minimalist Bar Chart Visualizer */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 relative">
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
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-3.5 py-2 rounded-2xl bg-[#161822] border border-white/15 shadow-2xl text-xs text-white whitespace-nowrap pointer-events-none animate-scale-in">
                      <span className="font-bold text-apple-blue mr-1.5">{item.month}</span>
                      <span className="font-extrabold">S/ {item.total.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div
                      className="w-1/2 max-w-[14px] bg-white/20 group-hover:bg-white/40 rounded-t-lg transition-all duration-500 ease-spring"
                      style={{ height: `${storeHeight}%` }}
                    />
                    <div
                      className="w-1/2 max-w-[14px] bg-apple-blue group-hover:bg-apple-blueLight rounded-t-lg transition-all duration-500 ease-spring"
                      style={{ height: `${digitalHeight}%` }}
                    />
                  </div>

                  <span
                    className={`text-xs mt-3 font-semibold transition-colors duration-200 ${
                      isHovered ? 'text-white' : 'text-[#86868B]'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Side Metric Blocks (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5">
          <GlassCard hoverEffect className="flex-1 flex items-center justify-between py-6 px-7">
            <div className="space-y-1">
              <span className="text-base font-semibold text-[#86868B] block">Conversión</span>
              <Badge variant="emerald">+0.6%</Badge>
            </div>
            <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              3.8%
            </span>
          </GlassCard>

          <GlassCard hoverEffect className="flex-1 flex items-center justify-between py-6 px-7">
            <div className="space-y-1">
              <span className="text-base font-semibold text-[#86868B] block">Entrega</span>
              <span className="text-sm font-medium text-[#30D158] block">Lima</span>
            </div>
            <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              24h
            </span>
          </GlassCard>

          <GlassCard hoverEffect className="flex-1 flex items-center justify-between py-6 px-7">
            <div className="space-y-1">
              <span className="text-base font-semibold text-[#86868B] block">Satisfacción</span>
              <span className="text-sm font-medium text-[#86868B] block">NPS</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
                94
              </span>
              <span className="text-lg font-bold text-[#636366]">/100</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Row: Clean Minimalist Transactions Table */}
      <GlassCard className="space-y-6 stagger-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Transacciones
          </h3>

          <div className="flex flex-wrap items-center gap-3.5">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#86868B] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente o ticket..."
                className="pl-12 pr-5 py-2.5 rounded-full bg-[#15161e] border border-white/[0.08] text-base text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue transition-all duration-300 ease-spring w-64 md:w-72"
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

        {/* Spacious Minimalist Table (5 Key Columns) */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#86868B] font-semibold text-sm">
                <th className="py-4 px-4">Comprobante</th>
                <th className="py-4 px-4">Cliente</th>
                <th className="py-4 px-4">Canal</th>
                <th className="py-4 px-4">Pago</th>
                <th className="py-4 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-base">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#86868B] text-base">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="py-4.5 px-4">
                      <span className="font-mono font-bold text-white block">
                        {rec.sunatNumber}
                      </span>
                      <span className="text-xs text-[#86868B] font-mono">{rec.time}</span>
                    </td>
                    <td className="py-4.5 px-4 text-white font-bold">{rec.client}</td>
                    <td className="py-4.5 px-4 text-[#A1A1A6] font-medium">
                      <span className="inline-flex items-center gap-2">
                        {rec.channel === 'Tienda Física' && <Store className="w-4 h-4 text-white/60" />}
                        {rec.channel === 'WhatsApp Store' && <MessageCircle className="w-4 h-4 text-[#30D158]" />}
                        {rec.channel === 'Web' && <Globe className="w-4 h-4 text-apple-blue" />}
                        {rec.channel === 'B2B Corporativo' && <Building2 className="w-4 h-4 text-[#BF5AF2]" />}
                        {rec.channel}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 text-[#86868B] font-medium">{rec.payment}</td>
                    <td className="py-4.5 px-4 text-right font-display font-extrabold text-lg text-white">
                      S/ {rec.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Table Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-[#86868B]">
            {filteredRecords.length} registros
          </span>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="glass"
              size="md"
              icon={<FileSpreadsheet className="w-4.5 h-4.5 text-apple-emerald" />}
              onClick={() => showNotification('Excel exportado')}
            >
              Excel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              icon={<FileText className="w-4.5 h-4.5" />}
              onClick={() => showNotification('PLE 14.1 generado')}
            >
              Declarar PLE
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
