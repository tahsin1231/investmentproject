import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ActivePlan, Transaction, StockData, Plan } from '../types';
import { INITIAL_STOCKS, updateStockPrices, PLANS } from '../utils/data';

interface AppContextType {
  user: User | null;
  activePlans: ActivePlan[];
  transactions: Transaction[];
  stocks: StockData[];
  selectedStock: StockData;
  setSelectedStock: (stock: StockData) => void;
  language: 'en' | 'es' | 'bn';
  setLanguage: (lang: 'en' | 'es' | 'bn') => void;
  register: (email: string, referralCode?: string) => { success: boolean; error?: string };
  verifyEmail: () => void;
  login: (email: string) => { success: boolean; error?: string };
  logout: () => void;
  deposit: (amount: number, method: string) => void;
  withdraw: (amount: number, address: string) => { success: boolean; error?: string };
  buyPlan: (planId: string) => { success: boolean; error?: string };
  miningActive: boolean;
  setMiningActive: (active: boolean) => void;
  miningBalance: number;
  triggerMiningPayout: () => void;
  referrals: { email: string; date: string; bonus: number }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('projectx_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activePlans, setActivePlans] = useState<ActivePlan[]>(() => {
    const saved = localStorage.getItem('projectx_active_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('projectx_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockData>(INITIAL_STOCKS[0]);
  const [language, setLanguage] = useState<'en' | 'es' | 'bn'>('en');

  // Mining Simulation states
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningBalance, setMiningBalance] = useState<number>(0);

  const miningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load and sync stocks update
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => {
        const next = updateStockPrices(prev);
        // Sync selected stock too
        const found = next.find(s => s.symbol === selectedStock.symbol);
        if (found) setSelectedStock(found);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Run auto accumulation of plan profits
  useEffect(() => {
    if (!user || activePlans.length === 0) return;

    const interval = setInterval(() => {
      // Small simulated tick update for mining
      if (miningActive) {
        // Calculate total daily yield of all active plans per second
        const totalDailyProfit = activePlans.reduce((sum, p) => sum + p.dailyProfit, 0);
        // 1 day = 86400 seconds. Let's make the simulation run 100x faster for visual entertainment
        const tickProfit = (totalDailyProfit / 86400) * 120; 
        setMiningBalance(prev => prev + tickProfit);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, activePlans, miningActive]);

  // Handle localstorage persist
  useEffect(() => {
    if (user) {
      localStorage.setItem('projectx_session_user', JSON.stringify(user));
      // Save to main user list too
      const users = JSON.parse(localStorage.getItem('projectx_users') || '[]');
      const index = users.findIndex((u: User) => u.id === user.id);
      if (index > -1) {
        users[index] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem('projectx_users', JSON.stringify(users));
    } else {
      localStorage.removeItem('projectx_session_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('projectx_active_plans', JSON.stringify(activePlans));
  }, [activePlans]);

  useEffect(() => {
    localStorage.setItem('projectx_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculate referrals
  const getReferrals = () => {
    if (!user) return [];
    const usersList: User[] = JSON.parse(localStorage.getItem('projectx_users') || '[]');
    return usersList
      .filter(u => u.referredBy === user.referralCode)
      .map(u => ({
        email: u.email,
        date: new Date(u.createdAt).toLocaleDateString(),
        bonus: 2.0 // standard registration simulated bonus or plan purchase bonus
      }));
  };

  const register = (email: string, referralCode?: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('projectx_users') || '[]');
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }

    const refCode = 'PX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Check if referral code is valid
    let referredBy: string | undefined = undefined;
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        referredBy = referralCode;
        // Credit reward or record referrer info
        referrer.referralsCount = (referrer.referralsCount || 0) + 1;
        // 20% bonus structure: we can give some bonus on active buy later
        const updatedUsers = users.map(u => u.id === referrer.id ? referrer : u);
        localStorage.setItem('projectx_users', JSON.stringify(updatedUsers));
      }
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase(),
      isVerified: false,
      balance: 0,
      activeInvestments: 0,
      totalProfit: 0,
      referralCode: refCode,
      referredBy,
      referralsCount: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('projectx_users', JSON.stringify(users));
    setUser(newUser);
    return { success: true };
  };

  const verifyEmail = () => {
    if (!user) return;
    const updated = { ...user, isVerified: true };
    setUser(updated);
  };

  const login = (email: string) => {
    const users: User[] = JSON.parse(localStorage.getItem('projectx_users') || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!found) {
      // For ease of evaluation and professional fallback, if user enters the demo email or any new email, register them instantly
      return register(email);
    }
    
    setUser(found);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setActivePlans([]);
    setTransactions([]);
    setMiningActive(false);
    setMiningBalance(0);
  };

  const deposit = (amount: number, method: string) => {
    if (!user) return;
    
    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'deposit',
      amount,
      status: 'completed', // Auto complete the deposit for ease of testing
      date: new Date().toLocaleString(),
      txHash: '0x' + Math.random().toString(16).substring(2, 18) + '...'
    };

    setTransactions(prev => [newTx, ...prev]);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: Number((prev.balance + amount).toFixed(2))
      };
    });
  };

  const withdraw = (amount: number, address: string) => {
    if (!user) return { success: false, error: 'User not found' };
    if (user.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'withdraw',
      amount,
      status: 'pending', // Pending withdrawal requires simulated approval or takes action
      date: new Date().toLocaleString(),
      txHash: address
    };

    setTransactions(prev => [newTx, ...prev]);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: Number((prev.balance - amount).toFixed(2))
      };
    });

    return { success: true };
  };

  const buyPlan = (planId: string) => {
    if (!user) return { success: false, error: 'User not logged in' };
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };
    if (user.balance < plan.price) {
      return { success: false, error: 'Insufficient balance to purchase this plan. Please deposit more funds first.' };
    }

    // Determine random daily profit between min and max
    const dailyProfit = Number((Math.random() * (plan.maxProfit - plan.minProfit) + plan.minProfit).toFixed(2));

    const newActivePlan: ActivePlan = {
      id: 'AP-' + Math.floor(100000 + Math.random() * 900000),
      planId: plan.id,
      name: plan.name,
      price: plan.price,
      dailyProfit,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString(),
      lastCollectedAt: new Date().toISOString(),
      totalEarned: 0,
      status: 'active'
    };

    // record invest transaction
    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'invest',
      amount: plan.price,
      status: 'completed',
      date: new Date().toLocaleString()
    };

