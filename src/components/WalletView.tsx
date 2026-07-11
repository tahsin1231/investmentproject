import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Clock, HelpCircle, Copy, Check, QrCode } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { user, transactions, deposit, withdraw, language } = useApp();
  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState('USDT (TRC20)');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const mockCryptoAddresses: Record<string, string> = {
    'USDT (TRC20)': 'TY6Ssh98WpY8m8Hj8sK8n9A1F4S5hL8mNp',
    'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'ETH': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    'USDT (ERC20)': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mockCryptoAddresses[depositMethod]);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    
    deposit(amt, depositMethod);
    setDepositSuccess(true);
    setTimeout(() => setDepositSuccess(false), 3000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(false);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Provide a valid withdrawal quantity');
      return;
    }
    if (!withdrawAddress) {
      setWithdrawError('Provide a destination network address');
      return;
    }

    const result = withdraw(amt, withdrawAddress);
    if (result.success) {
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setWithdrawAddress('');
    } else {
      setWithdrawError(result.error || 'Withdrawal failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-emerald-400">
      
      {/* Balance Summary Header Cards (4 cols on lg) */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Total Balance */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <div className="absolute right-4 top-4 text-emerald-500/20">
            <DollarSign className="w-8 h-8" />
          </div>
          <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-1">
            {t.totalBalance}
          </span>
          <div className="text-xl font-bold text-white mb-2">
            ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </div>
          <p className="text-[9px] text-emerald-500/40 uppercase">Includes accumulated yields and manual deposits</p>
        </div>

        {/* Active Capital Allocations */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-1">
            {t.activeInvestments}
          </span>
          <div className="text-lg font-bold text-amber-500 mb-2">
            ${user?.activeInvestments.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
          </div>
          <p className="text-[9px] text-emerald-500/40 uppercase">Capital committed to active 30-day lock levels</p>
        </div>

        {/* Total Profits */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <span className="text-[10px] text-emerald-500/50 uppercase tracking-widest block mb-1">
            {t.totalProfit}
          </span>
          <div className="text-lg font-bold text-emerald-300 mb-2">
            ${user?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT
          </div>
          <p className="text-[9px] text-emerald-500/40 uppercase">Profits harvested from active AI prediction cycles</p>
        </div>

      </div>

      {/* Main Funding Center Terminal (8 cols on lg) */}
      <div className="lg:col-span-8 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 shadow-lg shadow-emerald-950/10">
        
        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-emerald-500/20 pb-3 mb-5">
          <button
            onClick={() => { setActiveSubTab('deposit'); setWithdrawSuccess(false); setWithdrawError(null); }}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === 'deposit'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-slate-900/50'
            }`}
          >
            {t.deposit}
          </button>
          <button
            onClick={() => { setActiveSubTab('withdraw'); setDepositSuccess(false); }}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === 'withdraw'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-slate-900/50'
            }`}
          >
            {t.withdrawTitle.split('/')[0].trim()}
          </button>
          <button
            onClick={() => { setActiveSubTab('history'); setDepositSuccess(false); setWithdrawSuccess(false); }}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-slate-900/50'
            }`}
          >
            {t.historyTitle.split('/')[0].trim()}
          </button>
        </div>

        {/* Deposit Panel */}
        {activeSubTab === 'deposit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <h3 className="font-bold text-white text-xs uppercase mb-2">USDT_DEPOSIT_LEDGER</h3>
              
              <div>
                <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">{t.depositAmount}</label>
                <input
                  type="number"
                  min="10"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">{t.depositMethod}</label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="USDT (TRC20)">USDT (TRC20 Protocol)</option>
                  <option value="USDT (ERC20)">USDT (ERC20 Protocol)</option>
                  <option value="BTC">Bitcoin (BTC Chain)</option>
                  <option value="ETH">Ethereum (ERC20)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{t.confirmDeposit}</span>
              </button>

              {depositSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded p-2 text-center text-[10px] uppercase">
                  FUND_INJECT_SUCCESS: Balance updated immediately.
                </div>
              )}
            </form>

            {/* QR Code */}
            <div className="bg-slate-900 border border-emerald-500/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white p-1 rounded mb-3 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-slate-950" />
              </div>

              <span className="text-[9px] text-emerald-500/40 uppercase mb-1 font-bold">LEDGER TARGET ADDRESS ({depositMethod})</span>
              <div className="flex items-center space-x-2 bg-slate-950 border border-emerald-500/20 rounded px-2.5 py-1.5 w-full justify-between mb-3">
                <span className="text-[9px] text-emerald-400 truncate pr-2 select-all font-mono">
                  {mockCryptoAddresses[depositMethod]}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-emerald-500 hover:text-white p-1 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <p className="text-[9px] text-emerald-500/40 uppercase leading-relaxed max-w-[200px]">
                Send only compatible protocol tokens. Cross-chain transfer results in terminal loss.
              </p>
            </div>
          </div>
        )}

        {/* Withdraw Panel */}
        {activeSubTab === 'withdraw' && (
          <form onSubmit={handleWithdrawSubmit} className="space-y-4 max-w-lg">
            <h3 className="font-bold text-white text-xs uppercase mb-2">OUTBOUND_CRYPTO_SETTLE</h3>
            
            <div className="bg-amber-500/5 border border-amber-500/20 rounded p-3 flex items-start space-x-2 text-[10px] text-amber-500 uppercase leading-relaxed mb-3">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                NOTICE: Active subscription levels are cold locked for exactly 30 days. Accrued yield balances and manual funding can be settled with zero outbound delay.
              </span>
            </div>

            {withdrawError && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded p-2 text-[10px] uppercase">
                ERROR: {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded p-2 text-[10px] uppercase text-center">
                WITHDRAW_PENDING: Cryptographic verification signature active.
              </div>
            )}

            <div>
              <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">{t.withdrawAmount}</label>
              <input
                type="number"
                min="5"
                placeholder="0.00"
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-emerald-500/60 uppercase mb-1">{t.withdrawAddress}</label>
              <input
                type="text"
                placeholder="T... or 0x..."
                required
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/20 focus:border-emerald-400 rounded py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t.confirmWithdraw}</span>
            </button>
          </form>
        )}

        {/* Transaction History Panel */}
        {activeSubTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-white text-xs uppercase mb-2">SYSTEM_TRANSACTION_LOG</h3>
            
            {transactions.length === 0 ? (
              <p className="text-emerald-500/40 text-xs text-center py-6 uppercase">No localized transactions identified on this node.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse uppercase">
                  <thead>
                    <tr className="text-emerald-500/50 border-b border-emerald-500/20 pb-2 text-[9px] tracking-wider">
                      <th className="py-2 hidden sm:table-cell">TX_ID</th>
                      <th className="py-2">TYPE</th>
                      <th className="py-2 text-right">VOLUME</th>
                      <th className="py-2">STATUS</th>
                      <th className="py-2 hidden sm:table-cell">DATETIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-emerald-500/10 hover:bg-slate-900/40 text-emerald-400/80">
                        <td className="py-2 font-semibold text-emerald-400 hidden sm:table-cell">0x{tx.id.slice(0, 8)}</td>
                        <td className="py-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-300' :
                            tx.type === 'withdraw' ? 'bg-red-500/20 text-red-300' :
                            tx.type === 'invest' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-emerald-500/40'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-2 text-right font-bold ${
                          tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'referral' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-2">
                          <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                             <Clock className="w-3 h-3 text-emerald-400" />
                             <span>{tx.status}</span>
                          </span>
                        </td>
                        <td className="py-2 text-emerald-500/40 hidden sm:table-cell">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
