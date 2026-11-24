import React, { useState, useEffect } from 'react';
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { GlassButton } from './ui/GlassButton';
import type { UserSession } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urbanstyle_remembered_email');
      if (saved) return saved;
    }
    return 'gerencia@urbanstyle.pe';
  });

  const [password, setPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urbanstyle_remembered_password');
      if (saved) return saved;
    }
    return 'Gerencia2026';
  });

  const [showPassword, setShowPassword] = useState(false);

  // Chevron dropdown state for email & password selection
  const [showEmailMenu, setShowEmailMenu] = useState(false);
  const [showPasswordMenu, setShowPasswordMenu] = useState(false);

  const [rememberTerminal, setRememberTerminal] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('urbanstyle_remember_credentials');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Custom elaborate validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.account-dropdown-container')) {
        setShowEmailMenu(false);
        setShowPasswordMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const accounts = [
    {
      id: 'gerencia',
      title: 'Gerente General',
      name: 'Carlos Mendoza',
      email: 'gerencia@urbanstyle.pe',
      password: 'Gerencia2026',
      badge: 'Gerencial / BI',
      badgeColor: 'blue',
      letter: 'G',
    },
    {
      id: 'ventas',
      title: 'Cajera & Ventas POS',
      name: 'Valeria Rojas',
      email: 'ventas@urbanstyle.pe',
      password: 'Ventas2026',
      badge: 'Caja / POS',
      badgeColor: 'emerald',
      letter: 'V',
    },
  ];

  const handleSelectAccount = (type: 'gerencia' | 'ventas') => {
    if (type === 'gerencia') {
      setEmail('gerencia@urbanstyle.pe');
      setPassword('Gerencia2026');
    } else {
      setEmail('ventas@urbanstyle.pe');
      setPassword('Ventas2026');
    }
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setShowEmailMenu(false);
    setShowPasswordMenu(false);
  };

  const validateEmailFormat = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let hasError = false;

    // Validate email
    if (!cleanEmail) {
      setEmailError('Por favor ingrese su correo electrónico institucional');
      hasError = true;
    } else if (!validateEmailFormat(cleanEmail)) {
      setEmailError('Formato de correo no válido (ejemplo: usuario@urbanstyle.pe)');
      hasError = true;
    }

    // Validate password
    if (!cleanPassword) {
      setPasswordError('Por favor ingrese su contraseña de acceso');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    setTimeout(() => {
      // Lookup user in database
      const userFound = Object.values(INITIAL_USERS).find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (!userFound) {
        setIsLoading(false);
        setGeneralError('El correo electrónico no está registrado en el sistema.');
        setEmailError('Correo no encontrado');
        return;
      }

      if (userFound.password !== cleanPassword) {
        setIsLoading(false);
        setPasswordError('Contraseña incorrecta');
        setGeneralError('La contraseña ingresada no coincide con nuestros registros de seguridad.');
        return;
      }

      if (rememberTerminal) {
        localStorage.setItem('urbanstyle_remembered_email', cleanEmail);
        localStorage.setItem('urbanstyle_remembered_password', cleanPassword);
        localStorage.setItem('urbanstyle_remember_credentials', 'true');
      } else {
        localStorage.removeItem('urbanstyle_remembered_email');
        localStorage.removeItem('urbanstyle_remembered_password');
        localStorage.setItem('urbanstyle_remember_credentials', 'false');
      }

      setIsLoading(false);
      onLoginSuccess(userFound);
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-black overflow-hidden">
      {/* Background radial gradient and subtle ambient light */}
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-apple-blue/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-apple-blueLight/10 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Subtle background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Main Container - Larger height and spacious Apple Liquid Glass Card */}
      <div className="relative w-full max-w-4xl min-h-[580px] md:min-h-[620px] grid grid-cols-1 md:grid-cols-2 rounded-3xl md:rounded-[36px] overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] z-10 animate-fade-in">
        
        {/* Left Side: Brand & Identity Showcase with official logo */}
        <div className="relative p-10 md:p-14 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
          {/* Official Urban Style Logo */}
          <img
            src="/logo-icon.png"
            alt="Urban Style Logo"
            className="w-20 h-20 rounded-3xl object-cover shadow-[0_10px_30px_rgba(0,0,0,0.6)] mb-8"
          />

          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-[#F5F5F7] leading-tight">
            Urban Style
          </h1>
          <p className="mt-3 text-base md:text-lg text-[#86868B] font-medium leading-relaxed">
            Portal Corporativo de Gestión & Omnicanal POS
          </p>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-[#86868B]">
            <ShieldCheck className="w-4 h-4 text-apple-emerald shrink-0" />
            <span>Acceso seguro con roles asignados para Gerencia y Terminal POS</span>
          </div>
        </div>

        {/* Right Side: Authentication Form with custom elaborate validation & quick selector */}
        <div className="p-10 md:p-14 flex flex-col justify-center bg-black/40">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-sm md:text-base text-[#86868B] mt-1.5 leading-normal">
              Ingrese su correo electrónico y contraseña para ingresar al sistema
            </p>
          </div>

          {/* Form with noValidate to disable generic browser popups */}
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            {/* Input: Correo electrónico con selector Chevron */}
            <div className={`relative account-dropdown-container ${showEmailMenu ? 'z-40' : 'z-20'}`}>
              <label className="block text-sm font-semibold text-[#A1A1A6] mb-2 flex items-center justify-between">
                <span>Correo electrónico</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailMenu(!showEmailMenu);
                    setShowPasswordMenu(false);
                  }}
                  className="text-xs font-mono text-apple-blue hover:text-apple-blueLight flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Cuentas rápidas</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showEmailMenu ? 'rotate-180' : ''}`} />
                </button>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#86868B] pointer-events-none">
                  <AtSign className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="gerencia@urbanstyle.pe"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border text-base text-[#F5F5F7] placeholder-[#636366] transition-all focus:outline-none ${
                    emailError
                      ? 'border-red-500/70 bg-red-500/[0.04] ring-1 ring-red-500/30 focus:border-red-500'
                      : 'border-white/10 bg-white/[0.04] focus:border-apple-blue focus:ring-1 focus:ring-apple-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailMenu(!showEmailMenu);
                    setShowPasswordMenu(false);
                  }}
                  className="absolute right-3.5 text-[#86868B] hover:text-[#F5F5F7] transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/5"
                  title="Elegir cuenta institucional (Gerente o Ventas)"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showEmailMenu ? 'rotate-180 text-apple-blue' : ''}`} />
                </button>
              </div>

              {/* Dropdown Menu for Email */}
              {showEmailMenu && (
                <div className="super-blur-dropdown absolute left-0 right-0 top-full mt-2 rounded-2xl p-2 z-50 animate-scale-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#86868B] border-b border-white/5 mb-1">
                    Seleccionar Cuenta:
                  </div>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectAccount(acc.id as any)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        email === acc.email
                          ? 'bg-apple-blue/20 text-white border border-apple-blue/30'
                          : 'hover:bg-white/10 text-[#A1A1A6]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          acc.badgeColor === 'blue' ? 'bg-apple-blue/20 text-apple-blue' : 'bg-apple-emerald/20 text-apple-emerald'
                        }`}>
                          {acc.letter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{acc.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                              acc.badgeColor === 'blue' ? 'bg-apple-blue/15 text-apple-blue' : 'bg-apple-emerald/15 text-apple-emerald'
                            }`}>
                              {acc.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#86868B] font-mono block mt-0.5">
                            {acc.email}
                          </span>
                        </div>
                      </div>
                      {email === acc.email && <Check className="w-4 h-4 text-apple-blue shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom In-App Error Notification for Email */}
              {emailError && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#FF453A] animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Input: Contraseña con selector Chevron */}
            <div className={`relative account-dropdown-container ${showPasswordMenu ? 'z-40' : 'z-10'}`}>
              <label className="block text-sm font-semibold text-[#A1A1A6] mb-2 flex items-center justify-between">
                <span>Contraseña</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordMenu(!showPasswordMenu);
                    setShowEmailMenu(false);
                  }}
                  className="text-xs font-mono text-apple-blue hover:text-apple-blueLight flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Contraseñas rápidas</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showPasswordMenu ? 'rotate-180' : ''}`} />
                </button>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#86868B] pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-12 pr-20 py-3.5 rounded-2xl border text-base text-[#F5F5F7] placeholder-[#636366] transition-all focus:outline-none ${
                    passwordError
                      ? 'border-red-500/70 bg-red-500/[0.04] ring-1 ring-red-500/30 focus:border-red-500'
                      : 'border-white/10 bg-white/[0.04] focus:border-apple-blue focus:ring-1 focus:ring-apple-blue'
                  }`}
                />
                <div className="absolute right-3.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#86868B] hover:text-[#F5F5F7] transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/5"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordMenu(!showPasswordMenu);
                      setShowEmailMenu(false);
                    }}
                    className="text-[#86868B] hover:text-[#F5F5F7] transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/5"
                    title="Elegir contraseña predefinida"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPasswordMenu ? 'rotate-180 text-apple-blue' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu for Password */}
              {showPasswordMenu && (
                <div className="super-blur-dropdown absolute left-0 right-0 top-full mt-2 rounded-2xl p-2 z-50 animate-scale-in">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#86868B] border-b border-white/5 mb-1">
                    Seleccionar Contraseña:
                  </div>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectAccount(acc.id as any)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        password === acc.password
                          ? 'bg-apple-blue/20 text-white border border-apple-blue/30'
                          : 'hover:bg-white/10 text-[#A1A1A6]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white tracking-wider">
                            {showPassword ? acc.password : '••••••••••••'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                            acc.badgeColor === 'blue' ? 'bg-apple-blue/15 text-apple-blue' : 'bg-apple-emerald/15 text-apple-emerald'
                          }`}>
                            {acc.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#86868B] mt-0.5">
                          Para {acc.name} ({acc.email})
                        </span>
                      </div>
                      {password === acc.password && <Check className="w-4 h-4 text-apple-blue shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom In-App Error Notification for Password */}
              {passwordError && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#FF453A] animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* General Authentication Error Card */}
            {generalError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-sm text-[#FF453A] animate-fade-in flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-[#FF453A]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs uppercase tracking-wider text-red-400">
                    Error de Autenticación
                  </span>
                  <span className="text-xs md:text-sm text-[#F5F5F7] mt-0.5 leading-snug">
                    {generalError}
                  </span>
                </div>
              </div>
            )}

            {/* Switch: Recordar credenciales */}
            <div className="flex items-center justify-between py-1.5">
              <label className="text-sm text-[#A1A1A6] cursor-pointer select-none">
                Recordar credenciales
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={rememberTerminal}
                onClick={() => setRememberTerminal(!rememberTerminal)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  rememberTerminal ? 'bg-apple-blue' : 'bg-white/10'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    rememberTerminal ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center text-base font-bold shadow-[0_4px_24px_rgba(0,122,255,0.4)]"
                icon={<ArrowRight className="w-4 h-4" />}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
