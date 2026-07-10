import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { PLANS } from '../utils/data';
import { Terminal, Shield, Cpu, Activity, Play, ArrowRight, CornerDownRight, Coins, Wallet, Layers, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (view: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { language, stocks } = useApp();
  const t = translations[language];

  const [bootStep, setBootStep] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Simulation of UNIX boot sequence
  useEffect(() => {
    const logs = [
      "INIT: booting Project X Mainframe...",
      "SYSTEM: loading UNIX v11.8 kernel modules...",
      "NET: handshake with SiteChai Cloud nodes success",
      "SECURE: initializing AES-256 local vault matrix...",
      "QUANT: dynamic stock telemetry sockets connected",
      "INDICATOR: prediction engine online (100% active)",
      "SYSTEMS ONLINE: ready to initiate terminal."
    ];

    if (bootStep < logs.length) {
      const timer = setTimeout(() => {
        setBootLogs(prev => [...prev, logs[bootStep]]);
        setBootStep(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  return (
    <div className="bg-slate-950 text-emerald-400 min-h-screen flex flex-col p-4 md:p-8 font-mono select-none crt relative overflow-hidden">
      
      {/* Aesthetic matrix grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center space-y-8 relative z-10">
        
        {/* Terminal Header */}
        <div className="border border-emerald-500/30 bg-slate-900/60 rounded-xl p-4 md:p-6 shadow-lg shadow-emerald-950/20 animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
              <span className="text-emerald-500/60 font-bold ml-2">PROJECTX://MAINFRAME.SYS</span>
            </div>
            <div className="text-emerald-500/40 text-[10px]">
              TTY: /dev/pts/0 (ONLINE)
            </div>
          </div>

          {/* Simulated boot logs */}
          <div className="space-y-1.5 text-xs md:text-sm text-emerald-400 min-h-[140px] font-mono leading-relaxed">
            {bootLogs.map((log, idx) => (
              <div key={idx} className="flex items-start">
                <span className="text-emerald-500/50 mr-2">root@projectx:~#</span>
                <span>{log}</span>
              </div>
            ))}
            {bootStep < 7 && (
              <div className="flex items-center">
                <span className="text-emerald-500/50 mr-2">root@projectx:~#</span>
                <span className="w-2 h-4 bg-emerald-400 blink inline-block" />
              </div>
            )}
          </div>
        </div>

        {/* Brand Main Display */}
        {bootStep >= 7 && (
          <div className="text-center space-y-6 animate-fade-in py-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-emerald-400 uppercase crt-flicker font-display">
              {t.heroTitle}
            </h1>
            <p className="text-emerald-500/85 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed uppercase">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer border border-emerald-400"
              >
                <span>{t.createAccountFree}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto bg-slate-950 hover:bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold px-8 py-3.5 rounded-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>{t.login}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live System Nodes List */}
        {bootStep >= 7 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            {stocks.slice(0, 3).map(stock => (
              <div 
                key={stock.symbol}
                className="border border-emerald-500/20 bg-slate-950/85 p-4 rounded-lg relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-emerald-500/50 uppercase">{stock.type}</span>
                  <span className={`text-[10px] font-bold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? '▲' : '▼'} {stock.changePercent}%
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-sm">{stock.symbol}</span>
                  <span className="text-xs text-emerald-400">${stock.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Investment Plan Matrix */}
        {bootStep >= 7 && (
          <div className="border border-emerald-500/30 bg-slate-950/90 rounded-xl p-5 md:p-6 shadow-xl space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest font-mono">
                  [SYSTEM_INVESTMENT_PLAN_MATRIX] / [সিস্টেম ইনভেস্টমেন্ট প্ল্যান ম্যাট্রিক্স]
                </span>
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {language === 'bn' ? 'এআই কোয়ান্টাম আর্নিং প্ল্যান এবং ইনভেস্টমেন্ট লেভেলসমূহ' : 'AI Quantum Earning Plans & Investment Levels'}
              </h2>
              <p className="text-emerald-500/70 text-xs mt-1.5 leading-relaxed uppercase">
                {language === 'bn' 
                  ? 'নিচে আমাদের প্রতিটি প্ল্যানের মূল্য এবং দৈনিক আনুমানিক ইনকামের তালিকা দেওয়া হলো। প্রফেশনাল অ্যাকাউন্টের মাধ্যমে যেকোনো প্ল্যানে ইনভেস্ট করে প্রতিদিন রিয়েল-টাইম আর্নিং সংগ্রহ করতে পারেন।' 
                  : 'Below is the matrix of available subscription tiers, pricing, and estimated daily yields. Active contracts run for 30 days.'}
              </p>
            </div>

            {/* Plans Table */}
            <div className="overflow-x-auto border border-emerald-500/15 rounded-lg bg-slate-900/40">
              <table className="w-full text-left text-xs border-collapse font-mono uppercase">
                <thead>
                  <tr className="bg-slate-950/80 text-emerald-500/60 border-b border-emerald-500/20 text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">{language === 'bn' ? 'লেভেল' : 'LEVEL_ID'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'ইনভেস্টমেন্ট মূল্য' : 'PRICE (USDT)'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'দৈনিক ইনকাম' : 'DAILY YIELD'}</th>
                    <th className="py-3 px-4 text-center">{language === 'bn' ? 'মাসিক রিটার্ন' : '30-DAY TOTAL'}</th>
                    <th className="py-3 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'STATUS'}</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANS.map((plan) => (
                    <tr key={plan.id} className="border-b border-emerald-500/10 hover:bg-slate-900/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        <span>L{plan.id} - {plan.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-amber-500">${plan.price} USDT</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">${plan.minProfit.toFixed(2)} - ${plan.maxProfit.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-300 font-semibold">${(plan.minProfit * 30).toFixed(2)} - ${(plan.maxProfit * 30).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => onOpenAuth('register')}
                          className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1 rounded text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider"
                        >
                          <span>{language === 'bn' ? 'ইনভেস্ট করুন' : 'DEVICES'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Income and Execution explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-900/50 border border-emerald-500/15 rounded-lg p-4 space-y-2">
                <h4 className="text-white text-xs font-bold uppercase flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'কিভাবে ইনভেস্ট ও ইনকাম করবেন:' : 'How to Invest & Earn:'}</span>
                </h4>
                <ul className="text-[11px] text-emerald-500/85 space-y-1.5 uppercase leading-relaxed list-inside list-decimal">
                  <li>
                    {language === 'bn' 
                      ? 'ব্যালেন্স যুক্ত করুন: আপনার ওয়ালেট থেকে USDT (TRC20/ERC20) ডিপোজিট করুন।' 
                      : 'Fund Your Balance: Deposit USDT using safe TRC20, ERC20 or native BTC/ETH.'}
                  </li>
                  <li>
                    {language === 'bn' 
                      ? 'লেভেল অ্যাক্টিভেট করুন: আপনার ব্যালেন্স অনুযায়ী L1 থেকে L7 যেকোনো লেভেলে ক্লিক করে ইনভেস্ট করুন।' 
                      : 'Activate Contract: Choose from L1 to L7 according to your balance to deploy capital.'}
                  </li>
                  <li>
                    {language === 'bn' 
                      ? 'মাইনিং প্রফিট সংগ্রহ: স্বয়ংক্রিয় কোয়ান্টাম এআই বটের মাধ্যমে প্রতিদিন আর্নিং বা লাভ হবে।' 
                      : 'Harvest Yields: Auto AI server mining works 24/7. Harvest accumulated yields anytime.'}
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/50 border border-emerald-500/15 rounded-lg p-4 space-y-2">
                <h4 className="text-white text-xs font-bold uppercase flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'গুরুত্বপূর্ণ নিয়মাবলী:' : 'Core Protocols & Rules:'}</span>
                </h4>
                <ul className="text-[11px] text-emerald-500/85 space-y-1.5 uppercase leading-relaxed list-inside list-disc">
                  <li>
                    {language === 'bn' 
                      ? 'মেয়াদ: প্রতিটি ইনভেস্টমেন্ট চুক্তি ঠিক ৩০ দিন পর্যন্ত সক্রিয় থাকে।' 
                      : 'Lock-in span: All active investment plan contracts run for exactly 30 days.'}
                  </li>
                  <li>
                    {language === 'bn' 
                      ? 'উইথড্র: প্রতিদিনের প্রফিট বা লাভ সাথে সাথে যেকোনো ক্রিপ্টো ওয়ালেটে উইথড্র করা যায়।' 
                      : 'Instant Liquidation: Harvested profits and referral dividends have zero cashout delay.'}
                  </li>
                  <li>
                    {language === 'bn' 
                      ? 'রেফারেল বোনাস: আপনার লিংকের মাধ্যমে কেউ জয়েন করলে সাথে সাথে ২০% ইনস্ট্যান্ট বোনাস পাবেন।' 
                      : 'Affiliate tier: Earn 20% instant credit from all direct referred activations.'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Core Specs */}
        {bootStep >= 7 && (
          <div className="border border-emerald-500/10 bg-slate-900/20 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-[11px] text-emerald-500/70 uppercase">
            <div className="space-y-1">
              <span className="block text-emerald-500/40">HOST_ING</span>
              <span className="font-bold text-white">SITECHAI cPANEL</span>
            </div>
            <div className="space-y-1 border-l border-emerald-500/10">
              <span className="block text-emerald-500/40">SECURE_LEVEL</span>
              <span className="font-bold text-white">AES-256 VAULT</span>
            </div>
            <div className="space-y-1 border-l border-emerald-500/10">
              <span className="block text-emerald-500/40">YIELD_SYSTEM</span>
              <span className="font-bold text-white">AUTO AI MINING</span>
            </div>
            <div className="space-y-1 border-l border-emerald-500/10">
              <span className="block text-emerald-500/40">SYS_FEE</span>
              <span className="font-bold text-white">0% DEPOSIT</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
