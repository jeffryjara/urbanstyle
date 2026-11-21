import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  Zap,
  Package,
  FileText,
  UserCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { Badge } from './ui/Badge';
import { InvoiceModal } from './ui/InvoiceModal';
import { EditCustomerModal } from './ui/EditCustomerModal';
import { Toast } from './ui/Toast';
import type { UserSession, Product, CartItem, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface PosProps {
  user: UserSession;
  onNavigateToDashboard: () => void;
}

type FilterCategory = 'todos' | 'nike' | 'adidas' | 'puma' | 'talla-40' | 'talla-42' | 'nuevos';

export const Pos: React.FC<PosProps> = ({
  user,
  onNavigateToDashboard,
}) => {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    INITIAL_PRODUCTS.forEach((p) => {
      if (p.sizes.length > 0) initial[p.id] = p.sizes[0];
    });
    return initial;
  });

  // Cart State (Initialized with 2 items to match Screenshot 3)
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0], // Adidas Ultraboost
      selectedSize: 42,
      quantity: 1,
    },
    {
      product: INITIAL_PRODUCTS[1], // Nike Air Max 270
      selectedSize: 40,
      quantity: 1,
    },
  ]);

  const [documentType, setDocumentType] = useState<'Boleta' | 'Factura'>('Boleta');
  const [clientDoc, setClientDoc] = useState('00000000');
  const [clientName, setClientName] = useState('Consumidor Final');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Yape');
  const [orderNumber, setOrderNumber] = useState('#ORD-8492');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'nike':
        return product.brand === 'Nike';
      case 'adidas':
        return product.brand === 'Adidas';
      case 'puma':
        return product.brand === 'Puma';
      case 'talla-40':
        return product.sizes.includes(40);
      case 'talla-42':
        return product.sizes.includes(42);
      case 'nuevos':
        return !!product.isNew;
      case 'todos':
      default:
        return true;
    }
  });

  const handleSelectSize = (productId: string, size: number) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || 40;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        if (updated[existingIndex].quantity < product.stock) {
          updated[existingIndex].quantity += 1;
          showNotification(`+1 ${product.name} (Talla ${size})`);
        } else {
          showNotification(`Stock máximo alcanzado (${product.stock} disp.)`);
        }
        return updated;
      } else {
        showNotification(`${product.name} agregado a la orden`);
        return [...prev, { product, selectedSize: size, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, size: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === size) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              showNotification(`Stock máximo: ${item.product.stock} unidades`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (productId: string, size: number) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.selectedSize === size)));
  };

  // Financial Calculations
  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const subtotal = Number((total / 1.18).toFixed(2));
  const igv = Number((total - subtotal).toFixed(2));

  const handleProcessSale = () => {
    if (cart.length === 0) {
      showNotification('La orden está vacía. Seleccione calzado para cobrar.');
      return;
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#007AFF', '#30D158', '#58A6FF', '#ffffff'],
      });
    } catch {
      // safe fallback
    }

    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceClose = () => {
    setIsInvoiceModalOpen(false);
    const currentNum = parseInt(orderNumber.replace('#ORD-', ''), 10) || 8492;
    setOrderNumber(`#ORD-${currentNum + 1}`);
    setCart([]);
    showNotification('Venta registrada con éxito. Lista para nueva orden.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Apple Liquid Glass Toast Notification */}
      <Toast message={notification} onClose={() => setNotification(null)} />

      {/* Main POS Container: Catalog Grid + Right Checkout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center: Catalog & Products Grid (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Title & Search Bar */}
          <div className="space-y-3">
            {/* Search Input with ⌘ K badge */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo, SKU o código..."
                className="w-full pl-10 pr-14 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
              />
              <span className="absolute right-3 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-[#86868B]">
                ⌘ K
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {[
                { id: 'todos', label: `Todos (${products.length})` },
                { id: 'nike', label: 'Nike' },
                { id: 'adidas', label: 'Adidas' },
                { id: 'puma', label: 'Puma' },
                { id: 'talla-40', label: 'Talla 40' },
                { id: 'talla-42', label: 'Talla 42' },
                { id: 'nuevos', label: '● Nuevos' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id as FilterCategory)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedFilter === pill.id
                      ? 'bg-apple-blue text-white shadow-apple-glow font-semibold'
                      : 'bg-white/[0.04] text-[#86868B] hover:text-white hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-[#86868B]">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No hay zapatillas que coincidan con la búsqueda.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const currentSelectedSize = selectedSizes[product.id] || product.sizes[0];

                return (
                  <GlassCard
                    key={product.id}
                    hoverEffect
                    className="p-3.5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Frame with SKU Tag & Real Stock Badge */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 border border-white/10 mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                        {/* SKU floating badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-[#A1A1A6]">
                          {product.sku}
                        </div>

                        {/* Stock indicator badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="emerald" dot className="text-[10px] py-0.5 px-2">
                            {product.stock} disp.
                          </Badge>
                        </div>
                      </div>

                      {/* Product Name & Brand */}
                      <h4 className="text-xs md:text-sm font-bold font-display text-white line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#86868B] mt-0.5 mb-2">
                        {product.category}
                      </p>

                      {/* Size Selector Pills */}
                      <div className="flex items-center gap-1.5 my-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSelectSize(product.id, size)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                              currentSelectedSize === size
                                ? 'bg-apple-blue text-white shadow-sm font-semibold'
                                : 'bg-white/5 text-[#86868B] hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price & Add to Cart button */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[#86868B]">Precio inc. IGV</span>
                        <span className="text-sm md:text-base font-extrabold font-display text-white">
                          S/ {product.price.toFixed(2)}
                        </span>
                      </div>

                      <GlassButton
                        variant="primary"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => handleAddToCart(product)}
                      >
                        Agregar
                      </GlassButton>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>

        {/* Right Checkout Panel: Terminal de Cobro Liquid Glass (4 cols on lg) */}
        <div className="lg:col-span-4">
          <GlassCard className="p-5 sticky top-20 space-y-4">
            {/* Header: Orden & Ticket ID */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-[#86868B] tracking-wider uppercase">
                Orden
              </span>
              <span className="font-mono text-sm font-bold text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                {orderNumber}
              </span>
            </div>

            {/* Document Type Selector [Boleta] / [Factura] */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
              <button
                onClick={() => {
                  setDocumentType('Boleta');
                  setClientName('Consumidor Final');
                  setClientDoc('00000000');
                }}
                className={`py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  documentType === 'Boleta'
                    ? 'bg-white/15 text-white shadow-sm font-semibold'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Boleta
              </button>
              <button
                onClick={() => {
                  setDocumentType('Factura');
                  setClientName('Inversiones Deportivas S.A.C.');
                  setClientDoc('20608941231');
                }}
                className={`py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  documentType === 'Factura'
                    ? 'bg-white/15 text-white shadow-sm font-semibold'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                Factura
              </button>
            </div>

            {/* Customer Pill Selector */}
            <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-apple-blue shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white truncate max-w-[140px]">
                    {clientName}
                  </span>
                  <span className="text-[10px] text-[#86868B] font-mono">
                    {documentType === 'Factura' ? 'RUC: ' : 'DNI: '}{clientDoc}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditCustomerOpen(true)}
                className="text-[11px] font-medium text-apple-blue hover:text-apple-blueLight px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                Editar
              </button>
            </div>

            {/* Selected Items List */}
            <div>
              <div className="flex justify-between items-center text-xs text-[#86868B] mb-2 font-medium">
                <span>Ítems Seleccionados</span>
                <span>{cart.reduce((a, b) => a + b.quantity, 0)} artículos</span>
              </div>

              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {cart.length === 0 ? (
                  <div className="py-6 text-center text-[#636366] text-xs">
                    Sin artículos en la orden
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-[#86868B]">
                          Talla: <strong className="text-white">{item.selectedSize}</strong> | SKU: {item.product.sku}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity controls */}
                        <div className="flex items-center rounded-lg bg-black/40 border border-white/10 p-0.5">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.selectedSize, -1)}
                            className="p-1 text-[#86868B] hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-xs font-mono font-medium text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.selectedSize, 1)}
                            className="p-1 text-[#86868B] hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-mono font-bold text-white shrink-0 min-w-[55px] text-right">
                          S/ {(item.product.price * item.quantity).toFixed(2)}
                        </span>

                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveItem(item.product.id, item.selectedSize)}
                          className="p-1 text-[#86868B] hover:text-[#FF453A] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Official Payment Method Selector */}
            <div>
              <span className="text-xs font-medium text-[#86868B] block mb-2">
                Medio de Pago Oficial
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Yape', label: 'Yape', icon: <QrCode className="w-3.5 h-3.5 text-[#BF5AF2]" /> },
                  { id: 'Plin', label: 'Plin', icon: <QrCode className="w-3.5 h-3.5 text-[#5AC8FA]" /> },
                  { id: 'Efectivo', label: 'Efectivo', icon: <Banknote className="w-3.5 h-3.5 text-[#30D158]" /> },
                  { id: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-3.5 h-3.5 text-apple-blue" /> },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`p-2.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-apple-blue text-white shadow-sm'
                          : 'bg-white/[0.03] border-white/5 text-[#86868B] hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {m.icon}
                        {m.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#86868B]">
                <span>Subtotal (sin IGV):</span>
                <span className="font-mono text-white">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#86868B]">
                <span>IGV (18.00%):</span>
                <span className="font-mono text-white">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="pt-2 flex justify-between items-baseline text-white">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#86868B]">
                  Total a Pagar:
                </span>
                <span className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Prominent Action Button: "Procesar Venta & Emitir Comprobante" */}
            <GlassButton
              variant="primary"
              size="lg"
              disabled={cart.length === 0}
              icon={<Zap className="w-4 h-4" />}
              onClick={handleProcessSale}
              className="w-full mt-2"
            >
              Procesar Venta & Emitir Comprobante
            </GlassButton>
          </GlassCard>
        </div>
      </div>

      {/* Customer Information Edit Modal */}
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        currentName={clientName}
        currentDoc={clientDoc}
        currentDocType={documentType}
        onSave={(name, doc, type) => {
          setClientName(name);
          setClientDoc(doc);
          setDocumentType(type);
          showNotification('Datos del cliente actualizados');
        }}
      />

      {/* Official SUNAT Receipt / Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={handleInvoiceClose}
        documentType={documentType}
        orderNumber={orderNumber}
        items={cart}
        subtotal={subtotal}
        igv={igv}
        total={total}
        paymentMethod={paymentMethod}
        clientDoc={clientDoc}
        clientName={clientName}
      />
    </div>
  );
};
