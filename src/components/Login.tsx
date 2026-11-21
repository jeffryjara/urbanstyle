import React, { useState } from 'react';
import { AtSign, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { GlassButton } from './ui/GlassButton';
import { SegmentedControl, type SegmentOption } from './ui/SegmentedControl';
import type { UserRole, UserSession } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('gerencia');
  const [email, setEmail] = useState('gerencia@urbanstyle.pe');
  const [password, setPassword] = useState('Admin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roleOptions: SegmentOption<UserRole>[] = [
    { id: 'gerencia', label: 'Gerencia General' },
    { id: 'ventas', label: 'Ventas & Almacén POS' },
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'gerencia') {
      setEmail('gerencia@urbanstyle.pe');
      setPassword('Admin2026!');
    } else {
      setEmail('ventas.lima@urbanstyle.pe');
      setPassword('Ventas2026!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor ingrese correo institucional y contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = INITIAL_USERS[selectedRole];
      onLoginSuccess(user);
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-black overflow-hidden">
      {/* Background radial gradient and subtle ambient light */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-apple-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-apple-blueLight/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Main Container - Split View on Desktop */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl md:rounded-[32px] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] z-10 animate-fade-in">
        
        {/* Left Side: Brand & Identity Showcase */}
        <div className="relative p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div>
            {/* Logo Badge */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 p-3 flex items-center justify-center shadow-lg mb-6">
              <svg viewBox="0 0 40 40" className="w-full h-full text-white" fill="none">
                <path
                  d="M10 26C13 26 15 22 20 22C25 22 26 25 31 25C34 25 36 23 37 20L34 14C32 11 29 11 26 14L20 20C17 23 13 23 10 21V26Z"
                  fill="url(#logo_grad)"
                />
                <circle cx="15" cy="14" r="2.5" fill="#007AFF" />
                <defs>
                  <linearGradient id="logo_grad" x1="10" y1="11" x2="37" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#007AFF" />
                    <stop offset="1" stopColor="#58A6FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-[#F5F5F7]">
              Urban Style
            </h1>
            <p className="mt-2 text-sm text-[#86868B] font-medium leading-relaxed">
              Portal Corporativo de Gestión & Omnicanal POS
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#A1A1A6]">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-apple-blue shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span>Comercialización Omnicanal de Calzado Deportivo</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#A1A1A6]">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#30D158] shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Data Warehouse & Auditoría OLAP de Producción</span>
              </div>
            </div>
          </div>

          {/* Legal / Tax Identifier Footnote */}
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[#636366] font-mono">
            <span>RUC 10449598569</span>
            <span>v2.6 Apple HIG</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-black/40">
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#86868B] uppercase tracking-wider mb-2">
              Perfil Operativo
            </label>
            <SegmentedControl
              options={roleOptions}
              value={selectedRole}
              onChange={handleRoleChange}
              className="w-full justify-between"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input: Correo Institucional */}
            <div>
              <label className="block text-xs font-medium text-[#86868B] mb-1.5">
                Correo Institucional (@urbanstyle.pe)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#86868B] pointer-events-none">
                  <AtSign className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@urbanstyle.pe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-[#F5F5F7] placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
                  required
                />
              </div>
            </div>

            {/* Input: Contraseña */}
            <div>
              <label className="block text-xs font-medium text-[#86868B] mb-1.5">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#86868B] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-[#F5F5F7] placeholder-[#636366] focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#86868B] hover:text-[#F5F5F7] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-[#FF453A] animate-fade-in">
                {errorMessage}
              </div>
            )}

            {/* Switch: Recordar Terminal */}
            <div className="flex items-center justify-between py-1">
              <label className="text-xs text-[#86868B] cursor-pointer select-none">
                Recordar terminal
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={rememberTerminal}
                onClick={() => setRememberTerminal(!rememberTerminal)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rememberTerminal ? 'bg-apple-blue' : 'bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    rememberTerminal ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Primary Action Button */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="w-full mt-2"
            >
              Iniciar Sesión
            </GlassButton>
          </form>

          {/* Quick-credential hint helper pill */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#86868B] bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
              <Sparkles className="w-3 h-3 text-apple-blue" />
              Perfil activo: <strong className="text-white">{selectedRole === 'gerencia' ? 'Gerencia' : 'Ventas POS'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
