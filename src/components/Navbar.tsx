import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Globe, LogOut, Wallet, Terminal, Cpu, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (view: 'login' | 'register') => void;
  currentTab: 'markets' | 'earn' | 'wallet' | 'profile';
  setCurrentTab: (tab: 'markets' | 'earn' | 'wallet' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, currentTab, setCurrentTab }) => {
  const { user, logout, language, setLanguage } = useApp();
  const t = translations[language];

  return (
    <header className="border-b border-emerald-500/30 bg-slate-950 font-mono text-emerald-400">
      
      {/* Top Telemetry Header Rail */}
      <div className="bg-slate-950 border-b border-emerald-500/10 px-4 py-1 flex flex-col sm:flex-row sm:justify-between items-center text-[10px] uppercase text-emerald-500/50 gap-2">
        <div className="flex items-center space-x-4">
          <span>HOST: SITECHAI_V11</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">NODE_ID: ABC79FEE</span>
          <span className="hidden md:inline">•</span>
          <span>SPEED: 200 ms (SECURE)</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>UTC: {new Date().toISOString().slice(11, 19)}</span>
          <span>•</span>
          <span>SECURE PROTOCOL ACTIVE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          <div 
            onClick={() => { if (user) setCurrentTab('markets'); }}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-emerald-500 text-slate-950 font-bold text-sm tracking-widest rounded">
              PX
            </div>
            <span className="font-display font-bold text-white tracking-widest text-base group-hover:text-emerald-400 transition-colors uppercase crt-flicker">
              PROJECTX<span className="text-emerald-500">_CLI</span>
            </span>
          </div>

          {/* Nav items only if logged in */}
          {user && user.isVerified && (
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setCurrentTab('markets')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentTab === 'markets'
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                    : 'text-emerald-500 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  {t.markets}
                </span>
              </button>
              <button
                onClick={() => setCurrentTab('earn')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentTab === 'earn'
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                    : 'text-emerald-500 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  {t.earn}
                </span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-1 text-emerald-500/70 hover:text-emerald-400 px-2 py-1.5 rounded text-xs font-bold transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-emerald-500/30 rounded shadow-xl py-1 hidden group-hover:block w-28 z-50">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-950 hover:text-emerald-400 transition-colors uppercase ${language === 'en' ? 'text-emerald-400 font-bold' : 'text-emerald-500/60'}`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-950 hover:text-emerald-400 transition-colors uppercase ${language === 'bn' ? 'text-emerald-400 font-bold' : 'text-emerald-500/60'}`}
              >
                BENGALI
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-950 hover:text-emerald-400 transition-colors uppercase ${language === 'es' ? 'text-emerald-400 font-bold' : 'text-emerald-500/60'}`}
              >
                ESPAÑOL
              </button>
            </div>
          </div>

          {user && user.isVerified ? (
            <div className="flex items-center space-x-3">
              {/* Wallet Button */}
              <button
                onClick={() => setCurrentTab('wallet')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
                  currentTab === 'wallet'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:bg-slate-850'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>${user.balance.toFixed(2)} USDT</span>
              </button>

              {/* Profile button */}
              <button
                onClick={() => setCurrentTab('profile')}
                className={`p-1.5 rounded hover:bg-slate-900/40 text-emerald-500/70 hover:text-emerald-400 transition-colors cursor-pointer ${
                  currentTab === 'profile' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/20' : ''
                }`}
              >
                <UserIcon className="w-4 h-4" />
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-1.5 bg-slate-900 hover:bg-red-950/30 text-emerald-500/50 hover:text-red-400 rounded border border-emerald-500/15 hover:border-red-500/30 transition-all cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-emerald-500/80 hover:text-emerald-400 font-bold text-xs py-2 px-3 transition-colors cursor-pointer uppercase"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-4 rounded transition-all cursor-pointer uppercase border border-emerald-400"
              >
                {t.createAccountFree}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation sub-rail for logged-in users */}
      {user && user.isVerified && (
        <div className="md:hidden border-t border-emerald-500/15 bg-slate-950 px-4 py-2 flex justify-around items-center text-[10px] font-bold">
          <button
            onClick={() => setCurrentTab('markets')}
            className={`flex flex-col items-center gap-1 uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'markets' ? 'text-emerald-400' : 'text-emerald-500/40 hover:text-emerald-500/70'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{t.markets}</span>
          </button>
          <button
            onClick={() => setCurrentTab('earn')}
            className={`flex flex-col items-center gap-1 uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'earn' ? 'text-emerald-400' : 'text-emerald-500/40 hover:text-emerald-500/70'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{t.earn}</span>
          </button>
          <button
            onClick={() => setCurrentTab('wallet')}
            className={`flex flex-col items-center gap-1 uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'wallet' ? 'text-emerald-400' : 'text-emerald-500/40 hover:text-emerald-500/70'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{t.wallet.split(' ')[0]}</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center gap-1 uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === 'profile' ? 'text-emerald-400' : 'text-emerald-500/40 hover:text-emerald-500/70'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t.profile}</span>
          </button>
        </div>
      )}
    </header>
  );
};
