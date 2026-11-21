import React, { useState } from 'react';
import { Login } from './Login';
import { Navbar } from './layout/Navbar';
import { Sidebar } from './layout/Sidebar';
import { Dashboard } from './Dashboard';
import { Pos } from './Pos';
import type { UserSession } from '../types';
import { INITIAL_USERS } from '../data/initialData';

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
    <div className="relative h-screen w-screen bg-[#070709] text-[#F5F5F7] flex flex-col overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="fixed -top-16 left-1/4 w-[600px] h-56 bg-apple-blue/[0.08] rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-24 left-2 w-[340px] h-[500px] bg-apple-blue/[0.07] rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="fixed bottom-8 left-4 w-[300px] h-[350px] bg-[#30D158]/[0.06] rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="fixed top-1/3 right-8 w-[500px] h-[500px] bg-apple-purple/[0.05] rounded-full blur-[180px] pointer-events-none -z-0" />

      {/* 1. Header Fijo Permanente (Sin margen excesivo, de ancho completo) */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Cuerpo Principal: Sidebar Fijo a la Izquierda + Contenido con Scroll Único */}
      <div className="flex-1 flex w-full h-[calc(100vh-4rem)] overflow-hidden p-4 lg:p-5 gap-5 relative z-10">
        {/* Sidebar Fijo Flotante (Siempre visible, pegado a la izquierda sin espacio muerto) */}
        <Sidebar
          user={currentUser}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Contenido Dinámico (ÚNICO elemento que se desplaza al hacer scroll) */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar pr-1 lg:pr-2">
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
