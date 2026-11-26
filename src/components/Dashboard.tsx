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
import { Toast, useToastNotification } from './ui/Toast';
import { SegmentedControl, type SegmentOption } from './ui/SegmentedControl';
import type { UserSession, AuditRecord, Product } from '../types';
import { INITIAL_AUDIT_RECORDS, INITIAL_PRODUCTS, MONTHLY_SALES_DATA } from '../data/initialData';

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
  const [timeframe, setTimeframe] = useState<Timeframe>('hoy');
  const [docFilter, setDocFilter] = useState<DocFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const { toast, showNotification, clearToast } = useToastNotification();

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

  const records = auditRecords || INITIAL_AUDIT_RECORDS;
  const catalogProducts = products && products.length > 0 ? products : INITIAL_PRODUCTS;

  // Live revenue & pairs calculations from actual auditRecords
  const initialBaseSum = INITIAL_AUDIT_RECORDS.reduce((acc, r) => acc + r.total, 0);
  const liveSum = records.reduce((acc, r) => acc + r.total, 0);
  const addedRevenue = Math.max(0, liveSum - initialBaseSum);

  const initialStoreSum = INITIAL_AUDIT_RECORDS
    .filter((r) => r.channel.toLowerCase().includes('tienda'))
    .reduce((acc, r) => acc + r.total, 0);
  const liveStoreSum = records
    .filter((r) => r.channel.toLowerCase().includes('tienda'))
    .reduce((acc, r) => acc + r.total, 0);
  const addedStoreRevenue = Math.max(0, liveStoreSum - initialStoreSum);
  const addedDigitalRevenue = Math.max(0, addedRevenue - addedStoreRevenue);

  const initialPairsSum = INITIAL_AUDIT_RECORDS.reduce((acc, r) => acc + (r.itemsCount || 1), 0);
  const livePairsSum = records.reduce((acc, r) => acc + (r.itemsCount || 1), 0);
  const addedPairs = Math.max(0, livePairsSum - initialPairsSum);

  // Dynamically determine Top Product from records + catalogProducts
  const productSalesMap = new Map<string, { product: Product; pairs: number }>();
  catalogProducts.forEach((p, idx) => {
    // Base pairs aligned with presentation (Adidas Runfalcon leads initially)
    const basePairs = idx === 0 ? 16 : idx === 1 ? 14 : idx === 2 ? 11 : Math.max(2, 10 - idx);
    productSalesMap.set(p.id, { product: p, pairs: basePairs });
  });

  // Add pairs from any new sales recorded after INITIAL_AUDIT_RECORDS
  const newRecords = records.filter(
    (r) => !INITIAL_AUDIT_RECORDS.some((init) => init.id === r.id)
  );
  newRecords.forEach((rec) => {
    const summary = (rec.itemsSummary || '').toLowerCase();
    let matched = false;
    catalogProducts.forEach((p) => {
      if (summary.includes(p.name.toLowerCase())) {
        matched = true;
        const entry = productSalesMap.get(p.id);
        if (entry) {
          // Extract specific quantity "xN" if present, else use itemsCount
          const regex = new RegExp(`${p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^,]*x(\\d+)`, 'i');
          const m = (rec.itemsSummary || '').match(regex);
          const qty = m ? parseInt(m[1], 10) : (rec.itemsCount || 1);
          entry.pairs += qty;
        }
      }
    });
    if (!matched && catalogProducts[0]) {
      const firstEntry = productSalesMap.get(catalogProducts[0].id);
      if (firstEntry) firstEntry.pairs += rec.itemsCount || 1;
    }
  });

  const sortedTopProducts = Array.from(productSalesMap.values()).sort((a, b) => b.pairs - a.pairs);
  const topSeller = sortedTopProducts[0]?.product || catalogProducts[0];
  const topSellerMargin = topSeller.cost
    ? (((topSeller.price - topSeller.cost) / topSeller.price) * 100).toFixed(1)
    : '42.8';

  const formatSoles = (val: number) => {
    const hasDecimals = Math.round(val * 100) % 100 !== 0;
    return `S/ ${val.toLocaleString('es-PE', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Dynamic KPI values per timeframe driven by live records
  const hoyRevenue = liveSum;
  const semanaRevenue = 41451 + liveSum;
  const mesRevenue = 177931 + liveSum;
  const anioBaseSum = MONTHLY_SALES_DATA.reduce((acc, m) => acc + m.total, 0);
  const anioRevenue = anioBaseSum + addedRevenue;

  const hoyDigitalBase = 1450 + addedDigitalRevenue;
  const hoyStoreBase = 1050 + addedStoreRevenue;
  const hoyDigitalPct = Math.round((hoyDigitalBase / (hoyDigitalBase + hoyStoreBase)) * 100);

  const semanaDigitalPct = Math.round(((27395 + addedDigitalRevenue) / (48864 + addedRevenue)) * 100);
  const mesDigitalPct = Math.round(((100116 + addedDigitalRevenue) / (185400 + addedRevenue)) * 100);
  const anioDigitalPct = Math.round(((242300 + addedDigitalRevenue) / (anioBaseSum + addedRevenue)) * 100);

  const kpiData = {
    hoy: {
      total: formatSoles(hoyRevenue),
      change: `+${(8.4 + (addedRevenue / 450)).toFixed(1)}%`,
      topCount: 16 + addedPairs,
      digitalPct: hoyDigitalPct,
      storePct: 100 - hoyDigitalPct,
      metaPct: `${Math.min(100, Math.round((hoyRevenue / 8500) * 100))}%`,
    },
    semana: {
      total: formatSoles(semanaRevenue),
      change: `+${(11.7 + (addedRevenue / 2500)).toFixed(1)}%`,
      topCount: 88 + addedPairs,
      digitalPct: semanaDigitalPct,
      storePct: 100 - semanaDigitalPct,
      metaPct: `${Math.min(100, Math.round((semanaRevenue / 54000) * 100))}%`,
    },
    mes: {
      total: formatSoles(mesRevenue),
      change: `+${(14.2 + (addedRevenue / 8000)).toFixed(1)}%`,
      topCount: 340 + addedPairs,
      digitalPct: mesDigitalPct,
      storePct: 100 - mesDigitalPct,
      metaPct: `${Math.min(100, Math.round((mesRevenue / 200000) * 100))}%`,
    },
    anio: {
      total: formatSoles(anioRevenue),
      change: `+${(22.6 + (addedRevenue / 25000)).toFixed(1)}%`,
      topCount: 2840 + addedPairs,
      digitalPct: anioDigitalPct,
      storePct: 100 - anioDigitalPct,
      metaPct: `${Math.min(100, Math.round((anioRevenue / 480000) * 100))}%`,
    },
  }[timeframe];

  // Dynamic monthly chart data (OCT reflects live new sales)
  const dynamicMonthlyData = MONTHLY_SALES_DATA.map((item, idx) => {
    if (idx === MONTHLY_SALES_DATA.length - 1) {
      const updatedDigital = Math.round(item.digital + addedDigitalRevenue);
      const updatedStore = Math.round(item.store + addedStoreRevenue);
      return {
        ...item,
        digital: updatedDigital,
        store: updatedStore,
        total: updatedDigital + updatedStore,
      };
    }
    return item;
  });

  const extraTxCount = Math.max(0, records.length - INITIAL_AUDIT_RECORDS.length);
  const dynamicConversion = (3.8 + extraTxCount * 0.1).toFixed(1);
  const dynamicConversionDelta = `+${(0.6 + extraTxCount * 0.1).toFixed(1)}%`;

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
      {/* Centered Pill Toast Notification with x2/x3 Counter */}
      <Toast message={toast} onClose={clearToast} />

      {/* Minimalist Oversized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 stagger-1">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
          Hola, {firstName}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={timeframeOptions}
            value={timeframe}
            onChange={(val) => {
              setTimeframe(val);
              showNotification(`Vista filtrada: ${val.toUpperCase()}`, 'info');
            }}
            size="md"
          />
          <GlassButton
            variant="glass"
            size="md"
            icon={<Download className="w-4.5 h-4.5" />}
            onClick={() => showNotification('Reporte BI exportado en formato oficial', 'success')}
          >
            Exportar
          </GlassButton>
        </div>
      </div>

      {/* 3 Minimalist Oversized Hero KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 stagger-2">
        {/* KPI 1: Ingresos */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[200px] sm:min-h-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#8E8E93]">Ingresos</span>
            <Badge variant="neutral" icon={<ArrowUpRight className="w-4 h-4 text-[#007AFF]" />}>
              {kpiData.change}
            </Badge>
          </div>

          <div className="my-4">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight block">
              {kpiData.total}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-[#8E8E93]">
              <span>Meta ({records.length} ventas)</span>
              <span className="text-white font-bold">{kpiData.metaPct}</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007AFF] rounded-full transition-all duration-700 ease-spring"
                style={{ width: kpiData.metaPct }}
              />
            </div>
          </div>
        </GlassCard>

        {/* KPI 2: Más Vendido */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[200px] sm:min-h-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#8E8E93]">Más Vendido</span>
            <span className="text-sm font-bold text-[#007AFF] truncate max-w-[160px]">{topSeller.name}</span>
          </div>

          <div className="my-4 flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
                {kpiData.topCount}
              </span>
              <span className="text-base sm:text-lg text-[#8E8E93] font-semibold">pares</span>
            </div>

            <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-2xl overflow-hidden border border-white/10 bg-black shrink-0">
              <img
                src={topSeller.image}
                alt={topSeller.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-[#8E8E93] font-medium">
            <span>{topSeller.brand} • {livePairsSum} pares hoy</span>
            <span className="text-white font-bold">+{topSellerMargin}% margen</span>
          </div>
        </GlassCard>

        {/* KPI 3: Canales */}
        <GlassCard hoverEffect className="flex flex-col justify-between min-h-[200px] sm:min-h-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#8E8E93]">Canales</span>
            <span className="text-sm font-semibold text-[#8E8E93]">Digital / Tienda</span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              {kpiData.digitalPct}%
            </span>
            <span className="text-xl sm:text-2xl font-bold font-display text-[#636366]">
              / {kpiData.storePct}%
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="w-full h-3 bg-white/[0.08] rounded-full overflow-hidden flex gap-1">
              <div
                className="h-full bg-[#007AFF] rounded-full transition-all duration-700 ease-spring"
                style={{ width: `${kpiData.digitalPct}%` }}
              />
              <div
                className="h-full bg-[#3A3A3C] rounded-full transition-all duration-700 ease-spring"
                style={{ width: `${kpiData.storePct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-medium text-[#8E8E93]">
              <span className="text-white">Digital</span>
              <span>Tienda Física</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Middle Row: PowerBI-Caliber Thick Column Chart + 3 Minimalist Metric Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 stagger-3">
        {/* Sales Chart (8 cols) */}
        <GlassCard className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
                Ventas Anuales
              </h3>
            </div>

            <div className="flex items-center gap-6 text-sm font-bold">
              <span className="flex items-center gap-2.5 text-white">
                <span className="w-3.5 h-3.5 rounded-[4px] bg-[#007AFF]" /> Digital
              </span>
              <span className="flex items-center gap-2.5 text-[#8E8E93]">
                <span className="w-3.5 h-3.5 rounded-[4px] bg-[#3A3A3C]" /> Tienda
              </span>
            </div>
          </div>

          {/* PowerBI-Inspired Thick Bar Visualizer with Responsive Scroll */}
          <div className="overflow-x-auto custom-scrollbar pb-2">
            <div className="relative h-80 flex pt-6 pb-2 min-w-[500px] sm:min-w-full">
            {/* Y-Axis Scale Labels */}
            <div className="flex flex-col justify-between pr-4 pb-8 text-xs font-mono font-semibold text-[#636366] select-none shrink-0 text-right w-12">
              <span>65k</span>
              <span>50k</span>
              <span>35k</span>
              <span>20k</span>
              <span>0</span>
            </div>

            {/* Chart Plot Area */}
            <div className="relative flex-1 flex items-end justify-between gap-2 sm:gap-3.5 pb-8 border-b border-white/[0.12]">
              {/* Horizontal Reference Grid Lines */}
              <div className="absolute inset-0 bottom-8 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-b border-dashed border-white/[0.06]" />
                <div className="w-full border-b border-dashed border-white/[0.06]" />
                <div className="w-full border-b border-dashed border-white/[0.06]" />
                <div className="w-full border-b border-dashed border-white/[0.06]" />
                <div className="w-full" />
              </div>

              {dynamicMonthlyData.map((item) => {
                const maxVal = 65000;
                const digitalHeight = Math.min(100, Math.max((item.digital / maxVal) * 100, 8));
                const storeHeight = Math.min(100, Math.max((item.store / maxVal) * 100, 8));
                const totalK = Math.round(item.total / 1000);
                const isHovered = hoveredMonth === item.month;

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredMonth(item.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    onClick={() => showNotification(`${item.month}: S/ ${item.total.toLocaleString()}`)}
                    className="relative z-10 flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {/* Detailed Floating Popover on Hover */}
                    {isHovered && (
                      <div className="absolute -top-16 z-30 px-4 py-2.5 rounded-2xl bg-[#18181B] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-xs text-white whitespace-nowrap pointer-events-none animate-scale-in">
                        <div className="font-extrabold text-sm mb-0.5">
                          {item.month} — S/ {item.total.toLocaleString()}
                        </div>
                        <div className="text-[#A1A1A6] font-mono text-[11px]">
                          Digital: S/ {item.digital.toLocaleString()} • Tienda: S/ {item.store.toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Top Value Callout (PowerBI style data label) */}
                    <span
                      className={`text-[11px] font-mono font-bold mb-2 transition-all duration-300 ${
                        isHovered ? 'text-white scale-110' : 'text-[#8E8E93]'
                      }`}
                    >
                      {totalK}k
                    </span>

                    {/* Thick Bar Pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full px-0.5">
                      {/* Store Bar (Neutral Ash Gray) */}
                      <div
                        className={`w-1/2 max-w-[20px] rounded-t-lg transition-all duration-500 ease-spring ${
                          isHovered ? 'bg-[#52525B]' : 'bg-[#3A3A3C]'
                        }`}
                        style={{ height: `${storeHeight}%` }}
                      />
                      {/* Digital Bar (Solid Blue Accent) */}
                      <div
                        className={`w-1/2 max-w-[20px] rounded-t-lg transition-all duration-500 ease-spring ${
                          isHovered ? 'bg-[#268FFF]' : 'bg-[#007AFF]'
                        }`}
                        style={{ height: `${digitalHeight}%` }}
                      />
                    </div>

                    {/* X-Axis Month Label */}
                    <span
                      className={`absolute -bottom-7 text-xs font-bold transition-colors duration-200 ${
                        isHovered ? 'text-white' : 'text-[#8E8E93]'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </GlassCard>

        {/* Side Metric Blocks (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5">
          <GlassCard hoverEffect className="flex-1 flex items-center justify-between py-6 px-7">
            <div className="space-y-1.5">
              <span className="text-base font-semibold text-[#8E8E93] block">Conversión</span>
              <Badge variant="neutral">{dynamicConversionDelta}</Badge>
            </div>
            <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              {dynamicConversion}%
            </span>
          </GlassCard>

          <GlassCard hoverEffect className="flex-1 flex items-center justify-between py-6 px-7">
            <div className="space-y-1">
              <span className="text-base font-semibold text-[#8E8E93] block">Entrega</span>
              <span className="text-sm font-medium text-[#A1A1A6] block">Lima</span>
            </div>
            <span className="text-4xl xl:text-5xl font-extrabold font-display text-white tracking-tight">
              24h
            </span>
          </GlassCard>

          <GlassCard hoverEffect className="flex-1 flex items-center justify-between py-6 px-7">
            <div className="space-y-1">
              <span className="text-base font-semibold text-[#8E8E93] block">Satisfacción</span>
              <span className="text-sm font-medium text-[#8E8E93] block">NPS</span>
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
              <Search className="w-5 h-5 text-[#8E8E93] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente o ticket..."
                className="pl-12 pr-5 py-2.5 rounded-full bg-[#141414] border border-white/[0.08] text-base text-white placeholder-[#636366] focus:outline-none focus:border-white/30 transition-all duration-300 ease-spring w-64 md:w-72"
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
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#8E8E93] font-semibold text-sm">
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
                  <td colSpan={5} className="py-12 text-center text-[#8E8E93] text-base">
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
                      <span className="text-xs text-[#8E8E93] font-mono">{rec.time}</span>
                    </td>
                    <td className="py-4.5 px-4 text-white font-bold">{rec.client}</td>
                    <td className="py-4.5 px-4 text-[#A1A1A6] font-medium">
                      <span className="inline-flex items-center gap-2">
                        {rec.channel === 'Tienda física' && <Store className="w-4 h-4 text-white/60" />}
                        {rec.channel === 'WhatsApp' && <MessageCircle className="w-4 h-4 text-white/60" />}
                        {rec.channel === 'Web' && <Globe className="w-4 h-4 text-white/60" />}
                        {rec.channel === 'B2B Corporativo' && <Building2 className="w-4 h-4 text-white/60" />}
                        {rec.channel}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 text-[#8E8E93] font-medium">{rec.payment}</td>
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
          <span className="text-sm font-medium text-[#8E8E93]">
            {filteredRecords.length} registros
          </span>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="glass"
              size="md"
              icon={<FileSpreadsheet className="w-4.5 h-4.5" />}
              onClick={() => showNotification('Libro Excel exportado con éxito', 'success')}
            >
              Excel
            </GlassButton>
            <GlassButton
              variant="primary"
              size="md"
              icon={<FileText className="w-4.5 h-4.5" />}
              onClick={() => showNotification('Libro Electrónico PLE 14.1 generado', 'success')}
            >
              Declarar PLE
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
