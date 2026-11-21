import React, { useState } from 'react';
import { AtSign, Lock, Eye, EyeOff, ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';
import { GlassButton } from './ui/GlassButton';
import type { UserSession } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Custom elaborate validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

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
          {/* Official Urban Style Logo Badge */}
          <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/15 p-2 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] mb-8 overflow-hidden backdrop-blur-xl">
            <img
              src="/logo-icon.png"
              alt="Urban Style Logo"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-[#F5F5F7] leading-tight">
            Urban Style
          </h1>
          <p className="mt-3 text-base md:text-lg text-[#86868B] font-medium leading-relaxed">
            Portal Corporativo de Gestión & Omnicanal POS
          </p>
        </div>

        {/* Right Side: Authentication Form with custom elaborate validation */}
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
            {/* Input: Correo electrónico */}
            <div>
              <label className="block text-sm font-semibold text-[#A1A1A6] mb-2">
                Correo electrónico
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
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border text-base text-[#F5F5F7] placeholder-[#636366] transition-all focus:outline-none ${
                    emailError
                      ? 'border-red-500/70 bg-red-500/[0.04] ring-1 ring-red-500/30 focus:border-red-500'
                      : 'border-white/10 bg-white/[0.04] focus:border-apple-blue focus:ring-1 focus:ring-apple-blue'
                  }`}
                />
              </div>
              {/* Custom In-App Error Notification for Email */}
              {emailError && (
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[#FF453A] animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Input: Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-[#A1A1A6] mb-2">
                Contraseña
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
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border text-base text-[#F5F5F7] placeholder-[#636366] transition-all focus:outline-none ${
                    passwordError
                      ? 'border-red-500/70 bg-red-500/[0.04] ring-1 ring-red-500/30 focus:border-red-500'
                      : 'border-white/10 bg-white/[0.04] focus:border-apple-blue focus:ring-1 focus:ring-apple-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#86868B] hover:text-[#F5F5F7] transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    rememberTerminal ? 'translate-x-5' : 'translate-x-0'
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
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
              className="w-full mt-3 py-4 text-base font-semibold"
            >
              Iniciar Sesión
            </GlassButton>
          </form>
        </div>
      </div>
    </div>
  );
};
