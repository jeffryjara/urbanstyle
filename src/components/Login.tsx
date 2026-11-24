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
      title: 'Gerencia',
      name: 'Carlos Mendoza',
      email: 'gerencia@urbanstyle.pe',
      password: 'Gerencia2026',
      badge: 'Gerencia',
      badgeColor: 'blue',
      letter: 'C',
    },
    {
      id: 'ventas',
      title: 'Ventas POS',
      name: 'Valeria Rojas',
      email: 'ventas@urbanstyle.pe',
      password: 'Ventas2026',
      badge: 'POS',
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

    if (!cleanEmail) {
      setEmailError('Ingresa tu correo');
      hasError = true;
    } else if (!validateEmailFormat(cleanEmail)) {
      setEmailError('Formato de correo no válido');
      hasError = true;
    }

    if (!cleanPassword) {
      setPasswordError('Ingresa tu contraseña');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    setTimeout(() => {
      const userFound = Object.values(INITIAL_USERS).find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (!userFound) {
        setIsLoading(false);
        setGeneralError('Cuenta no registrada');
        setEmailError('Correo no encontrado');
        return;
      }

      if (userFound.password !== cleanPassword) {
        setIsLoading(false);
        setPasswordError('Contraseña incorrecta');
        setGeneralError('Credenciales inválidas');
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
    }, 350);
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-6 md:p-12 bg-[#070709] overflow-hidden">
      {/* Single subtle architectural ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-apple-blue/[0.06] rounded-full blur-[160px] pointer-events-none" />

      {/* Main Minimalist Container */}
      <div className="relative w-full max-w-5xl min-h-[600px] grid grid-cols-1 md:grid-cols-12 rounded-[36px] overflow-hidden border border-white/[0.07] bg-[#0d0e13] shadow-[0_40px_100px_rgba(0,0,0,0.85)] z-10 animate-scale-in">
        
        {/* Left Brand Showcase (5 cols) */}
        <div className="md:col-span-5 p-10 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.06] bg-[#101118]">
          <img
            src="/logo-icon.png"
            alt="Urban Style"
            className="w-20 h-20 md:w-24 md:h-24 rounded-[26px] object-contain"
          />

          <div className="my-auto py-8">
            <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.05]">
              Urban
              <br />
              Style.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-[#86868B] font-medium">
              Calzado Deportivo
            </p>
          </div>

          <div className="text-sm text-[#636366] font-mono">
            v2.6 • Lima, Perú
          </div>
        </div>

        {/* Right Authentication Form (7 cols) */}
        <div className="md:col-span-7 p-10 md:p-16 flex flex-col justify-center bg-[#0b0c10]">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight">
              Acceso
            </h2>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            {/* Input: Correo con selector Chevron */}
            <div className={`relative account-dropdown-container ${showEmailMenu ? 'z-40' : 'z-20'}`}>
              <label className="block text-base font-semibold text-[#A1A1A6] mb-2.5">
                Correo
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-[#86868B] pointer-events-none">
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
                  className={`w-full pl-14 pr-14 py-4 rounded-2xl border text-lg font-medium text-[#F5F5F7] placeholder-[#636366] transition-all duration-300 ease-spring focus:outline-none ${
                    emailError
                      ? 'border-red-500/70 bg-red-500/[0.04]'
                      : 'border-white/[0.08] bg-[#13141c] focus:border-apple-blue focus:bg-[#161822]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailMenu(!showEmailMenu);
                    setShowPasswordMenu(false);
                  }}
                  className="absolute right-4 text-[#86868B] hover:text-white transition-all duration-300 ease-spring cursor-pointer p-2 rounded-xl hover:bg-white/5"
                  title="Elegir cuenta"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ease-spring ${showEmailMenu ? 'rotate-180 text-apple-blue' : ''}`} />
                </button>
              </div>

              {/* Super-Blur Dropdown Menu for Email */}
              {showEmailMenu && (
                <div className="super-blur-dropdown absolute left-0 right-0 top-full mt-2.5 rounded-2xl p-2.5 z-50 animate-scale-in space-y-1">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectAccount(acc.id as any)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-200 ease-spring cursor-pointer ${
                        email === acc.email
                          ? 'bg-apple-blue/20 text-white border border-apple-blue/30'
                          : 'hover:bg-white/10 text-[#A1A1A6]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                          acc.badgeColor === 'blue' ? 'bg-apple-blue/20 text-apple-blue' : 'bg-apple-emerald/20 text-apple-emerald'
                        }`}>
                          {acc.letter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-bold text-white">{acc.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                              acc.badgeColor === 'blue' ? 'bg-apple-blue/15 text-apple-blue' : 'bg-apple-emerald/15 text-apple-emerald'
                            }`}>
                              {acc.badge}
                            </span>
                          </div>
                          <span className="text-sm text-[#86868B] font-mono block mt-0.5">
                            {acc.email}
                          </span>
                        </div>
                      </div>
                      {email === acc.email && <Check className="w-5 h-5 text-apple-blue shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}

              {emailError && (
                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#FF453A] animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Input: Contraseña con selector Chevron */}
            <div className={`relative account-dropdown-container ${showPasswordMenu ? 'z-40' : 'z-10'}`}>
              <label className="block text-base font-semibold text-[#A1A1A6] mb-2.5">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-[#86868B] pointer-events-none">
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
                  className={`w-full pl-14 pr-24 py-4 rounded-2xl border text-lg font-medium text-[#F5F5F7] placeholder-[#636366] transition-all duration-300 ease-spring focus:outline-none ${
                    passwordError
                      ? 'border-red-500/70 bg-red-500/[0.04]'
                      : 'border-white/[0.08] bg-[#13141c] focus:border-apple-blue focus:bg-[#161822]'
                  }`}
                />
                <div className="absolute right-4 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#86868B] hover:text-white transition-all duration-200 cursor-pointer p-2 rounded-xl hover:bg-white/5"
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordMenu(!showPasswordMenu);
                      setShowEmailMenu(false);
                    }}
                    className="text-[#86868B] hover:text-white transition-all duration-300 ease-spring cursor-pointer p-2 rounded-xl hover:bg-white/5"
                    title="Elegir contraseña"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ease-spring ${showPasswordMenu ? 'rotate-180 text-apple-blue' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Super-Blur Dropdown Menu for Password */}
              {showPasswordMenu && (
                <div className="super-blur-dropdown absolute left-0 right-0 top-full mt-2.5 rounded-2xl p-2.5 z-50 animate-scale-in space-y-1">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectAccount(acc.id as any)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-200 ease-spring cursor-pointer ${
                        password === acc.password
                          ? 'bg-apple-blue/20 text-white border border-apple-blue/30'
                          : 'hover:bg-white/10 text-[#A1A1A6]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-mono font-bold text-white tracking-wider">
                            {showPassword ? acc.password : '••••••••••••'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                            acc.badgeColor === 'blue' ? 'bg-apple-blue/15 text-apple-blue' : 'bg-apple-emerald/15 text-apple-emerald'
                          }`}>
                            {acc.badge}
                          </span>
                        </div>
                        <span className="text-sm text-[#86868B] mt-0.5">
                          {acc.name}
                        </span>
                      </div>
                      {password === acc.password && <Check className="w-5 h-5 text-apple-blue shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#FF453A] animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {generalError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-base text-[#FF453A] animate-fade-in flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF453A] shrink-0" />
                <span className="font-medium text-[#F5F5F7]">{generalError}</span>
              </div>
            )}

            {/* Switch: Recordar */}
            <div className="flex items-center justify-between py-2">
              <label
                onClick={() => setRememberTerminal(!rememberTerminal)}
                className="text-base font-medium text-[#A1A1A6] cursor-pointer select-none"
              >
                Recordar sesión
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={rememberTerminal}
                onClick={() => setRememberTerminal(!rememberTerminal)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-spring focus:outline-none ${
                  rememberTerminal ? 'bg-apple-blue' : 'bg-white/10'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-spring ${
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
                className="w-full justify-center text-lg font-bold py-4.5 rounded-2xl"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Entrar'}
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
