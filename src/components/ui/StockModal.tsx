import React, { useState } from 'react';
import { X, Search, Package, AlertTriangle } from 'lucide-react';
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

  const filtered = INITIAL_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-3xl bg-[#0e0e11] border border-white/15 rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden animate-scale-in text-[#F5F5F7]">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-apple-blue/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-apple-blue/15 border border-apple-blue/30 flex items-center justify-center text-apple-blue">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Control de Inventario & Stock Físico (3FN)
              </h3>
              <p className="text-xs md:text-sm text-[#86868B]">
                Existencias en tiempo real por modelo, SKU y talla comercial
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

        {/* Search Input */}
        <div className="my-4 relative flex items-center relative z-10">
          <Search className="w-5 h-5 text-[#86868B] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por modelo, marca o SKU..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
          />
        </div>

        {/* Table of SKUs and Stock */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl relative z-10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] border-b border-white/10 text-xs text-[#86868B] uppercase tracking-wider font-bold sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-3 px-3.5">SKU</th>
                <th className="py-3 px-3.5">Modelo / Calzado</th>
                <th className="py-3 px-3.5">Tallas Disponibles</th>
                <th className="py-3 px-3.5 text-right">Precio Venta</th>
                <th className="py-3 px-3.5 text-center">Stock Actual</th>
                <th className="py-3 px-3.5 text-center">Estado Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product) => {
                const isLow = product.stock <= 8;
                return (
                  <tr key={product.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3.5 font-mono text-apple-blue text-xs font-semibold">
                      {product.sku}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-white">{product.name}</div>
                      <div className="text-xs text-[#86868B]">{product.category}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-white/5 text-xs font-mono text-[#A1A1A6]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                      S/ {product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono font-bold text-white">
                      {product.stock}
                    </td>
                    <td className="py-3 px-3.5 text-center">
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
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-sm text-[#86868B] relative z-10">
          <span>Total: <strong className="text-white">{filtered.length}</strong> modelos sincronizados con el ERP</span>
          <GlassButton variant="primary" size="md" onClick={onClose} className="text-sm font-semibold">
            Aceptar
          </GlassButton>
        </div>
      </div>
    </ModalPortal>
  );
};
