import React, { useState, useEffect, useRef } from 'react';
import { Login } from './Login';
import { Sidebar } from './layout/Sidebar';
import { Dashboard } from './Dashboard';
import { Pos } from './Pos';
import { SalesHistory } from './SalesHistory';
import { SplashScreen } from './ui/SplashScreen';
import { StockModal } from './ui/StockModal';
import { ScriptModal } from './ui/ScriptModal';
import { Toast, useToastNotification } from './ui/Toast';
import type { UserSession, Product, AuditRecord, ActiveView } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_AUDIT_RECORDS } from '../data/initialData';
import { initSqlEngine, subscribeToDatabase, syncSqlEngineState } from '../utils/sqlEngine';
import { LogOut, Package, Terminal, TrendingUp, Store, Menu, X, Lock, Receipt } from 'lucide-react';

// Helper to read persisted session synchronously from localStorage on initial render
const getInitialSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('urbanstyle_session');
    if (stored) {
      const parsed = JSON.parse(stored) as UserSession;
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch {
    // Fallback: stay on login
  }
  return null;
};

// Helper to read persisted products synchronously from localStorage
const getInitialProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const stored = localStorage.getItem('urbanstyle_products');
    if (stored) {
      const parsed = JSON.parse(stored) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return INITIAL_PRODUCTS;
};

