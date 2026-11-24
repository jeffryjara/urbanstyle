import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // 1. Initialize in-memory SQL database
    initSqlEngine(INITIAL_PRODUCTS, INITIAL_AUDIT_RECORDS);

    // 2. Subscribe to live SQL mutations (INSERT, UPDATE, DELETE from Script console)
    const unsubscribe = subscribeToDatabase((state) => {
      setProducts([...state.products]);
      setAuditRecords([...state.auditRecords]);
    });

    return () => unsubscribe();
  }, []);

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
    // Trigger entry splash animation with Urban Style logo for brief seconds
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
    // Replace browser history state so back button cannot return to protected dashboard
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // If user is not authenticated, show Login immediately without splash animation
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // If splash animation is active, display the Apple-style entry splash screen
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
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'pos' : 'dashboard')}
            className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold transition-all duration-300 ease-spring"
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
          onViewChange={setCurrentView}
          products={products}
        />

        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 xl:p-12">
          <div className="max-w-[1600px] mx-auto">
            {currentView === 'dashboard' ? (
              <Dashboard
                user={currentUser}
                onNavigateToPos={() => setCurrentView('pos')}
                auditRecords={auditRecords}
                products={products}
              />
            ) : (
              <Pos
                user={currentUser}
                onNavigateToDashboard={() => setCurrentView('dashboard')}
                products={products}
                onAddSale={handleAddSale}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
