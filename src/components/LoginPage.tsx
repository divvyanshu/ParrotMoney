import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Mail, Phone, ArrowRight, ArrowLeft,
  Sparkles, CheckCircle2, AlertCircle,
  Building2, Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

interface LoginPageProps {
  onBackToHome?: () => void;
  onBack?: () => void;
  onCustomerLoginSuccess?: (emailOrPhone: string) => Promise<void> | void;
  onAdminLoginSuccess?: (adminEmail?: string) => void;
  onLoginSuccess?: (role: 'customer' | 'admin') => void;
  onGoogleSignIn?: () => void;
  initialMode?: 'customer' | 'admin';
}

export function LoginPage({
  onBackToHome,
  onBack,
  onCustomerLoginSuccess,
  onAdminLoginSuccess,
  onLoginSuccess,
  onGoogleSignIn,
  initialMode = 'customer'
}: LoginPageProps) {
  const handleBack = onBack || onBackToHome || (() => window.history.back());
  const [authMode, setAuthMode] = useState<'customer' | 'admin'>(initialMode);
  
  // Customer Form State
  const [customerInput, setCustomerInput] = useState('');
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Admin mode is authenticated only through the real Firebase account session.
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('Email/mobile sign-in is temporarily unavailable until a verified OTP provider is connected. Please use Google Sign-In or Continue as Guest.');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('OTP verification is unavailable until a verified OTP provider is connected.');
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setIsAdminLoading(true);

    try {
      if (!onGoogleSignIn) {
        throw new Error('Secure administrator sign-in is not configured.');
      }

      await onGoogleSignIn();

      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      }
      if (onLoginSuccess) {
        onLoginSuccess('admin');
      }
    } catch (err: any) {
      setAdminError(err?.message || 'Administrator sign-in failed. Use an authorized Google account.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setIsCustomerLoading(true);
    setCustomerError('');
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn();
      }
      if (onLoginSuccess) {
        onLoginSuccess('customer');
      }
    } catch (err: any) {
      setCustomerError(err?.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const handleFillDemoCustomer = (type: 'email' | 'phone') => {
    setCustomerError('');
    setOtpSent(false);
    if (type === 'email') {
      setCustomerInput('rahul.sharma@example.com');
    } else {
      setCustomerInput('9876543210');
    }
  };

  const handleFillDemoAdmin = () => {
    setAdminError('Sandbox administrator passcodes have been removed. Sign in with an authorized Google account.');
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col justify-between selection:bg-natural-terracotta/20 selection:text-natural-sage">
      {/* Top Bar */}
      <header className="w-full max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-natural-muted hover:text-natural-sage font-bold text-xs uppercase tracking-widest transition-all cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="cursor-pointer" onClick={handleBack}>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            256-Bit SSL Secure
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[2.5rem] border border-natural-border shadow-2xl p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-natural-terracotta/5 rounded-full blur-3xl -z-0 pointer-events-none" />

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-8 border border-slate-200/50 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('customer');
                  setCustomerError('');
                  setOtpSent(false);
                }}
                className={cn(
                  "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none",
                  authMode === 'customer' 
                    ? "bg-white text-natural-sage shadow-md" 
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <Users className="w-4 h-4" />
                Customer Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('admin');
                  setAdminError('');
                }}
                className={cn(
                  "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none",
                  authMode === 'admin' 
                    ? "bg-natural-sage text-white shadow-md" 
                    : "text-natural-muted hover:text-natural-sage"
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authMode === 'customer' ? (
                /* Customer Login Form */
                <motion.div
                  key="customer-auth"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 relative z-10"
                >
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-black text-natural-sage tracking-tight">
                      {otpSent ? "Verify Security Code" : "Sign In to Your Account"}
                    </h2>
                    <p className="text-xs text-natural-muted font-medium">
                      {otpSent 
                        ? `We sent a quick verification code to ${customerInput}`
                        : "Track your home loan applications, rate offers & bank decisions"
                      }
                    </p>
                  </div>

                  {customerError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{customerError}</span>
                    </div>
                  )}

                  {!otpSent ? (
                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">
                          Registered Mobile Number or Email
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={customerInput}
                            onChange={(e) => {
                              setCustomerInput(e.target.value);
                              setCustomerError('');
                            }}
                            placeholder="e.g. 9876543210 or yourname@gmail.com"
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50/70 border border-natural-border rounded-xl text-sm font-bold text-natural-sage placeholder:text-natural-muted/60 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
                            required
                            autoFocus
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-muted pointer-events-none">
                            {customerInput.includes('@') ? (
                              <Mail className="w-4 h-4" />
                            ) : (
                              <Phone className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCustomerLoading}
                        className="w-full py-4 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer border-none active:scale-[0.99]"
                      >
                        {isCustomerLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          <>
                            Continue with Secure Sign In
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="relative flex items-center justify-center my-4">
                        <div className="border-t border-slate-200 w-full" />
                        <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-natural-muted shrink-0">
                          Or Connect With
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isCustomerLoading}
                        onClick={handleGoogleSignInClick}
                        className="w-full py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        {isCustomerLoading ? 'Connecting...' : 'Sign In with Google Account'}
                      </button>

                      <button
                        type="button"
                        disabled={isCustomerLoading}
                        onClick={async () => {
                          setCustomerError('');
                          setIsCustomerLoading(true);
                          try {
                            await onGoogleSignIn?.();
                            if (onLoginSuccess) onLoginSuccess('customer');
                          } catch (err: any) {
                            setCustomerError(err?.message || 'Secure guest session could not be created.');
                          } finally {
                            setIsCustomerLoading(false);
                          }
                        }}
                        className="w-full py-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Continue as Guest
                      </button>

                      {/* Quick Test Demo Autofill */}
                      <div className="pt-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-center text-natural-muted mb-2">
                          Quick Demo Fill
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleFillDemoCustomer('phone')}
                            className="flex-1 py-2 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border-none cursor-pointer"
                          >
                            Demo Phone: 9876543210
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFillDemoCustomer('email')}
                            className="flex-1 py-2 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border-none cursor-pointer"
                          >
                            Demo Email: Rahul
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* OTP Verification Sub-step */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-natural-muted">
                          Enter 6-Digit One Time Password (OTP)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => {
                            setOtpCode(e.target.value.replace(/\D/g, ''));
                            setCustomerError('');
                          }}
                          placeholder="• • • • • •"
                          className="w-full text-center tracking-[0.5em] text-xl font-black py-3.5 bg-slate-50 border border-natural-border rounded-xl text-natural-sage focus:bg-white focus:border-emerald-600 focus:outline-none"
                          autoFocus
                          required
                        />
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <button
                            type="button"
                            onClick={() => setCustomerError('Demo OTP values have been disabled. A verified OTP provider is required for mobile sign-in.')}
                            className="text-emerald-700 font-bold hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Auto-fill OTP: 123456
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-natural-muted hover:text-natural-sage font-bold bg-transparent border-none cursor-pointer"
                          >
                            Change Number
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCustomerLoading}
                        className="w-full py-4 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer border-none"
                      >
                        {isCustomerLoading ? 'Verifying...' : 'Confirm OTP & Open Dashboard'}
                      </button>
                    </form>
                  )}
                </motion.div>
              ) : (
                /* Admin Login Form */
                <motion.div
                  key="admin-auth"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 relative z-10"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-natural-sage/10 text-natural-sage rounded-2xl flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-natural-sage tracking-tight">
                      Administrator Sign In
                    </h2>
                    <p className="text-xs text-natural-muted font-medium">
                      Administrator access is restricted to authorized Firebase accounts.
                    </p>
                  </div>

                  {adminError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                      Sign in with Google. Your account must already have administrator privileges; entering a local password is no longer supported.
                    </div>

                    <button
                      type="submit"
                      disabled={isAdminLoading}
                      className="w-full py-4 bg-natural-sage hover:bg-natural-sage/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-natural-sage/20 flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      {isAdminLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing in securely...
                        </span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Continue with Google
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>              )}
            </AnimatePresence>

            {/* Bottom Highlights */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-natural-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero spam, end-to-end encrypted</span>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-black text-natural-terracotta hover:underline bg-transparent border-none cursor-pointer"
              >
                Explore Without Signing In →
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="py-6 text-center text-xs text-natural-muted">
        <p className="font-medium">
          ParrotMoney Financial Technologies Pvt. Ltd. &copy; 2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
