import React, { useState } from 'react';
import { Login } from './Login';
import { Sidebar } from './layout/Sidebar';
import { Dashboard } from './Dashboard';
import { Pos } from './Pos';
import type { UserSession } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { LogOut } from 'lucide-react';

export const App: React.FC = () => {
  // Session state: null = login screen, or active UserSession
  const [currentUser, setCurrentUser] = useState<UserSession | null>(INITIAL_USERS.gerencia);
  const [currentView, setCurrentView] = useState<'dashboard' | 'pos'>('dashboard');

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    if (session.role === 'ventas') {
      setCurrentView('pos');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative h-screen w-screen bg-[#070709] text-[#F5F5F7] flex flex-col lg:flex-row overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="fixed -top-16 left-1/4 w-[600px] h-56 bg-apple-blue/[0.08] rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-24 left-2 w-[340px] h-[500px] bg-apple-blue/[0.07] rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="fixed bottom-8 left-4 w-[300px] h-[350px] bg-[#30D158]/[0.06] rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="fixed top-1/3 right-8 w-[500px] h-[500px] bg-apple-purple/[0.05] rounded-full blur-[180px] pointer-events-none -z-0" />

      {/* Mobile Top Header (only rendered on screens smaller than lg) */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-white/10 bg-[#0c0d14]/95 backdrop-blur-xl relative z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="Urban Style"
            className="w-8 h-8 rounded-xl object-contain border border-white/15"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-sm">Urban Style</span>
            <span className="text-[10px] text-[#86868B]">Calzado Deportivo</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'pos' : 'dashboard')}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
          >
            {currentView === 'dashboard' ? 'Terminal POS' : 'Dashboard'}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-[#FF453A] hover:bg-red-500/10 transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full-Height Desktop Layout: Sidebar Pegado a la Izquierda + Contenido con Scroll Propio */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative z-10">
        {/* Sidebar Pegado Lateral (Normal de siempre, h-full, border-r sin flotar) */}
        <Sidebar
          user={currentUser}
          onLogout={handleLogout}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Contenido Dinámico con Scroll Propio y Padding Cómodo */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 lg:p-6">
          {currentView === 'dashboard' ? (
            <Dashboard
              user={currentUser}
              onNavigateToPos={() => setCurrentView('pos')}
            />
          ) : (
            <Pos
              user={currentUser}
              onNavigateToDashboard={() => setCurrentView('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
};
