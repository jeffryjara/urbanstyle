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
import type { UserSession, Product, CartItem, PaymentMethod, AuditRecord } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

interface PosProps {
  user: UserSession;
  onNavigateToDashboard: () => void;
  products?: Product[];
  onAddSale?: (record: AuditRecord) => void;
}

type FilterCategory = 'todos' | 'adidas' | 'nike' | 'puma' | 'reebok' | 'new-balance' | 'vans' | 'converse' | 'talla-40' | 'talla-42' | 'nuevos';

export const Pos: React.FC<PosProps> = ({
  user,
  onNavigateToDashboard,
  products = INITIAL_PRODUCTS,
  onAddSale,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
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
      case 'adidas':
        return product.brand === 'Adidas';
      case 'nike':
        return product.brand === 'Nike';
      case 'puma':
        return product.brand === 'Puma';
      case 'reebok':
        return product.brand === 'Reebok';
      case 'new-balance':
        return product.brand === 'New Balance';
      case 'vans':
        return product.brand === 'Vans';
      case 'converse':
        return product.brand === 'Converse';
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
      // ignore confetti errors in SSR or restricted environments
    }

    if (onAddSale) {
      const newRecord: AuditRecord = {
        id: `TR-${Math.floor(Math.random() * 800) + 9100}`,
        time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        client: clientName || 'Consumidor Final',
        channel: 'Tienda Física',
        payment: paymentMethod === 'Tarjeta' ? 'POS Débito' : paymentMethod === 'Yape' ? 'Yape QR' : paymentMethod,
        total: total,
        sunatNumber: documentType === 'Factura' ? `F001-${String(Math.floor(Math.random() * 900) + 10).padStart(8, '0')}` : `B001-${String(Math.floor(Math.random() * 900) + 10).padStart(8, '0')}`,
        type: documentType,
        status: 'Procesado',
      };
      onAddSale(newRecord);
    }

    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceClose = () => {
    setIsInvoiceModalOpen(false);
    const currentNum = parseInt(orderNumber.replace('#ORD-', ''), 10) || 8492;
    setOrderNumber(`#ORD-${currentNum + 1}`);
    setCart([]);
    showNotification('Venta completada');
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Toast Notification */}
      <Toast message={notification} onClose={() => setNotification(null)} />

      {/* Main POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center: Catalog (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header & Oversized Search */}
          <div className="space-y-5 stagger-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white">
                Catálogo
              </h2>

              <div className="relative flex items-center w-full sm:w-80 md:w-96">
                <Search className="w-5 h-5 text-[#86868B] absolute left-5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar calzado..."
                  className="w-full pl-14 pr-16 py-3.5 rounded-full bg-[#101116] border border-white/[0.08] text-base font-medium text-white placeholder-[#636366] focus:outline-none focus:border-apple-blue transition-all duration-300 ease-spring"
                />
                <span className="absolute right-4 px-2.5 py-1 rounded-full bg-white/[0.06] text-xs font-mono text-[#86868B]">
                  ⌘K
                </span>
              </div>
            </div>

            {/* Minimalist Filter Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'adidas', label: 'Adidas' },
                { id: 'nike', label: 'Nike' },
                { id: 'puma', label: 'Puma' },
                { id: 'new-balance', label: 'New Balance' },
                { id: 'vans', label: 'Vans' },
                { id: 'converse', label: 'Converse' },
                { id: 'reebok', label: 'Reebok' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id as FilterCategory)}
                  className={`px-6 py-3 rounded-full text-base font-bold whitespace-nowrap transition-all duration-300 ease-spring cursor-pointer active:scale-95 ${
                    selectedFilter === pill.id
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-[#101116] text-[#86868B] hover:text-white hover:bg-[#161820] border border-white/[0.06]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid (Spacious 2-col on lg, 3-col on 2xl) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6 stagger-2">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-[#86868B]">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Sin resultados</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const currentSelectedSize = selectedSizes[product.id] || product.sizes[0];

                return (
                  <GlassCard
                    key={product.id}
                    hoverEffect
                    className="p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Clean Image Frame */}
                      <div className="relative aspect-[16/11] rounded-[22px] overflow-hidden bg-[#0a0b0e] border border-white/[0.06] mb-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-spring"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-bold text-[#30D158]">
                            {product.stock} disp.
                          </span>
                        </div>
                      </div>

                      {/* Brand & Large Product Name */}
                      <span className="text-xs font-bold uppercase tracking-wider text-[#86868B] block">
                        {product.brand}
                      </span>
                      <h4 className="text-xl font-extrabold font-display text-white line-clamp-1 mt-0.5">
                        {product.name}
                      </h4>

                      {/* Tactile Size Selector Pills */}
                      <div className="flex items-center gap-2 my-4">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleSelectSize(product.id, size)}
                            className={`w-11 h-11 rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-300 ease-spring cursor-pointer active:scale-90 ${
                              currentSelectedSize === size
                                ? 'bg-apple-blue text-white shadow-apple-glow'
                                : 'bg-white/[0.04] text-[#86868B] hover:text-white hover:bg-white/[0.09] border border-white/[0.06]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Large Price & Add Button */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-2xl font-extrabold font-display text-white tracking-tight">
                        S/ {product.price.toFixed(0)}
                      </span>

                      <GlassButton
                        variant="primary"
                        size="md"
                        icon={<Plus className="w-4.5 h-4.5" />}
                        onClick={() => handleAddToCart(product)}
                        className="rounded-2xl px-5 py-2.5 text-base font-bold"
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

        {/* Right Checkout Panel (4 cols) */}
        <div className="lg:col-span-4 stagger-3">
          <GlassCard className="p-6 md:p-7 sticky top-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold font-display text-white tracking-tight">
                Orden
              </h3>
              <span className="font-mono text-base font-bold text-[#86868B]">
                {orderNumber}
              </span>
            </div>

            {/* Boleta / Factura Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[#15161e] border border-white/[0.06]">
              <button
                onClick={() => {
                  setDocumentType('Boleta');
                  setClientName('Consumidor Final');
                  setClientDoc('00000000');
                }}
                className={`py-2.5 rounded-xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer flex items-center justify-center gap-2 ${
                  documentType === 'Boleta'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                Boleta
              </button>
              <button
                onClick={() => {
                  setDocumentType('Factura');
                  setClientName('Inversiones Deportivas S.A.C.');
                  setClientDoc('20608941231');
                }}
                className={`py-2.5 rounded-xl text-base font-bold transition-all duration-300 ease-spring cursor-pointer flex items-center justify-center gap-2 ${
                  documentType === 'Factura'
                    ? 'bg-white text-black shadow-md'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                Factura
              </button>
            </div>

            {/* Customer Row */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-base font-bold text-white truncate block">
                  {clientName}
                </span>
                <span className="text-xs text-[#86868B] font-mono">
                  {documentType === 'Factura' ? 'RUC ' : 'DNI '}{clientDoc}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsEditCustomerOpen(true)}
                className="text-sm font-bold text-apple-blue hover:text-apple-blueLight px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-all duration-300 ease-spring cursor-pointer shrink-0"
              >
                Cambiar
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
              {cart.length === 0 ? (
                <div className="py-10 text-center text-[#86868B] text-base font-medium">
                  Orden vacía
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-base font-bold text-white truncate block">
                        {item.product.name}
                      </span>
                      <span className="text-xs font-semibold text-[#86868B]">
                        Talla {item.selectedSize}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="flex items-center rounded-xl bg-[#0b0c10] border border-white/10 p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.selectedSize, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868B] hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-sm font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.selectedSize, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868B] hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-base font-display font-extrabold text-white min-w-[68px] text-right">
                        S/ {(item.product.price * item.quantity).toFixed(0)}
                      </span>

                      <button
                        onClick={() => handleRemoveItem(item.product.id, item.selectedSize)}
                        className="p-1.5 text-[#86868B] hover:text-[#FF453A] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'Yape', label: 'Yape', icon: <QrCode className="w-4.5 h-4.5 text-[#BF5AF2]" /> },
                { id: 'Plin', label: 'Plin', icon: <QrCode className="w-4.5 h-4.5 text-[#5AC8FA]" /> },
                { id: 'Efectivo', label: 'Efectivo', icon: <Banknote className="w-4.5 h-4.5 text-[#30D158]" /> },
                { id: 'Tarjeta', label: 'Tarjeta', icon: <CreditCard className="w-4.5 h-4.5 text-apple-blue" /> },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3.5 rounded-2xl border text-base font-bold flex items-center justify-between transition-all duration-300 ease-spring cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-white/[0.1] border-apple-blue text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#86868B] hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {m.icon}
                      {m.label}
                    </span>
                    {isSelected && <Check className="w-4.5 h-4.5 text-apple-blue" />}
                  </button>
                );
              })}
            </div>

            {/* Minimalist Total Block */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <div className="flex justify-between text-sm font-medium text-[#86868B]">
                <span>IGV (18%)</span>
                <span className="font-mono text-white">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-base font-bold text-[#86868B]">
                  Total
                </span>
                <span className="text-4xl xl:text-5xl font-extrabold font-display tracking-tight text-white">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Cobrar CTA Button */}
            <GlassButton
              variant="primary"
              size="lg"
              disabled={cart.length === 0}
              onClick={handleProcessSale}
              className="w-full py-4.5 text-lg font-extrabold rounded-2xl"
            >
              Cobrar
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
          showNotification('Cliente actualizado');
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
