import React, { useState, useMemo } from 'react';
import { X, Search, Package, AlertTriangle, Layers, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { ModalPortal } from './ModalPortal';
import { INITIAL_PRODUCTS } from '../../data/initialData';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('todos');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Compute stats
  const totalStock = useMemo(() => INITIAL_PRODUCTS.reduce((acc, p) => acc + p.stock, 0), []);
  const totalValuation = useMemo(() => INITIAL_PRODUCTS.reduce((acc, p) => acc + (p.price * p.stock), 0), []);
  const lowStockCount = useMemo(() => INITIAL_PRODUCTS.filter(p => p.stock <= 10).length, []);

  // Filtered list
  const filtered = useMemo(() => {
    return INITIAL_PRODUCTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand =
        selectedBrand === 'todos' || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      const matchesLowStock = !onlyLowStock || p.stock <= 10;

      return matchesSearch && matchesBrand && matchesLowStock;
    });
  }, [searchTerm, selectedBrand, onlyLowStock]);

  const brands = ['todos', 'Nike', 'Adidas', 'Puma', 'Under Armour'];

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-6xl h-[88vh] max-h-[920px] bg-[#0c0d12] border border-white/15 rounded-3xl md:rounded-[32px] p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden animate-scale-in text-[#F5F5F7] flex flex-col justify-between">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-apple-blue/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-apple-purple/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue shadow-[0_0_20px_rgba(0,122,255,0.25)]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight">
                  Control de Inventario & Stock Físico (3FN)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-apple-blue/10 border border-apple-blue/30 text-xs font-mono font-bold text-apple-blue">
                  Almacén Central
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#86868B] mt-0.5">
                Existencias en tiempo real por modelo, SKU comercial, tallas y valuación de almacén
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

        {/* Quick KPI Stat Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 relative z-10 shrink-0">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-apple-blue">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">Modelos</span>
              <span className="text-base font-bold font-display text-white">{INITIAL_PRODUCTS.length} SKUs</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#30D158]">
              <Package className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">Pares Totales</span>
              <span className="text-base font-bold font-display text-white">{totalStock} unidades</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blueLight">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">Valuación Stock</span>
              <span className="text-base font-bold font-mono text-white">S/ {totalValuation.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#FF9F0A]">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">Bajo Stock</span>
              <span className="text-base font-bold font-display text-[#FF9F0A]">{lowStockCount} alertas</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 relative z-10 shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md flex items-center">
            <Search className="w-5 h-5 text-[#86868B] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por modelo, marca o código SKU..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? 'bg-apple-blue text-white shadow-apple-glow'
                    : 'bg-white/[0.04] text-[#86868B] hover:text-white hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {b}
              </button>
            ))}

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyLowStock
                  ? 'bg-amber-500/20 text-[#FF9F0A] border border-amber-500/40 shadow-sm'
                  : 'bg-white/[0.04] text-[#86868B] hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Bajo Stock</span>
            </button>
          </div>
        </div>

        {/* Wide and Tall Table */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-white/10 rounded-2xl relative z-10 bg-white/[0.01]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#12131a] border-b border-white/10 text-xs text-[#86868B] uppercase tracking-wider font-bold sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="py-3.5 px-4">Calzado</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3">Categoría</th>
                <th className="py-3.5 px-3">Tallas Disponibles</th>
                <th className="py-3.5 px-3 text-right">Precio Venta</th>
                <th className="py-3.5 px-3 text-center">Stock Actual</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#86868B]">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No se encontraron productos con los filtros aplicados.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isLow = product.stock <= 10;
                  return (
                    <tr key={product.id} className="hover:bg-white/[0.03] transition-colors">
                      {/* Product Preview Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-11 h-11 rounded-xl object-cover bg-black/40 border border-white/10 shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-[200px] md:max-w-xs">
                              {product.name}
                            </span>
                            <span className="text-xs text-[#86868B]">
                              Marca: <strong className="text-[#A1A1A6] font-medium">{product.brand}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU Badge */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-apple-blue bg-apple-blue/10 border border-apple-blue/20 px-2 py-0.5 rounded-lg text-xs font-semibold">
                          {product.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-xs text-[#A1A1A6]">
                        {product.category}
                      </td>

                      {/* Available Sizes */}
                      <td className="py-3 px-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-[#D1D1D6]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-white text-base">
                        S/ {product.price.toFixed(2)}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono text-base font-extrabold ${isLow ? 'text-[#FF9F0A]' : 'text-white'}`}>
                          {product.stock}
                        </span>
                        <span className="text-[11px] text-[#86868B] block">pares</span>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <Badge variant="amber" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                            Reposición
                          </Badge>
                        ) : (
                          <Badge variant="emerald" dot>
                            Normal
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-[#86868B] relative z-10 shrink-0">
          <span>
            Mostrando <strong className="text-white">{filtered.length}</strong> de <strong className="text-white">{INITIAL_PRODUCTS.length}</strong> modelos registrados
          </span>
          <GlassButton variant="primary" size="md" onClick={onClose} className="text-sm font-semibold px-6">
            Aceptar
          </GlassButton>
        </div>
      </div>
    </ModalPortal>
  );
};