    setActivePlans(prev => [...prev, newActivePlan]);
    setTransactions(prev => [newTx, ...prev]);
    
    // Check if user was referred by someone to distribute 20% commission!
    let updatedUserBalance = user.balance - plan.price;
    if (user.referredBy) {
      const users: User[] = JSON.parse(localStorage.getItem('projectx_users') || '[]');
      const referrer = users.find(u => u.referralCode === user.referredBy);
      if (referrer) {
        const commission = Number((plan.price * 0.20).toFixed(2));
        referrer.balance = Number((referrer.balance + commission).toFixed(2));
        referrer.totalProfit = Number((referrer.totalProfit + commission).toFixed(2));
        
        // Save referrer transaction
        const refTx: Transaction = {
          id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          type: 'referral',
          amount: commission,
          status: 'completed',
          date: new Date().toLocaleString(),
          txHash: `Commission from PX-${user.email.substring(0, 3)}...`
        };

        // Persist referrer
        const updatedUsers = users.map(u => u.id === referrer.id ? referrer : u);
        localStorage.setItem('projectx_users', JSON.stringify(updatedUsers));
        
        // If referrer is the logged in user, update current session
        if (referrer.id === user.id) {
          updatedUserBalance += commission;
        }
      }
    }

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: Number(updatedUserBalance.toFixed(2)),
        activeInvestments: Number((prev.activeInvestments + plan.price).toFixed(2))
      };
    });

    return { success: true };
  };

  const triggerMiningPayout = () => {
    if (!user || miningBalance <= 0) return;
    
    const payoutAmount = Number(miningBalance.toFixed(4));
    
    // Create profit payout transaction
    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'profit',
      amount: payoutAmount,
      status: 'completed',
      date: new Date().toLocaleString()
    };

    setTransactions(prev => [newTx, ...prev]);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: Number((prev.balance + payoutAmount).toFixed(2)),
        totalProfit: Number((prev.totalProfit + payoutAmount).toFixed(2))
      };
    });

    // Update the earned amount on active plans
    setActivePlans(prev => prev.map(p => {
      if (p.status === 'active') {
        return {
          ...p,
          totalEarned: Number((p.totalEarned + (payoutAmount / prev.length)).toFixed(4))
        };
      }
      return p;
    }));

    setMiningBalance(0);
  };

  const referrals = getReferrals();

  return (
    <AppContext.Provider value={{
      user,
      activePlans,
      transactions,
      stocks,
      selectedStock,
      setSelectedStock,
      language,
      setLanguage,
      register,
      verifyEmail,
      login,
      logout,
      deposit,
      withdraw,
      buyPlan,
      miningActive,
      setMiningActive,
      miningBalance,
      triggerMiningPayout,
      referrals
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
