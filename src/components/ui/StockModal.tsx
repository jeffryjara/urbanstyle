import React, { useState, useMemo } from 'react';
import { X, Search, Package, AlertTriangle, Layers, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { ModalPortal } from './ModalPortal';
import type { Product } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/initialData';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

export const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('todos');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const currentProducts = products || INITIAL_PRODUCTS;

  // Compute stats dynamically
  const totalStock = useMemo(() => currentProducts.reduce((acc, p) => acc + p.stock, 0), [currentProducts]);
  const totalValuation = useMemo(() => currentProducts.reduce((acc, p) => acc + (p.price * p.stock), 0), [currentProducts]);
  const lowStockCount = useMemo(() => currentProducts.filter(p => p.stock <= 10).length, [currentProducts]);

  // Dynamic brands list from live products
  const brands = useMemo(() => {
    const list = Array.from(new Set(currentProducts.map(p => p.brand)));
    return ['todos', ...list];
  }, [currentProducts]);

  // Filtered list
  const filtered = useMemo(() => {
    return currentProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand =
        selectedBrand === 'todos' || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      const matchesLowStock = !onlyLowStock || p.stock <= 10;

      return matchesSearch && matchesBrand && matchesLowStock;
    });
  }, [currentProducts, searchTerm, selectedBrand, onlyLowStock]);

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-6xl h-[88vh] max-h-[900px] bg-[#0c0d12] border border-white/[0.08] rounded-[34px] p-7 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden animate-scale-in text-[#F5F5F7] flex flex-col justify-between">
        {/* Top Minimalist Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.07] relative z-10 shrink-0">
          <h3 className="text-3xl md:text-4xl font-extrabold font-display text-white tracking-tight">
            Inventario
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/[0.05] text-[#86868B] hover:text-white hover:bg-white/10 transition-all duration-300 ease-spring cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 4 Oversized Minimalist KPI Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 relative z-10 shrink-0">
          <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.06]">
            <span className="text-sm font-semibold text-[#86868B] block">Modelos</span>
            <span className="text-3xl font-extrabold font-display text-white mt-1 block">
              {currentProducts.length}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.06]">
            <span className="text-sm font-semibold text-[#86868B] block">Pares</span>
            <span className="text-3xl font-extrabold font-display text-white mt-1 block">
              {totalStock}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.06]">
            <span className="text-sm font-semibold text-[#86868B] block">Valorización</span>
            <span className="text-3xl font-extrabold font-display text-white mt-1 block">
              S/ {totalValuation.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#13141c] border border-white/[0.06]">
            <span className="text-sm font-semibold text-[#86868B] block">Bajo Stock</span>
            <span className="text-3xl font-extrabold font-display text-[#FF9F0A] mt-1 block">
              {lowStockCount}
            </span>
          </div>
        </div>

        {/* Search & Brand Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 relative z-10 shrink-0">
          <div className="relative w-full sm:max-w-sm flex items-center">
            <Search className="w-5 h-5 text-[#86868B] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar modelo o SKU..."
              className="w-full pl-12 pr-5 py-3 rounded-full bg-[#13141c] border border-white/[0.08] text-base text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue transition-all duration-300 ease-spring"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-4.5 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300 ease-spring cursor-pointer shrink-0 ${
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#13141c] text-[#86868B] hover:text-white border border-white/[0.06]'
                }`}
              >
                {b}
              </button>
            ))}

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-4.5 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition-all duration-300 ease-spring cursor-pointer shrink-0 ${
                onlyLowStock
                  ? 'bg-amber-500/20 text-[#FF9F0A] border border-amber-500/40'
                  : 'bg-[#13141c] text-[#86868B] hover:text-white border border-white/[0.06]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Bajo Stock</span>
            </button>
          </div>
        </div>

        {/* Clean 5-Column Inventory Table */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar no-scrollbar border border-white/[0.07] rounded-2xl relative z-10 bg-[#0f1016]">
          <table className="w-full text-left text-base">
            <thead className="bg-[#14151e] border-b border-white/[0.07] text-sm text-[#86868B] font-semibold sticky top-0 z-10">
              <tr>
                <th className="py-4 px-5">Calzado</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Tallas</th>
                <th className="py-4 px-4 text-center">Stock</th>
                <th className="py-4 px-5 text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#86868B]">
                    <p className="text-base">Sin resultados</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isLow = product.stock <= 10;
                  return (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-2xl object-cover bg-black/40 border border-white/10 shrink-0"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white text-base block truncate max-w-[240px]">
                              {product.name}
                            </span>
                            <span className="text-xs font-semibold text-[#86868B]">
                              {product.brand}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-sm text-[#A1A1A6] font-semibold">
                        {product.sku}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-xs font-mono font-bold text-[#D1D1D6]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-display text-lg font-extrabold ${
                            isLow ? 'text-[#FF9F0A]' : 'text-[#30D158]'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right font-display font-extrabold text-white text-lg">
                        S/ {product.price.toFixed(0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Minimalist Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.07] flex items-center justify-between text-sm text-[#86868B] relative z-10 shrink-0">
          <span className="font-medium">
            {filtered.length} modelos
          </span>
          <GlassButton variant="primary" size="md" onClick={onClose} className="px-7">
            Cerrar
          </GlassButton>
        </div>
      </div>
    </ModalPortal>
  );
};