// Helper to read persisted sales synchronously from localStorage
const getInitialAuditRecords = (): AuditRecord[] => {
  if (typeof window === 'undefined') return INITIAL_AUDIT_RECORDS;
  try {
    const stored = localStorage.getItem('urbanstyle_sales');
    if (stored) {
      const parsed = JSON.parse(stored) as AuditRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return INITIAL_AUDIT_RECORDS;
};

export const App: React.FC = () => {
  // Session state: read synchronously from localStorage to eliminate any flash of login on reload
  const [currentUser, setCurrentUser] = useState<UserSession | null>(getInitialSession);
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    const session = getInitialSession();
    return session?.role === 'ventas' ? 'pos' : 'dashboard';
  });
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !!getInitialSession();
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileStockOpen, setIsMobileStockOpen] = useState(false);
  const [isMobileScriptOpen, setIsMobileScriptOpen] = useState(false);
  const { toast, showNotification, clearToast } = useToastNotification();

  // Reactive database state connected to SQL Engine and persisted
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(getInitialAuditRecords);

  // Apple Rubber-Band Overscroll State
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const [overscrollY, setOverscrollY] = useState<number>(0);
  const [isSnappingBack, setIsSnappingBack] = useState<boolean>(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Initialize in-memory SQL database with current (or persisted) state
    initSqlEngine(products, auditRecords);

    // 2. Subscribe to live SQL mutations (INSERT, UPDATE, DELETE from Script console)
    const unsubscribe = subscribeToDatabase((state) => {
      setProducts([...state.products]);
      setAuditRecords([...state.auditRecords]);
      try {
        localStorage.setItem('urbanstyle_products', JSON.stringify(state.products));
        localStorage.setItem('urbanstyle_sales', JSON.stringify(state.auditRecords));
      } catch {
        // ignore
      }
    });

    return () => {
      unsubscribe();
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, []);

  // Sync products and sales to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('urbanstyle_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('urbanstyle_sales', JSON.stringify(auditRecords));
    } catch {
      // ignore
    }
  }, [auditRecords]);

  // Reset scroll position when switching views so top-to-bottom bounce is crisp
  const handleViewChange = (nextView: ActiveView) => {
    if (nextView === currentView) return;
    if (nextView === 'dashboard' && currentUser?.role === 'ventas') {
      showNotification('Acceso restringido: Módulo exclusivo para Gerencia', 'error');
      return;
    }
    setCurrentView(nextView);
    setOverscrollY(0);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  // Apple macOS/iOS Rubber-Band Overscroll Handler (Wheel)
  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    const el = mainScrollRef.current;
    if (!el) return;

    const atTop = el.scrollTop <= 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      setIsSnappingBack(false);
      setOverscrollY((prev) => {
        // Logarithmic resistance as displacement grows
        const resistance = Math.max(0.08, 0.34 - Math.abs(prev) / 170);
        const next = prev - e.deltaY * resistance;
        return Math.max(-52, Math.min(52, next));
      });

      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      snapTimerRef.current = setTimeout(() => {
        setIsSnappingBack(true);
        setOverscrollY(0);
      }, 95);
    } else if (overscrollY !== 0) {
      setIsSnappingBack(true);
      setOverscrollY(0);
    }
  };

  // Touch Overscroll Support for Trackpads / Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const el = mainScrollRef.current;
    if (!el || touchStartYRef.current === null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    const atTop = el.scrollTop <= 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

    if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
      setIsSnappingBack(false);
      const damped = Math.max(-56, Math.min(56, deltaY * 0.32));
      setOverscrollY(damped);
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    if (overscrollY !== 0) {
      setIsSnappingBack(true);
      setOverscrollY(0);
    }
  };

  const handleAddSale = (newRecord: AuditRecord, updatedProducts?: Product[]) => {
    const updatedRecords = [newRecord, ...auditRecords];
    const finalProducts = updatedProducts || products;
    setAuditRecords(updatedRecords);
    if (updatedProducts) {
      setProducts(updatedProducts);
    }
    syncSqlEngineState(finalProducts, updatedRecords);
    try {
      localStorage.setItem('urbanstyle_sales', JSON.stringify(updatedRecords));
      if (updatedProducts) {
        localStorage.setItem('urbanstyle_products', JSON.stringify(updatedProducts));
      }
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (session: UserSession) => {
    try {
      localStorage.setItem('urbanstyle_session', JSON.stringify(session));
    } catch {
      // ignore
    }
    setCurrentUser(session);
    if (session.role === 'ventas') {
      setCurrentView('pos');
    } else {
      setCurrentView('dashboard');
    }
    setShowSplash(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('urbanstyle_session');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setShowSplash(false);
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative h-[100dvh] w-screen bg-black text-[#F5F5F7] flex flex-col lg:flex-row overflow-hidden">
      <Toast message={toast} onClose={clearToast} />

      {/* Mobile Top Header with Liquid Glass & Apple Elegance */}
      <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#09090b] relative z-30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo-icon.png"
            alt="Urban Style"
            className="w-9 h-9 rounded-xl object-contain shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold font-display text-white text-base leading-tight truncate">
              Urban Style
            </span>
            <span className="text-[11px] font-semibold text-[#8E8E93] leading-tight flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === 'gerencia' ? 'bg-[#007AFF]' : 'bg-[#30D158]'}`} />
              <span className="capitalize">{currentUser.name.split(' ')[0]} ({currentUser.role === 'gerencia' ? 'Gerente' : 'Ventas'})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChange(currentView === 'sales' ? 'pos' : 'sales')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 ease-spring active:scale-95 cursor-pointer ${
              currentView === 'sales'
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-[#18181b] border-white/10 text-white'
            }`}
          >
            {currentView === 'sales' ? 'Catálogo' : 'Mis Ventas'}
          </button>

          {currentUser.role === 'gerencia' && (
            <button
              onClick={() => handleViewChange(currentView === 'dashboard' ? 'pos' : 'dashboard')}
              className="px-3 py-1.5 rounded-xl bg-[#18181b] border border-white/10 text-white text-xs font-bold transition-all duration-300 ease-spring active:scale-95 cursor-pointer"
            >
              {currentView === 'dashboard' ? 'Catálogo' : 'Dashboard'}
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 rounded-xl text-[#A1A1A6] hover:text-white bg-white/[0.06] hover:bg-white/10 transition-colors cursor-pointer"
            title="Menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
          />

          {/* Drawer Body */}
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-[#0d0d10] border-l border-white/15 p-6 flex flex-col justify-between z-10 animate-slide-in shadow-2xl">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/15"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-tight">{currentUser.name}</h4>
                    <span className="text-xs font-medium text-[#8E8E93] capitalize">
                      {currentUser.role === 'gerencia' ? 'Gerencia General' : 'Asesor de Ventas'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleViewChange('pos');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer ${
                    currentView === 'pos'
                      ? 'bg-[#007AFF] text-white shadow-lg'
                      : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span>Catálogo (POS)</span>
                </button>

                <button
                  onClick={() => {
                    handleViewChange('sales');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer ${
                    currentView === 'sales'
                      ? 'bg-[#007AFF] text-white shadow-lg'
                      : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span>Mis Ventas</span>
                </button>

                <button
                  onClick={() => {
                    if (currentUser.role === 'ventas') {
                      showNotification('Acceso restringido: Módulo exclusivo para Gerencia', 'error');
                      return;
                    }
                    handleViewChange('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'bg-[#007AFF] text-white shadow-lg'
                      : currentUser.role === 'ventas'
                      ? 'text-[#52525B] opacity-60'
                      : 'text-[#8E8E93] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <TrendingUp className="w-5 h-5" />
                    <span>Dashboard</span>
                  </div>
                  {currentUser.role === 'ventas' && (
                    <Lock className="w-4 h-4 text-[#52525B]" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMobileStockOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#8E8E93] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Package className="w-5 h-5" />
                  <span>Inventario</span>
                </button>

                {currentUser.role === 'gerencia' && (
                  <button
                    onClick={() => {
                      setIsMobileScriptOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#8E8E93] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Terminal className="w-5 h-5" />
                    <span>Script SQL</span>
                  </button>
                )}
              </div>
            </div>

            {/* Logout Footer */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-red-500/10 text-[#FF453A] font-bold text-base hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Modals */}
      <StockModal
        isOpen={isMobileStockOpen}
        onClose={() => setIsMobileStockOpen(false)}
        products={products}
      />
      <ScriptModal
        isOpen={isMobileScriptOpen}
        onClose={() => setIsMobileScriptOpen(false)}
      />

      {/* Desktop Layout */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative z-10">
        <Sidebar
          user={currentUser}
          onLogout={handleLogout}
          currentView={currentView}
          onViewChange={handleViewChange}
          products={products}
        />

        <main
          ref={mainScrollRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 xl:p-12"
        >
          {/* Apple Rubber-Band Overscroll Container + Top-to-Bottom Section Bounce */}
          <div
            style={{
              transform: `translate3d(0, ${overscrollY}px, 0)`,
              transition: isSnappingBack
                ? 'transform 0.55s cubic-bezier(0.22, 1.38, 0.36, 1)'
                : 'transform 0.06s linear',
            }}
            className="max-w-[1600px] mx-auto will-change-transform"
          >
            <div key={currentView} className="animate-section-drop">
              {currentView === 'dashboard' ? (
                <Dashboard
                  user={currentUser}
                  onNavigateToPos={() => handleViewChange('pos')}
                  auditRecords={auditRecords}
                  products={products}
                />
              ) : currentView === 'pos' ? (
                <Pos
                  user={currentUser}
                  onNavigateToDashboard={() => handleViewChange('dashboard')}
                  products={products}
                  onAddSale={handleAddSale}
                />
              ) : (
                <SalesHistory
                  user={currentUser}
                  auditRecords={auditRecords}
                  onNavigateToPos={() => handleViewChange('pos')}
                  products={products}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
