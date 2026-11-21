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
  // Default to Gerencia for immediate interactive testing
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
    <div className="min-h-screen bg-black text-[#F5F5F7] flex flex-col overflow-hidden">
      {/* 1. Full-width Top Navigation Bar (Header Normal, No Floating Pill) */}
      <Navbar
        user={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* 2. Main Body with Fixed-Width Full-Height Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Fixed Persistent Sidebar (Always w-64, Never Resizes) */}
        <Sidebar
          user={currentUser}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-black">
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
