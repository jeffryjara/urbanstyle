import React, { useState, useEffect, useRef } from 'react';
import { Login } from './Login';
import { Sidebar } from './layout/Sidebar';
import { Dashboard } from './Dashboard';
import { Pos } from './Pos';
import { SplashScreen } from './ui/SplashScreen';
import type { UserSession, Product, AuditRecord } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_AUDIT_RECORDS } from '../data/initialData';
import { initSqlEngine, subscribeToDatabase, syncSqlEngineState } from '../utils/sqlEngine';
import { LogOut } from 'lucide-react';

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

export const App: React.FC = () => {
  // Session state: read synchronously from localStorage to eliminate any flash of login on reload
  const [currentUser, setCurrentUser] = useState<UserSession | null>(getInitialSession);
  const [currentView, setCurrentView] = useState<'dashboard' | 'pos'>(() => {
    const session = getInitialSession();
    return session?.role === 'ventas' ? 'pos' : 'dashboard';
  });
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !!getInitialSession();
  });

  // Reactive database state connected to SQL Engine
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(INITIAL_AUDIT_RECORDS);

  // Apple Rubber-Band Overscroll State
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const [overscrollY, setOverscrollY] = useState<number>(0);
  const [isSnappingBack, setIsSnappingBack] = useState<boolean>(false);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Initialize in-memory SQL database
    initSqlEngine(INITIAL_PRODUCTS, INITIAL_AUDIT_RECORDS);

    // 2. Subscribe to live SQL mutations (INSERT, UPDATE, DELETE from Script console)
    const unsubscribe = subscribeToDatabase((state) => {
      setProducts([...state.products]);
      setAuditRecords([...state.auditRecords]);
    });

    return () => {
      unsubscribe();
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, []);

  // Reset scroll position when switching views so top-to-bottom bounce is crisp
  const handleViewChange = (nextView: 'dashboard' | 'pos') => {
    if (nextView === currentView) return;
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

  const handleAddSale = (newRecord: AuditRecord) => {
    const updated = [newRecord, ...auditRecords];
    setAuditRecords(updated);
    syncSqlEngineState(products, updated);
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
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.07] bg-[#080808] relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/logo-icon.png"
            alt="Urban Style"
            className="w-9 h-9 rounded-xl object-contain"
          />
          <span className="font-extrabold font-display text-white text-lg">Urban Style</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleViewChange(currentView === 'dashboard' ? 'pos' : 'dashboard')}
            className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-sm font-bold transition-all duration-300 ease-spring active:scale-95"
          >
            {currentView === 'dashboard' ? 'Catálogo' : 'Dashboard'}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

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
          className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 xl:p-12"
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
              ) : (
                <Pos
                  user={currentUser}
                  onNavigateToDashboard={() => handleViewChange('dashboard')}
                  products={products}
                  onAddSale={handleAddSale}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
