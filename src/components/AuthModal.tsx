import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Mail, Key, ShieldCheck, HelpCircle, ArrowRight, UserPlus, LogIn, MailOpen } from 'lucide-react';

interface AuthModalProps {
  view: 'login' | 'register' | null;
  onClose: () => void;
  onSetView: (view: 'login' | 'register' | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ view, onClose, onSetView }) => {
  const { register, login, verifyEmail, user, language } = useApp();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [refCode, setRefCode] = useState('');
  const [password, setPassword] = useState(''); // Simulated password
  const [error, setError] = useState<string | null>(null);
  
  // Verification states
  const [showMailSimulation, setShowMailSimulation] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  if (!view) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide a valid email address');
      return;
    }

    if (view === 'register') {
      const res = register(email, refCode || undefined);
      if (res.success) {
        // Trigger simulated verification email sequence
        setShowMailSimulation(true);
      } else {
        setError(res.error || 'Registration failed');
      }
    } else {
      const res = login(email);
      if (res.success) {
        // Check if user is already verified
        const currentUser = JSON.parse(localStorage.getItem('projectx_session_user') || '{}');
        if (currentUser.isVerified) {
          onClose();
        } else {
          setShowMailSimulation(true);
        }
      } else {
        setError(res.error || 'Login failed');
      }
    }
  };

  const handleSimulateVerification = () => {
    verifyEmail();
    setVerificationSuccess(true);
  };

  const handleProceedToTerminal = () => {
    setShowMailSimulation(false);
    setVerificationSuccess(false);
    onSetView('login');
    setEmail('');
    setRefCode('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-mono hover:scale-110 transition-transform cursor-pointer"
        >
          [ESC]
        </button>

        {!showMailSimulation ? (
          <div className="p-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg font-bold text-xs">
                PX
              </div>
              <span className="font-mono text-xs text-amber-500 font-bold uppercase tracking-widest">
                PROJECT X TERMINAL
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              {view === 'register' ? t.signUpTitle : t.login}
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              {view === 'register' ? t.signUpSubtitle : 'Access your secure quant indicators, active miners, and premium telemetry charts.'}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs mb-4 font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Password (Secured Session Pin)
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {view === 'register' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.refLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="PX-XXXXXX"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{view === 'register' ? t.submitSignUp : t.login}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => onSetView(view === 'register' ? 'login' : 'register')}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {view === 'register' ? t.alreadyHaveAccount : t.dontHaveAccount}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {!verificationSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <MailOpen className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {t.verificationSentTitle}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {t.verificationSentSubtitle}
                </p>

                {/* Simulated Email Payload Drawer */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left mb-8">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2.5 text-[10px] font-mono text-slate-500">
                    <div>
                      <span className="text-slate-400 font-semibold">FROM:</span> system@projectx.ai
                    </div>
                    <div>
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mb-4">
                    <span className="text-slate-500 font-semibold">TO:</span> {email}
                    <br />
                    <span className="text-slate-500 font-semibold">SUBJ:</span> Complete Your Profile Verification
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Click the button below to sign the cryptographic validation hash and register your account on the live stock analysis dashboard.
                  </p>

                  <button
                    onClick={handleSimulateVerification}
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-semibold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verify Profile Account</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Simulated verification mail system is active</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {t.verificationSuccessTitle}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {t.verificationSuccessSubtitle}
                </p>

                <button
                  onClick={handleProceedToTerminal}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.proceedToLogin}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
