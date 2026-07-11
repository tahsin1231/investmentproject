import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './components/HomeView';
import { MarketsView } from './components/MarketsView';
import { EarnView } from './components/EarnView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { MiningBot } from './components/MiningBot';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { Terminal as TerminalIcon, CornerDownRight } from 'lucide-react';

interface TerminalLog {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

function MainApp() {
  const { user, activePlans, buyPlan, triggerMiningPayout, miningBalance } = useApp();
  const [currentTab, setCurrentTab] = useState<'home' | 'markets' | 'earn' | 'wallet' | 'profile'>('home');
  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);

  // Shell CLI States
  const [cmdInput, setCmdInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { text: "DODDOGE UNIX SYSTEM TERMINAL. TTY/0 READY.", type: "success" },
    { text: "TYPE 'help' TO VIEW COMPATIBLE SYSTEM COMMANDS.", type: "output" }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Handle URL pending referrals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('doddoge_pending_referral', ref);
    }
  }, []);

  // Sync Auth State
  useEffect(() => {
    if (user && user.isVerified) {
      setAuthView(null);
    }
  }, [user]);

  // Handle CLI Command Execution
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCmd = cmdInput.trim();
    if (!fullCmd) return;

    const args = fullCmd.split(/\s+/);
    const command = args[0].toLowerCase();

    // Log the user's input
    const newLogs: TerminalLog[] = [...terminalLogs, { text: `user@doddoge:~$ ${fullCmd}`, type: 'input' }];

    switch (command) {
      case 'help':
        newLogs.push(
          { text: "--- AVAILABLE UNIX TTY SYSTEM COMMANDS ---", type: 'success' },
          { text: "  help                     : Show compatible mainframe command sets.", type: 'output' },
          { text: "  home                     : Route to main Dashboard and AI news hub.", type: 'output' },
          { text: "  markets                  : Route to Live Market stream telemetry.", type: 'output' },
          { text: "  earn                     : Route to Auto AI Trading yield portal.", type: 'output' },
          { text: "  wallet                   : Route to personal USDT funding and transaction ledgers.", type: 'output' },
          { text: "  profile                  : Route to affiliate networking peer node.", type: 'output' },
          { text: "  clear                    : Reset active terminal screen buffer.", type: 'output' },
          { text: "  cat balance.txt          : Display available USDT ledger balance.", type: 'output' },
          { text: "  cat plans.txt            : Output all daily mining plans with daily yields.", type: 'output' },
          { text: "  invest <plan_id>         : Deploy capital to level [1-7] (e.g. invest 1).", type: 'output' },
          { text: "  harvest                  : Claim accumulated mining bot profits to wallet.", type: 'output' },
          { text: "-----------------------------------------", type: 'success' }
        );
        break;

      case 'home':
        setCurrentTab('home');
        newLogs.push({ text: "SYS_ROUTE: Loaded Home Dashboard interface.", type: 'success' });
        break;

      case 'markets':
        setCurrentTab('markets');
        newLogs.push({ text: "SYS_ROUTE: Loaded Markets TTY interface.", type: 'success' });
        break;

      case 'earn':
        setCurrentTab('earn');
        newLogs.push({ text: "SYS_ROUTE: Loaded Auto AI Trading plans.", type: 'success' });
        break;

      case 'wallet':
        setCurrentTab('wallet');
        newLogs.push({ text: "SYS_ROUTE: Loaded Funding Ledger Center.", type: 'success' });
        break;

      case 'profile':
        setCurrentTab('profile');
        newLogs.push({ text: "SYS_ROUTE: Loaded Affiliate networking node.", type: 'success' });
        break;

      case 'clear':
        setTerminalLogs([{ text: "Active screen buffer cleared. TTY/0 online.", type: 'output' }]);
        setCmdInput('');
        return;

      case 'cat':
        if (args[1] === 'balance.txt') {
          if (user) {
            newLogs.push({ text: `LEDGER BALANCE: $${user.balance.toFixed(2)} USDT`, type: 'success' });
          } else {
            newLogs.push({ text: "ERROR: Unauthorized user session.", type: 'error' });
          }
        } else if (args[1] === 'plans.txt') {
          newLogs.push(
            { text: "--- AVAILABLE LEVEL DEPLOYMENTS ---", type: 'success' },
            { text: "  L1: Price 10$  | Yield: 0.40$ - 0.80$ daily", type: 'output' },
            { text: "  L2: Price 20$  | Yield: 0.80$ - 1.80$ daily", type: 'output' },
            { text: "  L3: Price 50$  | Yield: 2.00$ - 3.00$ daily", type: 'output' },
            { text: "  L4: Price 100$ | Yield: 4.00$ - 5.00$ daily", type: 'output' },
            { text: "  L5: Price 300$ | Yield: 10.00$ - 15.00$ daily", type: 'output' },
            { text: "  L6: Price 500$ | Yield: 18.00$ - 25.00$ daily", type: 'output' },
            { text: "  L7: Price 1000$| Yield: 30.00$ - 50.00$ daily", type: 'output' },
            { text: "  Note: Plans locked in for 30 days. Profits accumulate daily.", type: 'output' }
          );
        } else {
          newLogs.push({ text: "USAGE: cat [balance.txt | plans.txt]", type: 'error' });
        }
        break;

      case 'invest':
        if (!user) {
          newLogs.push({ text: "ERROR: Unauthorized session. Please authenticate first.", type: 'error' });
          break;
        }
        const planId = args[1];
        if (!planId || isNaN(parseInt(planId)) || parseInt(planId) < 1 || parseInt(planId) > 7) {
          newLogs.push({ text: "USAGE: invest [1-7] (e.g. invest 1 to deploy $10 Level 1 contract)", type: 'error' });
        } else {
          const res = buyPlan(planId);
          if (res.success) {
            newLogs.push({ text: `SYS_DEPLOY_SUCCESS: initialised Level ${planId} plan contract successfully.`, type: 'success' });
            setCurrentTab('earn');
          } else {
            newLogs.push({ text: `SYS_DEPLOY_FAILED: ${res.error || 'insufficient balance'}`, type: 'error' });
          }
        }
        break;

      case 'harvest':
        if (!user) {
          newLogs.push({ text: "ERROR: Unauthorized session.", type: 'error' });
        } else if (miningBalance <= 0) {
          newLogs.push({ text: "SYS_HARVEST_FAIL: Mining node balance is currently 0.00.", type: 'error' });
        } else {
          triggerMiningPayout();
          newLogs.push({ text: `SYS_HARVEST_SUCCESS: Claims routed directly to master wallet ledger successfully.`, type: 'success' });
        }
        break;

      default:
        newLogs.push({ text: `command not identified: '${command}'. Type 'help' for compatible instruction sets.`, type: 'error' });
    }

    setTerminalLogs(newLogs);
    setCmdInput('');
  };

  return (
    <div className="bg-slate-950 text-emerald-400 min-h-screen flex flex-col font-mono selection:bg-emerald-500 selection:text-slate-950 crt relative overflow-hidden">
      
      {/* Laser line horizontal scanning overlay */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-emerald-500/10 shadow-[0_0_10px_#10b981] animate-[pulse_2s_infinite] pointer-events-none z-50" />

      {/* Header / Navigation bar */}
      <Navbar 
        onOpenAuth={(view) => setAuthView(view)} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col pb-24">
        {user && user.isVerified ? (
          /* Logged In Dashboard View */
          <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
            
            {/* Interactive Shell Console Terminal */}
            <div className="border border-emerald-500/30 bg-slate-950/90 rounded-xl overflow-hidden shadow-lg shadow-emerald-950/10">
              {/* Window Header */}
              <div className="bg-slate-950 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <TerminalIcon className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-white uppercase tracking-wider">DODDOGE_SYSTEM_SHELL_TTY0</span>
                </div>
                <div className="flex items-center space-x-3 text-emerald-500/50">
                  <span>ACTIVE_TTY</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Logs Screen */}
              <div className="p-4 h-48 overflow-y-auto space-y-1.5 border-b border-emerald-500/10 bg-slate-950 scrollbar">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="text-xs flex items-start font-mono leading-relaxed">
                    <span className="text-emerald-500/40 mr-2 shrink-0">&gt;&gt;</span>
                    <span className={
                      log.type === 'input' ? 'text-white font-bold' :
                      log.type === 'error' ? 'text-red-400 font-bold' :
                      log.type === 'success' ? 'text-emerald-300 font-bold' : 'text-emerald-500/85'
                    }>
                      {log.text}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Command Prompt Form Input */}
              <form onSubmit={handleCommandSubmit} className="flex items-center bg-slate-950 px-4 py-2 text-xs">
                <CornerDownRight className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                <span className="text-emerald-500/60 font-bold mr-1.5 select-none">user@doddoge:~$</span>
                <input
                  type="text"
                  placeholder="type instruction (e.g. help, clear, home, markets, earn)..."
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none placeholder-emerald-500/25 border-none select-all font-mono"
                />
              </form>
            </div>

            {/* Split Page Frame Window */}
            <div className="border border-emerald-500/30 bg-slate-950/90 rounded-xl overflow-hidden shadow-lg shadow-emerald-950/10">
              <div className="bg-slate-950 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-[11px] uppercase text-emerald-500/50 font-bold">
                <span>SYSTEM_WINDOW: /usr/local/bin/{currentTab}</span>
                <span>COM_LINK_SECURE</span>
              </div>
              <div className="p-6">
                {currentTab === 'home' && <HomeView />}
                {currentTab === 'markets' && <MarketsView />}
                {currentTab === 'earn' && <EarnView />}
                {currentTab === 'wallet' && <WalletView />}
                {currentTab === 'profile' && <ProfileView />}
              </div>
            </div>

          </div>
        ) : (
          /* Guest Landing Page */
          <LandingPage onOpenAuth={(view) => setAuthView(view)} />
        )}
      </main>

      {/* Persistent Floating AI Mining Bot */}
      <MiningBot />

      {/* Glowing Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Footer Area */}
      <Footer />

      {/* Interactive Authorization Modals (Sign Up / Verification / Log In) */}
      <AuthModal 
        view={authView} 
        onClose={() => setAuthView(null)} 
        onSetView={setAuthView} 
      />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
