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
    <div className="relative min-h-screen bg-[#070709] text-[#F5F5F7] flex flex-col overflow-hidden">
      {/* Multi-layered diffused ambient background gradients */}
      <div className="fixed -top-12 left-1/4 w-[650px] h-64 bg-apple-blue/[0.10] rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-20 left-4 w-[380px] h-[550px] bg-apple-blue/[0.08] rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="fixed bottom-10 left-8 w-[320px] h-[350px] bg-[#30D158]/[0.06] rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="fixed top-1/3 right-12 w-[550px] h-[550px] bg-apple-purple/[0.05] rounded-full blur-[180px] pointer-events-none -z-0" />

      {/* 1. Full-width Top Navigation Bar */}
      <Navbar
        user={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* 2. Main Flex Container: Floating Sticky Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full max-w-[1720px] mx-auto p-4 md:p-5 lg:p-6 gap-6 h-[calc(100vh-4rem)] overflow-hidden relative z-10">
        {/* Floating Glass Sidebar (Sticky & Pinned - Never Scrolls) */}
        <Sidebar
          user={currentUser}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Dynamic Scrollable Content (ONLY this section moves upon scrolling) */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar pr-1 md:pr-2">
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
