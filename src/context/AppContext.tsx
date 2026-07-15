import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ActivePlan, Transaction, StockData, Plan } from '../types';
import { INITIAL_STOCKS, updateStockPrices, PLANS } from '../utils/data';
import { createOxaPayInvoice, checkOxaPayPayment } from '../utils/oxapay';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  increment
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { checkAndVerifyUserReferralState } from '../utils/referral';

interface AppContextType {
  user: User | null;
  activePlans: ActivePlan[];
  transactions: Transaction[];
  stocks: StockData[];
  selectedStock: StockData;
  setSelectedStock: (stock: StockData) => void;
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  register: (
    email: string, 
    password?: string, 
    referralCode?: string,
    firstName?: string,
    lastName?: string,
    username?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deposit: (amount: number, method: string) => Promise<{ success: boolean; trackId?: string; paymentUrl?: string; error?: string }>;
  withdraw: (amount: number, address: string) => Promise<{ success: boolean; error?: string }>;
  buyPlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  miningActive: boolean;
  setMiningActive: (active: boolean) => void;
  miningBalance: number;
  triggerMiningPayout: () => Promise<void>;
  referrals: { email: string; date: string; bonus: number }[];
  maintenanceMode: boolean;
  plans: Plan[];
  oxapayApiKey: string;
  oxapayPayoutApiKey: string;
  updateOxapayApiKey: (newKey: string) => Promise<void>;
  updateOxapayPayoutApiKey: (newKey: string) => Promise<void>;
  verifyDeposit: (trackId: string) => Promise<{ success: boolean; message: string; amount?: number }>;
  minWithdrawal: number;
  maxWithdrawal: number;
  monthlyWithdrawalLimit: number;
  dailyWithdrawalLimit: number;
  updateWithdrawalLimits: (minW: number, maxW: number, monthlyW: number, dailyW: number) => Promise<void>;
  referralCommissionRate: number;
  updateReferralCommissionRate: (rate: number) => Promise<void>;
  withdrawalsEnabled: boolean;
  updateWithdrawalsEnabled: (enabled: boolean) => Promise<void>;
  referralCommFirstDeposit: number;
  referralCommSubsequentDeposit: number;
  updateReferralCommRates: (first: number, subsequent: number) => Promise<void>;
  placeOtcTrade: (amount: number, side: 'buy' | 'sell', durationSeconds?: number, entryPrice?: number) => Promise<{ success: boolean; error?: string; txId?: string; targetWon?: boolean; startTime?: number }>;
  resolveOtcTrade: (roundIdOrTradeId: string | number, isDurationTrade?: boolean, wonOverride?: boolean, finalPrice?: number) => Promise<{ success: boolean; outcome?: 'buy' | 'sell'; won?: boolean; refund?: boolean }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockData>(INITIAL_STOCKS[0]);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [referrals, setReferrals] = useState<{ email: string; date: string; bonus: number }[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [oxapayApiKey, setOxapayApiKey] = useState<string>('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
  const [oxapayPayoutApiKey, setOxapayPayoutApiKey] = useState<string>('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
  const [minWithdrawal, setMinWithdrawal] = useState<number>(5.00);
  const [maxWithdrawal, setMaxWithdrawal] = useState<number>(1000.00);
  const [monthlyWithdrawalLimit, setMonthlyWithdrawalLimit] = useState<number>(5000.00);
  const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState<number>(1000.00);
  const [referralCommissionRate, setReferralCommissionRate] = useState<number>(20);
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState<boolean>(true);
  const [referralCommFirstDeposit, setReferralCommFirstDeposit] = useState<number>(20);
  const [referralCommSubsequentDeposit, setReferralCommSubsequentDeposit] = useState<number>(20);

  // Mining simulation states
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningBalance, setMiningBalance] = useState<number>(0);
  const [hasInitializedMining, setHasInitializedMining] = useState<boolean>(false);

  // Helper to retrieve live plan daily profit (averaging min/max or using admin value if equal)
  const getLiveDailyProfit = (ap: ActivePlan, masterPlans: Plan[]) => {
    const master = masterPlans.find(mp => mp.id === ap.planId);
    if (master) {
      return master.minProfit === master.maxProfit 
        ? master.minProfit 
        : (master.minProfit + master.maxProfit) / 2;
    }
    return ap.dailyProfit;
  };

  // Calculate offline accumulated profit down to the exact second
  const calculateInitialMiningBalance = (plansList: ActivePlan[], masterPlans: Plan[]) => {
    let accumulated = 0;
    const now = new Date();
    plansList.forEach(p => {
      if (p.status === 'active') {
        const lastCollected = p.lastCollectedAt ? new Date(p.lastCollectedAt) : new Date(p.startDate);
        const limitDate = new Date(p.endDate) < now ? new Date(p.endDate) : now;
        const elapsedMs = limitDate.getTime() - lastCollected.getTime();
        const elapsedSeconds = Math.max(0, elapsedMs / 1000);
        if (elapsedSeconds > 0) {
          const liveDaily = getLiveDailyProfit(p, masterPlans);
          accumulated += (liveDaily / 86400) * elapsedSeconds;
        }
      }
    });
    return accumulated;
  };

  // Sync Global Settings
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(settingsRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMaintenanceMode(!!data.maintenanceMode);
        
        // Sync Merchant Key
        if (data.oxapayApiKey) {
          if (data.oxapayApiKey === '9RXYOI-HCC0E7-MIMCXS-XKUCYW' || !data.oxapayApiKey) {
            try {
              await setDoc(settingsRef, { oxapayApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD' }, { merge: true });
            } catch (e) {
              console.error('Failed to auto-upgrade OxaPay key in firestore', e);
            }
            setOxapayApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
          } else {
            setOxapayApiKey(data.oxapayApiKey);
          }
        } else {
          try {
            await setDoc(settingsRef, { oxapayApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD' }, { merge: true });
          } catch (e) {
            console.error('Failed to seed OxaPay key', e);
          }
          setOxapayApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        }

        // Sync Payout Key
        if (data.oxapayPayoutApiKey) {
          setOxapayPayoutApiKey(data.oxapayPayoutApiKey);
        } else {
          try {
            await setDoc(settingsRef, { oxapayPayoutApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD' }, { merge: true });
          } catch (e) {
            console.error('Failed to seed OxaPay payout key', e);
          }
          setOxapayPayoutApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        }

        // Sync limits
        const parseLimitValue = (val: any, fallback: number): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const num = parseFloat(val);
            return isNaN(num) ? fallback : num;
          }
          return fallback;
        };

        setMinWithdrawal(parseLimitValue(data.minWithdrawal, 5.00));
        setMaxWithdrawal(parseLimitValue(data.maxWithdrawal, 1000.00));
        setMonthlyWithdrawalLimit(parseLimitValue(data.monthlyWithdrawalLimit, 5000.00));
        setDailyWithdrawalLimit(parseLimitValue(data.dailyWithdrawalLimit, 1000.00));
        setReferralCommissionRate(parseLimitValue(data.referralCommissionRate, 20));
        setWithdrawalsEnabled(data.withdrawalsEnabled !== false);
        setReferralCommFirstDeposit(parseLimitValue(data.referralCommFirstDeposit, 20));
        setReferralCommSubsequentDeposit(parseLimitValue(data.referralCommSubsequentDeposit, 20));
      } else {
        // Create settings doc if it does not exist
        try {
          await setDoc(settingsRef, { 
            oxapayApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD', 
            oxapayPayoutApiKey: 'HLSOHL-M4XCBM-MXMW4B-0BD5YD', 
            maintenanceMode: false,
            withdrawalsEnabled: true,
            minWithdrawal: 5.00,
            maxWithdrawal: 1000.00,
            monthlyWithdrawalLimit: 5000.00,
            dailyWithdrawalLimit: 1000.00,
            referralCommissionRate: 20,
            referralCommFirstDeposit: 20,
            referralCommSubsequentDeposit: 20
          });
        } catch (e) {
          console.error('Failed to create global settings doc', e);
        }
        setOxapayApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        setOxapayPayoutApiKey('HLSOHL-M4XCBM-MXMW4B-0BD5YD');
        setMinWithdrawal(5.00);
        setMaxWithdrawal(1000.00);
        setMonthlyWithdrawalLimit(5000.00);
        setDailyWithdrawalLimit(1000.00);
        setReferralCommissionRate(20);
        setReferralCommFirstDeposit(20);
        setReferralCommSubsequentDeposit(20);
        setWithdrawalsEnabled(true);
      }
    }, (err) => {
      console.error('Error listening to global config:', err);
    });
    return () => unsubscribe();
  }, []);

  // Sync Investment Plans with seeding on empty
  useEffect(() => {
    const plansRef = collection(db, 'plans');
    const unsubscribe = onSnapshot(plansRef, async (snap) => {
      if (snap.empty) {
        // Seed default plans if collection is empty
        try {
          for (const p of PLANS) {
            await setDoc(doc(db, 'plans', p.id), p);
          }
        } catch (err) {
          console.error('Error seeding plans:', err);
        }
      } else {
        const list = snap.docs.map(d => d.data() as Plan);
        // Sort by ID or price
        list.sort((a, b) => Number(a.id) - Number(b.id) || a.price - b.price);
        setPlans(list);
      }
    }, (err) => {
      console.error('Error listening to plans:', err);
    });
    return () => unsubscribe();
  }, []);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      const customUid = localStorage.getItem('dodooge_custom_user_id');
      
      if (customUid) {
        try {
          const userDocRef = doc(db, 'users', customUid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (userData.isBanned) {
              setUser(null);
              setActivePlans([]);
              setTransactions([]);
              setHasInitializedMining(false);
              localStorage.removeItem('dodooge_custom_user_id');
              return;
            }
            setUser(userData);

            const plansSnap = await getDocs(collection(db, 'users', customUid, 'activePlans'));
            const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
            setActivePlans(plansList);

            const txsSnap = await getDocs(collection(db, 'users', customUid, 'transactions'));
            const txsList = txsSnap.docs.map(d => d.data() as Transaction);
            setTransactions(txsList);
            return;
          }
        } catch (e) {
          console.error("Custom user loading error:", e);
        }
      }

      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (userData.isBanned) {
              await signOut(auth);
              setUser(null);
              setActivePlans([]);
              setTransactions([]);
              setHasInitializedMining(false);
              alert("Your account has been banned by the Administrator.");
              return;
            }
            // Synchronize verification in Firestore if it was false
            if (!userData.isVerified) {
              await updateDoc(userDocRef, { isVerified: true });
              userData.isVerified = true;
            }
            setUser(userData);

            // Load plans and transactions from user's subcollections
            const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
            const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
            setActivePlans(plansList);

            const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
            const txsList = txsSnap.docs.map(d => d.data() as Transaction);
            setTransactions(txsList);
          } else {
            // If Auth user exists but Firestore user is missing, initialize profile
            const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const newUser: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              isVerified: true,
              balance: 0,
              activeInvestments: 0,
              totalProfit: 0,
              referralCode: refCode,
              referredBy: localStorage.getItem('dodooge_pending_referral') || null,
              referralsCount: 0,
              createdAt: new Date().toISOString(),
              firstName: fbUser.displayName ? fbUser.displayName.split(' ')[0] : '',
              lastName: fbUser.displayName ? fbUser.displayName.split(' ').slice(1).join(' ') : '',
              username: (fbUser.email || '').split('@')[0] + Math.floor(Math.random() * 1000),
              phone: ''
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            setActivePlans([]);
            setTransactions([]);
            setHasInitializedMining(false);
          }
        } catch (error) {
          console.error("Error fetching verified profile:", error);
        }
      } else {
        setUser(null);
        setActivePlans([]);
        setTransactions([]);
        setHasInitializedMining(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch referrals
  useEffect(() => {
    if (user) {
      const fetchReferrals = async () => {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referredBy', '==', user.referralCode));
          const querySnap = await getDocs(q);
          const refs = querySnap.docs.map(doc => {
            const d = doc.data();
            return {
              email: d.email,
              date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
              bonus: 2.0
            };
          });
          setReferrals(refs);
        } catch (error) {
          console.error("Error fetching referrals:", error);
        }
      };
      fetchReferrals();
    } else {
      setReferrals([]);
    }
  }, [user]);

  // Load and sync stocks update
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => {
        const next = updateStockPrices(prev);
        const found = next.find(s => s.symbol === selectedStock.symbol);
        if (found) setSelectedStock(found);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Synchronize offline mining balance when activePlans and master plans load
  useEffect(() => {
    if (user && activePlans.length > 0 && plans.length > 0 && !hasInitializedMining) {
      const offlineProfit = calculateInitialMiningBalance(activePlans, plans);
      setMiningBalance(offlineProfit);
      setHasInitializedMining(true);
    }
  }, [activePlans, plans, user, hasInitializedMining]);

  // Automatically activate mining if there is any active plan
  useEffect(() => {
    const hasActive = activePlans.some(p => p.status === 'active' && new Date(p.endDate) > new Date());
    if (hasActive) {
      setMiningActive(true);
    } else {
      setMiningActive(false);
    }
  }, [activePlans]);

  // Auto-expire plans whose lock time has passed
  useEffect(() => {
    if (!user || activePlans.length === 0) return;
    
    const checkExpiredPlans = async () => {
      const now = new Date();
      const expiredPlansToUpdate = activePlans.filter(p => p.status === 'active' && new Date(p.endDate) <= now);
      
      if (expiredPlansToUpdate.length > 0) {
        try {
          let investmentsToSubtract = 0;
          
          for (const p of expiredPlansToUpdate) {
            // Update status to 'expired' in user's activePlans subcollection
            const planDocRef = doc(db, 'users', user.id, 'activePlans', p.id);
            await updateDoc(planDocRef, { status: 'expired' });
            investmentsToSubtract += p.price;
          }
          
          // Decrement activeInvestments from user profile
          const userDocRef = doc(db, 'users', user.id);
          const newActiveInvestments = Math.max(0, Number((user.activeInvestments - investmentsToSubtract).toFixed(2)));
          await updateDoc(userDocRef, { activeInvestments: newActiveInvestments });
          
          // Update local state
          setActivePlans(prev => prev.map(p => {
            if (expiredPlansToUpdate.some(ep => ep.id === p.id)) {
              return { ...p, status: 'expired' };
            }
            return p;
          }));
          
          setUser(prev => prev ? { ...prev, activeInvestments: newActiveInvestments } : null);
          console.log(`Auto-expired ${expiredPlansToUpdate.length} plans. Subtracted $${investmentsToSubtract} from activeInvestments.`);
        } catch (e) {
          console.error("Error auto-expiring plans:", e);
        }
      }
    };
    
    checkExpiredPlans();
    const interval = setInterval(checkExpiredPlans, 10000);
    return () => clearInterval(interval);
  }, [user, activePlans]);

  // Run auto accumulation of plan profits
  useEffect(() => {
    if (!user || activePlans.length === 0) return;

    const interval = setInterval(() => {
      if (miningActive) {
        const totalDailyProfit = activePlans
          .filter(p => p.status === 'active' && new Date(p.endDate) > new Date())
          .reduce((sum, p) => sum + getLiveDailyProfit(p, plans), 0);
        // Make the simulation run at exact 24-hour speed rate as requested
        const tickProfit = totalDailyProfit / 86400; 
        setMiningBalance(prev => prev + tickProfit);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, activePlans, miningActive, plans]);

  const register = async (
    email: string, 
    password?: string, 
    referralCode?: string,
    firstName?: string,
    lastName?: string,
    username?: string,
    phone?: string
  ) => {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (!firstName || !firstName.trim()) {
        return { success: false, error: 'First name is required.' };
      }
      if (!lastName || !lastName.trim()) {
        return { success: false, error: 'Last name is required.' };
      }
      if (!username || !username.trim()) {
        return { success: false, error: 'Username is required.' };
      }
      
      const cleanUsername = username.trim().toLowerCase();
      // Check username uniqueness in Firestore
      const usersRef = collection(db, 'users');
      const qUsername = query(usersRef, where('username', '==', cleanUsername));
      const usernameSnap = await getDocs(qUsername);
      if (!usernameSnap.empty) {
        return { success: false, error: 'Username already exists. Please choose a different unique username.' };
      }

      const emailLower = email.trim().toLowerCase();
      if (!emailLower.endsWith('@gmail.com')) {
        return { success: false, error: 'Only @gmail.com email addresses are permitted. Temporary and other email domains are strictly prohibited.' };
      }

      let fbUser: { uid: string };
      let usedCustomFallback = false;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = { uid: userCred.user.uid };
      } catch (authErr: any) {
        console.warn("Firebase auth registration failed, trying custom Firestore fallback:", authErr);
        if (authErr.code === 'auth/email-already-in-use') {
          return { success: false, error: 'This email address is already in use.' };
        }
        if (authErr.code === 'auth/weak-password') {
          return { success: false, error: 'Password is too weak. Please use at least 6 characters.' };
        }

        // Verify email uniqueness in Firestore manually to prevent duplicates
        const emailQuery = query(usersRef, where('email', '==', emailLower));
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) {
          return { success: false, error: 'This email address is already in use.' };
        }

        const customId = 'usr_' + Math.random().toString(36).substring(2, 15);
        fbUser = { uid: customId };
        usedCustomFallback = true;
      }

      const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Check if referral code is valid
      let referredBy: string | null = null;
      const finalReferralCode = referralCode || localStorage.getItem('dodooge_pending_referral') || null;

      if (finalReferralCode) {
        const q = query(usersRef, where('referralCode', '==', finalReferralCode));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          referredBy = finalReferralCode;
          const referrerDoc = querySnap.docs[0];
          const referrerData = referrerDoc.data();
          const newCount = (referrerData.referralsCount || 0) + 1;
          await updateDoc(referrerDoc.ref, { referralsCount: newCount });
        }
      }

      const newUser: User = {
        id: fbUser.uid,
        email: email.toLowerCase(),
        isVerified: true,
        balance: 0,
        activeInvestments: 0,
        totalProfit: 0,
        referralCode: refCode,
        referredBy,
        referralsCount: 0,
        createdAt: new Date().toISOString(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: cleanUsername,
        phone: phone ? phone.trim() : '',
        password: password
      };

      // Set user profile in Firestore
      await setDoc(doc(db, 'users', fbUser.uid), newUser);
      setUser(newUser);

      // Save custom user ID so we can bypass Auth completely on reload
      localStorage.setItem('dodooge_custom_user_id', fbUser.uid);

      // Clean pending referral
      localStorage.removeItem('dodooge_pending_referral');

      return { success: true };
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email address is already in use.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password is too weak. Please use at least 6 characters.';
      }
      return { success: false, error: friendlyError };
    }
  };

  const verifyEmail = () => {
    if (user) {
      setUser(prev => prev ? { ...prev, isVerified: true } : null);
    }
  };

  const login = async (email: string, password?: string) => {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      const emailLower = email.trim().toLowerCase();
      
      // Look up user in Firestore first to check if they have a custom password set by Admin
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', emailLower));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        const userData = userDoc.data() as User;
        
        if (userData.password && userData.password === password) {
          if (userData.isBanned) {
            return { success: false, error: 'Your account has been banned by the Administrator.' };
          }
          
          try {
            await signOut(auth);
          } catch (e) {
            // ignore
          }
          
          setUser(userData);
          localStorage.setItem('dodooge_custom_user_id', userData.id);
          
          const plansSnap = await getDocs(collection(db, 'users', userData.id, 'activePlans'));
          const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
          setActivePlans(plansList);

          const txsSnap = await getDocs(collection(db, 'users', userData.id, 'transactions'));
          const txsList = txsSnap.docs.map(d => d.data() as Transaction);
          setTransactions(txsList);
          
          return { success: true };
        }
      }

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;

      // Load profile
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        if (userData.isBanned) {
          await signOut(auth);
          setUser(null);
          return { success: false, error: 'Your account has been banned by the Administrator.' };
        }
        if (!userData.isVerified) {
          await updateDoc(userDocRef, { isVerified: true });
          userData.isVerified = true;
        }
        
        // Save the registered password in Firestore if it was missing
        if (!userData.password && password) {
          await updateDoc(userDocRef, { password: password });
          userData.password = password;
        }
        
        setUser(userData);
        localStorage.setItem('dodooge_custom_user_id', fbUser.uid);

        const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
        const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
        setActivePlans(plansList);

        const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
        const txsList = txsSnap.docs.map(d => d.data() as Transaction);
        setTransactions(txsList);
      }
      return { success: true };
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid email or password credentials.';
      }
      return { success: false, error: friendlyError };
    }
  };

  const loginWithGoogle = async (referralCode?: string) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const fbUser = userCred.user;

      const emailLower = (fbUser.email || '').toLowerCase();
      if (!emailLower.endsWith('@gmail.com')) {
        await auth.signOut();
        return { success: false, error: 'Only @gmail.com email addresses are permitted. Temporary and other email domains are strictly prohibited.' };
      }

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Check if referral code is valid
        let referredBy: string | null = null;
        const finalReferralCode = referralCode || localStorage.getItem('dodooge_pending_referral') || null;

        if (finalReferralCode) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referralCode', '==', finalReferralCode));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            referredBy = finalReferralCode;
            const referrerDoc = querySnap.docs[0];
            const referrerData = referrerDoc.data();
            const newCount = (referrerData.referralsCount || 0) + 1;
            await updateDoc(referrerDoc.ref, { referralsCount: newCount });
          }
        }

        const newUser: User = {
          id: fbUser.uid,
          email: (fbUser.email || '').toLowerCase(),
          isVerified: true,
          balance: 0,
          activeInvestments: 0,
          totalProfit: 0,
          referralCode: refCode,
          referredBy,
          referralsCount: 0,
          createdAt: new Date().toISOString(),
          firstName: fbUser.displayName ? fbUser.displayName.split(' ')[0] : '',
          lastName: fbUser.displayName ? fbUser.displayName.split(' ').slice(1).join(' ') : '',
          username: (fbUser.email || '').split('@')[0] + Math.floor(Math.random() * 1000),
          phone: ''
        };

        // Set user profile in Firestore
        await setDoc(userDocRef, newUser);
        setUser(newUser);
        setActivePlans([]);
        setTransactions([]);
        localStorage.setItem('dodooge_custom_user_id', fbUser.uid);
      } else {
        const userData = userSnap.data() as User;
        if (userData.isBanned) {
          await signOut(auth);
          setUser(null);
          return { success: false, error: 'Your account has been banned by the Administrator.' };
        }
        if (!userData.isVerified) {
          await updateDoc(userDocRef, { isVerified: true });
          userData.isVerified = true;
        }
        setUser(userData);
        localStorage.setItem('dodooge_custom_user_id', fbUser.uid);

        const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
        const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
        setActivePlans(plansList);

        const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
        const txsList = txsSnap.docs.map(d => d.data() as Transaction);
        setTransactions(txsList);
      }

      // Clean pending referral
      localStorage.removeItem('dodooge_pending_referral');

      return { success: true };
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      let friendlyError = err.message;
      if (err.code === 'auth/popup-blocked') {
        friendlyError = 'Pop-up blocked. Please enable pop-ups for this site to sign in with Google.';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyError = 'This domain is not authorized in your Firebase console. Please add it to the authorized domains list.';
      }
      return { success: false, error: friendlyError };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActivePlans([]);
      setTransactions([]);
      setMiningActive(false);
      setMiningBalance(0);
      localStorage.removeItem('dodooge_custom_user_id');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const deposit = async (amount: number, method: string): Promise<{ success: boolean; trackId?: string; paymentUrl?: string; error?: string }> => {
    if (!user) return { success: false, error: 'User session not found' };

    try {
      const res = await createOxaPayInvoice(oxapayApiKey, amount, user.id);
      if (!res.success) {
        return { success: false, error: res.error };
      }

      const newTx: Transaction = {
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        type: 'deposit',
        amount,
        status: 'pending',
        date: new Date().toLocaleString(),
        trackId: res.trackId,
        paymentUrl: res.paymentUrl
      };

      // Save pending transaction to user's transactions subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      // Sync state
      setTransactions(prev => [newTx, ...prev]);

      return {
        success: true,
        trackId: res.trackId,
        paymentUrl: res.paymentUrl
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during deposit initialization' };
    }
  };

  const handleReferralRewardOnDeposit = async (depositorId: string, depositorEmail: string, referredByCode: string, depositAmount: number, currentTxId: string) => {
    try {
      if (!referredByCode) return;

      // Find referrer
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referredByCode));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const referrerDoc = querySnap.docs[0];
        const referrerData = referrerDoc.data() as User;

        // Determine if this is the first deposit
        const txsRef = collection(db, 'users', depositorId, 'transactions');
        const txsSnap = await getDocs(txsRef);
        const completedDeposits = txsSnap.docs
          .map(d => d.data() as Transaction)
          .filter(t => t.type === 'deposit' && t.status === 'completed' && t.id !== currentTxId);

        const isFirstDeposit = completedDeposits.length === 0;
        const rate = isFirstDeposit ? referralCommFirstDeposit : referralCommSubsequentDeposit;
        const commission = Number((depositAmount * (rate / 100)).toFixed(2));

        if (commission <= 0) return;

        const newRefBalance = Number((referrerData.balance + commission).toFixed(2));
        const newRefProfit = Number((referrerData.totalProfit + commission).toFixed(2));

        // Update referrer doc
        await updateDoc(referrerDoc.ref, {
          balance: newRefBalance,
          totalProfit: newRefProfit
        });

        // Register transaction for referrer
        const refTx: Transaction = {
          id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          type: 'referral',
          amount: commission,
          status: 'completed',
          date: new Date().toLocaleString(),
          txHash: `Commission (${rate}%) from user deposit (${depositorEmail})`
        };
        await setDoc(doc(db, 'users', referrerDoc.id, 'transactions', refTx.id), refTx);

        console.log(`Referral reward processed: ${rate}% ($${commission} USDT) credited to referrer ${referrerData.email}`);
      }
    } catch (err) {
      console.error('Error handling referral reward on deposit:', err);
    }
  };

  const verifyDeposit = async (trackId: string): Promise<{ success: boolean; message: string; amount?: number }> => {
    if (!user) return { success: false, message: 'User session not found' };

    try {
      const checkRes = await checkOxaPayPayment(oxapayApiKey, trackId);
      if (checkRes.success && (checkRes.status.toLowerCase() === 'paid' || checkRes.status.toLowerCase() === 'confirming' || checkRes.status.toLowerCase() === 'completed' || checkRes.status.toLowerCase() === 'success')) {
        // Find the transaction with this trackId
        const pendingTx = transactions.find(t => t.trackId === trackId && t.type === 'deposit');
        if (!pendingTx) {
          return { success: false, message: 'Transaction record not found in history' };
        }

        if (pendingTx.status === 'completed') {
          return { success: true, message: 'This deposit has already been verified and credited!', amount: pendingTx.amount };
        }

        const depositAmount = pendingTx.amount;

        // 1. Update the transaction status in Firestore
        const txDocRef = doc(db, 'users', user.id, 'transactions', pendingTx.id);
        await updateDoc(txDocRef, { status: 'completed' });

        // 2. Update the user balance in Firestore
        const newBalance = Number((user.balance + depositAmount).toFixed(2));
        await updateDoc(doc(db, 'users', user.id), { balance: newBalance });

        // Also update total platform balance in settings/global
        try {
          await updateDoc(doc(db, 'settings', 'global'), {
            totalPlatformBalance: increment(depositAmount)
          });
        } catch (settingsErr) {
          console.error('Failed to update global totalPlatformBalance:', settingsErr);
        }

        // 3. Update local state
        setTransactions(prev => prev.map(t => t.id === pendingTx.id ? { ...t, status: 'completed' as const } : t));
        setUser(prev => prev ? { ...prev, balance: newBalance } : null);

        // 4. Process Referral Bonus (Under new rules, referrer only gets 20% commission upon plan purchase, not on deposit. Also, user is verified/counted only when purchasing a plan.)
        if (user.referredBy) {
          // Check and verify user referral status in case they already have an active plan
          checkAndVerifyUserReferralState(user.id, user.referredBy).catch(console.error);
        }

        return { success: true, message: `Deposit of $${depositAmount} USDT successfully verified and credited!`, amount: depositAmount };
      } else {
        const currentStatus = checkRes.status || 'PENDING';
        return { success: false, message: `Payment status is ${currentStatus.toUpperCase()}. Please complete the payment first.` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to verify transaction' };
    }
  };

  const updateOxapayApiKey = async (newKey: string) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { oxapayApiKey: newKey }, { merge: true });
      setOxapayApiKey(newKey);
    } catch (err) {
      console.error('Error updating OxaPay Key:', err);
      throw err;
    }
  };

  const updateOxapayPayoutApiKey = async (newKey: string) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { oxapayPayoutApiKey: newKey }, { merge: true });
      setOxapayPayoutApiKey(newKey);
    } catch (err) {
      console.error('Error updating OxaPay Payout Key:', err);
      throw err;
    }
  };

  const updateWithdrawalLimits = async (minW: number, maxW: number, monthlyW: number, dailyW: number) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { 
        minWithdrawal: minW, 
        maxWithdrawal: maxW, 
        monthlyWithdrawalLimit: monthlyW, 
        dailyWithdrawalLimit: dailyW 
      }, { merge: true });
      setMinWithdrawal(minW);
      setMaxWithdrawal(maxW);
      setMonthlyWithdrawalLimit(monthlyW);
      setDailyWithdrawalLimit(dailyW);
    } catch (err) {
      console.error('Error updating withdrawal limits:', err);
      throw err;
    }
  };

  const updateReferralCommissionRate = async (rate: number) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { referralCommissionRate: rate }, { merge: true });
      setReferralCommissionRate(rate);
    } catch (err) {
      console.error('Error updating referral commission rate:', err);
      throw err;
    }
  };

  const updateReferralCommRates = async (first: number, subsequent: number) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { 
        referralCommFirstDeposit: first, 
        referralCommSubsequentDeposit: subsequent 
      }, { merge: true });
      setReferralCommFirstDeposit(first);
      setReferralCommSubsequentDeposit(subsequent);
    } catch (err) {
      console.error('Error updating referral commission rates:', err);
      throw err;
    }
  };

  const updateWithdrawalsEnabled = async (enabled: boolean) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, { withdrawalsEnabled: enabled }, { merge: true });
      setWithdrawalsEnabled(enabled);
    } catch (err) {
      console.error('Error updating withdrawals enabled:', err);
      throw err;
    }
  };

  const withdraw = async (amount: number, address: string) => {
    if (!user) return { success: false, error: 'User session not found' };
    
    if (!withdrawalsEnabled) {
      return { success: false, error: 'Withdrawal gateway is currently offline for system maintenance. Please try again later.' };
    }

    if (user.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const fee = 0.25;
    const netAmount = Number((amount - fee).toFixed(2));
    if (netAmount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than the $0.25 USDT fee.' };
    }

    // Validate limits
    const getTxTime = (tx: Transaction): number => {
      if (tx.timestamp) return tx.timestamp;
      try {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) return d.getTime();
      } catch (e) {
        // ignore
      }
      return 0;
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const withdraws = transactions.filter(t => t.type === 'withdraw' && t.status !== 'rejected');

    const dailyTotal = withdraws
      .filter(t => getTxTime(t) >= startOfToday)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyTotal = withdraws
      .filter(t => getTxTime(t) >= startOfThisMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    if (amount < minWithdrawal) {
      return { success: false, error: `Minimum withdrawal quantity allowed is $${minWithdrawal.toFixed(2)} USDT` };
    }

    if (amount > maxWithdrawal) {
      return { success: false, error: `Maximum withdrawal quantity allowed is $${maxWithdrawal.toFixed(2)} USDT per transaction` };
    }

    if (dailyTotal + amount > dailyWithdrawalLimit) {
      return { 
        success: false, 
        error: `This withdrawal would exceed your daily withdrawal limit of $${dailyWithdrawalLimit.toFixed(2)} USDT. You have already withdrawn $${dailyTotal.toFixed(2)} USDT today. Remaining: $${Math.max(0, dailyWithdrawalLimit - dailyTotal).toFixed(2)} USDT.` 
      };
    }

    if (monthlyTotal + amount > monthlyWithdrawalLimit) {
      return { 
        success: false, 
        error: `This withdrawal would exceed your monthly withdrawal limit of $${monthlyWithdrawalLimit.toFixed(2)} USDT. You have already withdrawn $${monthlyTotal.toFixed(2)} USDT this month. Remaining: $${Math.max(0, monthlyWithdrawalLimit - monthlyTotal).toFixed(2)} USDT.` 
      };
    }

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'withdraw',
      amount, // Total gross amount deducted from user balance
      status: 'pending',
      date: new Date().toLocaleString(),
      txHash: address,
      address: address, // Set both so legacy and new structures read it
      fee,
      netAmount,
      timestamp: Date.now()
    };

    try {
      // Save transaction to subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      // Update balance
      const newBalance = Number((user.balance - amount).toFixed(2));
      await updateDoc(doc(db, 'users', user.id), { balance: newBalance });

      // Synchronize states
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? { ...prev, balance: newBalance } : null);

      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, error: 'Withdrawal failed. Database connection error.' };
    }
  };

  const buyPlan = async (planId: string) => {
    if (!user) return { success: false, error: 'User not logged in' };
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };

    const hasSamePlanActive = activePlans.some(p => p.planId === planId && p.status === 'active' && new Date(p.endDate) > new Date());
    if (hasSamePlanActive) {
      return { success: false, error: 'You already have an active contract for this plan. You cannot buy the same plan again until it expires.' };
    }

    if (user.balance < plan.price) {
      return { success: false, error: 'Insufficient balance to purchase this plan. Please deposit more funds first.' };
    }

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

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'invest',
      amount: plan.price,
      status: 'completed',
      date: new Date().toLocaleString()
    };

    try {
      const userDocRef = doc(db, 'users', user.id);

      // Save plan to subcollection
      const planDocRef = doc(db, 'users', user.id, 'activePlans', newActivePlan.id);
      await setDoc(planDocRef, newActivePlan);

      // Save transaction to subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      let updatedUserBalance = user.balance - plan.price;
      let activeInvestmentsDelta = plan.price;

      // Handle 20% Instant Referral Commission
      if (user.referredBy) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', user.referredBy));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const referrerDoc = querySnap.docs[0];
          const referrerData = referrerDoc.data();
          const commRate = typeof referralCommissionRate === 'number' ? referralCommissionRate : 20;
          const commission = Number((plan.price * (commRate / 100)).toFixed(2));

          const newRefBalance = Number((referrerData.balance + commission).toFixed(2));
          const newRefProfit = Number((referrerData.totalProfit + commission).toFixed(2));

          await updateDoc(referrerDoc.ref, {
            balance: newRefBalance,
            totalProfit: newRefProfit
          });

          // Register transaction for referrer
          const refTx: Transaction = {
            id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
            type: 'referral',
            amount: commission,
            status: 'completed',
            date: new Date().toLocaleString(),
            txHash: `Commission (${commRate}%) from referral purchase of ${plan.name}`
          };
          await setDoc(doc(db, 'users', referrerDoc.id, 'transactions', refTx.id), refTx);

          if (referrerDoc.id === user.id) {
            updatedUserBalance += commission;
          }
        }
      }

      const finalBalance = Number(updatedUserBalance.toFixed(2));
      const finalInvestments = Number((user.activeInvestments + activeInvestmentsDelta).toFixed(2));

      await updateDoc(userDocRef, {
        balance: finalBalance,
        activeInvestments: finalInvestments
      });

      // Synchronize state
      setActivePlans(prev => [...prev, newActivePlan]);
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? {
        ...prev,
        balance: finalBalance,
        activeInvestments: finalInvestments
      } : null);

      // Verify referral status if user registered via a referral link
      if (user.referredBy) {
        checkAndVerifyUserReferralState(user.id, user.referredBy).catch(console.error);
      }

      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      return { success: false, error: 'Subscription failed. Database connection error.' };
    }
  };

  const triggerMiningPayout = async () => {
    if (!user || miningBalance <= 0) return;

    const payoutAmount = Number(miningBalance.toFixed(4));

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'profit',
      amount: payoutAmount,
      status: 'completed',
      date: new Date().toLocaleString()
    };

    try {
      const userDocRef = doc(db, 'users', user.id);

      // Save transaction to Firestore
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      const newBalance = Number((user.balance + payoutAmount).toFixed(2));
      const newProfit = Number((user.totalProfit + payoutAmount).toFixed(2));

      await updateDoc(userDocRef, {
        balance: newBalance,
        totalProfit: newProfit
      });

      // Update earned amount on active plans in database
      const updatedPlans = activePlans.map(p => {
        if (p.status === 'active') {
          return {
            ...p,
            totalEarned: Number((p.totalEarned + (payoutAmount / activePlans.length)).toFixed(4)),
            lastCollectedAt: new Date().toISOString()
          };
        }
        return p;
      });

      for (const p of updatedPlans) {
        const planDocRef = doc(db, 'users', user.id, 'activePlans', p.id);
        await updateDoc(planDocRef, { 
          totalEarned: p.totalEarned,
          lastCollectedAt: p.lastCollectedAt
        });
      }

      // Synchronize states
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? {
        ...prev,
        balance: newBalance,
        totalProfit: newProfit
      } : null);
      setActivePlans(updatedPlans);
      setMiningBalance(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const placeOtcTrade = async (
    amount: number,
    side: 'buy' | 'sell',
    durationSeconds?: number,
    entryPrice?: number
  ): Promise<{ success: boolean; error?: string; txId?: string; targetWon?: boolean; startTime?: number }> => {
    if (!user) {
      return { success: false, error: 'User session not found. Please log in first.' };
    }
    if (amount <= 0) {
      return { success: false, error: 'Trade amount must be greater than zero.' };
    }
    if (user.balance < amount) {
      return { success: false, error: 'Insufficient account balance.' };
    }

    try {
      const txId = 'TRD-' + Math.floor(100000 + Math.random() * 900000);
      const roundId = Math.floor(Date.now() / 60000);
      const targetWon = Math.random() < 0.5; // Determine win/lose target on placement
      const startTime = Date.now();

      // Deduct balance
      const newBalance = Number((user.balance - amount).toFixed(2));
      await updateDoc(doc(db, 'users', user.id), { balance: newBalance });

      // Save user transaction
      const newTx: Transaction = {
        id: txId,
        type: 'trade',
        amount: amount,
        status: 'pending',
        date: new Date().toLocaleString(),
        txHash: durationSeconds 
          ? `OTC TRADE (${side.toUpperCase()}) - ${durationSeconds}s @ $${entryPrice}`
          : `OTC TRADE (${side.toUpperCase()}) - Round #${roundId}`,
        timestamp: Date.now()
      };
      await setDoc(doc(db, 'users', user.id, 'transactions', txId), newTx);

      // Save global trade pool record
      await setDoc(doc(db, 'otc_trades', txId), {
        id: txId,
        userId: user.id,
        email: user.email,
        roundId: roundId,
        amount: amount,
        side: side,
        status: 'pending',
        createdAt: new Date().toISOString(),
        referredBy: user.referredBy || null,
        durationSeconds: durationSeconds || 60,
        entryPrice: entryPrice || 0,
        targetWon: targetWon,
        startTime: startTime
      });

      // Update states
      setUser(prev => prev ? { ...prev, balance: newBalance } : null);
      setTransactions(prev => [newTx, ...prev]);

      return { success: true, txId, targetWon, startTime };
    } catch (err: any) {
      console.error('Error placing OTC trade:', err);
      return { success: false, error: err.message || 'Failed to place trade.' };
    }
  };

  const resolveOtcTrade = async (
    roundIdOrTradeId: string | number,
    isDurationTrade: boolean = false,
    wonOverride?: boolean,
    finalPrice?: number
  ): Promise<{ success: boolean; outcome?: 'buy' | 'sell'; won?: boolean; refund?: boolean }> => {
    if (!user) return { success: false };

    try {
      let won = false;
      let refund = false;
      let finalBalance = user.balance;
      let tradeId = '';
      let tradeAmount = 0;
      let tradeSide: 'buy' | 'sell' = 'buy';
      let winningSide: 'buy' | 'sell' = 'buy';
      let entryPrice = 0;

      if (isDurationTrade) {
        // Resolve a dynamic duration trade
        tradeId = String(roundIdOrTradeId);
        const tradeRef = doc(db, 'otc_trades', tradeId);
        const tradeSnap = await getDoc(tradeRef);
        if (!tradeSnap.exists()) {
          return { success: false };
        }
        const tradeData = tradeSnap.data();
        if (tradeData.status !== 'pending') {
          return { success: true, won: tradeData.won, outcome: tradeData.winningSide };
        }

        tradeAmount = Number(tradeData.amount);
        tradeSide = tradeData.side;
        entryPrice = Number(tradeData.entryPrice || 0);
        const exitPrice = finalPrice !== undefined ? finalPrice : entryPrice;

        if (wonOverride !== undefined) {
          won = wonOverride;
        } else {
          if (tradeData.targetWon !== undefined) {
            won = tradeData.targetWon;
          } else if (tradeSide === 'buy') {
            won = exitPrice > entryPrice;
          } else {
            won = exitPrice < entryPrice;
          }
        }

        winningSide = won ? tradeSide : (tradeSide === 'buy' ? 'sell' : 'buy');

        // Update trade status globally
        await updateDoc(tradeRef, { 
          status: 'completed', 
          winningSide, 
          won, 
          exitPrice 
        });

        if (won) {
          // Win! User gets back 100% of their trade amount plus 50% profit (total 150%)
          const payout = Number((tradeAmount * 1.5).toFixed(2));
          finalBalance = Number((finalBalance + payout).toFixed(2));

          // Update user balance in Firestore
          await updateDoc(doc(db, 'users', user.id), { balance: finalBalance });

          // Update transaction in user's subcollection
          await setDoc(doc(db, 'users', user.id, 'transactions', tradeId), {
            id: tradeId,
            type: 'trade',
            amount: tradeAmount,
            status: 'completed',
            date: new Date().toLocaleString(),
            txHash: `OTC TRADE WIN (+50% Profit) - ${tradeSide.toUpperCase()} @ $${entryPrice} (Exit: $${exitPrice})`,
            timestamp: Date.now()
          });

          // Write payout transaction record
          const winTxId = 'TRW-' + Math.floor(100000 + Math.random() * 900000);
          const winTx: Transaction = {
            id: winTxId,
            type: 'trade_win',
            amount: payout,
            status: 'completed',
            date: new Date().toLocaleString(),
            txHash: `OTC Win payout (+150% return) for trade ${tradeId}`,
            timestamp: Date.now()
          };
          await setDoc(doc(db, 'users', user.id, 'transactions', winTxId), winTx);
        } else {
          // Loss!
          // Check if referred by anyone to get 50% refund, else lose 100%
          const isReferred = !!user.referredBy;
          
          if (isReferred) {
            refund = true;
            const refundAmount = Number((tradeAmount * 0.5).toFixed(2));
            finalBalance = Number((finalBalance + refundAmount).toFixed(2));

            // Update user balance in Firestore
            await updateDoc(doc(db, 'users', user.id), { balance: finalBalance });

            // Update transaction
            await setDoc(doc(db, 'users', user.id, 'transactions', tradeId), {
              id: tradeId,
              type: 'trade',
              amount: tradeAmount,
              status: 'rejected', // lost
              date: new Date().toLocaleString(),
              txHash: `OTC TRADE LOSS (50% Refund Applied) - ${tradeSide.toUpperCase()} @ $${entryPrice} (Exit: $${exitPrice})`,
              timestamp: Date.now()
            });

            // Write refund transaction record
            const refTxId = 'TRR-' + Math.floor(100000 + Math.random() * 900000);
            const refundTx: Transaction = {
              id: refTxId,
              type: 'trade_refund',
              amount: refundAmount,
              status: 'completed',
              date: new Date().toLocaleString(),
              txHash: `Referral code refund (50%) for lost trade ${tradeId}`,
              timestamp: Date.now()
            };
            await setDoc(doc(db, 'users', user.id, 'transactions', refTxId), refundTx);
          } else {
            // No refund
            await setDoc(doc(db, 'users', user.id, 'transactions', tradeId), {
              id: tradeId,
              type: 'trade',
              amount: tradeAmount,
              status: 'rejected', // lost
              date: new Date().toLocaleString(),
              txHash: `OTC TRADE LOSS (0% Refund) - ${tradeSide.toUpperCase()} @ $${entryPrice} (Exit: $${exitPrice})`,
              timestamp: Date.now()
            });
          }
        }
      } else {
        // Old round-based resolution fallback
        const roundId = Number(roundIdOrTradeId);
        const roundDocRef = doc(db, 'otc_rounds', String(roundId));
        winningSide = 'buy';
        const roundSnap = await getDoc(roundDocRef);

        if (roundSnap.exists()) {
          winningSide = roundSnap.data().winningSide;
        } else {
          const tradesQuery = query(collection(db, 'otc_trades'), where('roundId', '==', roundId));
          const snap = await getDocs(tradesQuery);
          const roundTrades = snap.docs.map(d => d.data());

          let totalBuy = 0;
          let totalSell = 0;
          const uniqueUserIds = new Set<string>();

          roundTrades.forEach((t: any) => {
            uniqueUserIds.add(t.userId);
            if (t.side === 'buy') {
              totalBuy += Number(t.amount);
            } else if (t.side === 'sell') {
              totalSell += Number(t.amount);
            }
          });

          if (uniqueUserIds.size >= 2) {
            if (totalBuy > totalSell) {
              winningSide = 'sell';
            } else if (totalSell > totalBuy) {
              winningSide = 'buy';
            } else {
              winningSide = Math.random() < 0.5 ? 'buy' : 'sell';
            }
          } else {
            winningSide = Math.random() < 0.5 ? 'buy' : 'sell';
          }

          try {
            await setDoc(roundDocRef, {
              roundId: roundId,
              winningSide: winningSide,
              totalBuy,
              totalSell,
              uniqueUsersCount: uniqueUserIds.size,
              status: 'resolved',
              createdAt: new Date().toISOString()
            });
          } catch (setErr) {
            const collisionSnap = await getDoc(roundDocRef);
            if (collisionSnap.exists()) {
              winningSide = collisionSnap.data().winningSide;
            }
          }
        }

        const userTradeQuery = query(
          collection(db, 'otc_trades'), 
          where('roundId', '==', roundId), 
          where('userId', '==', user.id),
          where('status', '==', 'pending')
        );
        const userTradeSnap = await getDocs(userTradeQuery);
        
        if (userTradeSnap.empty) {
          return { success: true, outcome: winningSide };
        }

        for (const tradeDoc of userTradeSnap.docs) {
          const tradeData = tradeDoc.data();
          const tSide = tradeData.side;
          const tAmount = Number(tradeData.amount);
          tradeId = tradeDoc.id;

          await updateDoc(tradeDoc.ref, { status: 'completed', winningSide });

          if (tSide === winningSide) {
            won = true;
            const payout = Number((tAmount * 1.5).toFixed(2));
            finalBalance = Number((finalBalance + payout).toFixed(2));

            await updateDoc(doc(db, 'users', user.id), { balance: finalBalance });

            await setDoc(doc(db, 'users', user.id, 'transactions', tradeId), {
              id: tradeId,
              type: 'trade',
              amount: tAmount,
              status: 'completed',
              date: new Date().toLocaleString(),
              txHash: `OTC TRADE WIN (+50% Profit) - Round #${roundId}`,
              timestamp: Date.now()
            });

            const winTxId = 'TRW-' + Math.floor(100000 + Math.random() * 900000);
            const winTx: Transaction = {
              id: winTxId,
              type: 'trade_win',
              amount: payout,
              status: 'completed',
              date: new Date().toLocaleString(),
              txHash: `OTC Win payout (+150% return) for trade ${tradeId}`,
              timestamp: Date.now()
            };
            await setDoc(doc(db, 'users', user.id, 'transactions', winTxId), winTx);
          } else {
            const isReferred = !!user.referredBy;
            if (isReferred) {
              refund = true;
              const refundAmount = Number((tAmount * 0.5).toFixed(2));
              finalBalance = Number((finalBalance + refundAmount).toFixed(2));

              await updateDoc(doc(db, 'users', user.id), { balance: finalBalance });

              await setDoc(doc(db, 'users', user.id, 'transactions', tradeId), {
                id: tradeId,
                type: 'trade',
                amount: tAmount,
                status: 'rejected',
                date: new Date().toLocaleString(),
                txHash: `OTC TRADE LOSS (50% Refund Applied) - Round #${roundId}`,
                timestamp: Date.now()
              });

              const refTxId = 'TRR-' + Math.floor(100000 + Math.random() * 900000);
              const refundTx: Transaction = {
                id: refTxId,
                type: 'trade_refund',
                amount: refundAmount,
                status: 'completed',
                date: new Date().toLocaleString(),
                txHash: `Referral code refund (50%) for lost trade ${tradeId}`,
                timestamp: Date.now()
              };
              await setDoc(doc(db, 'users', user.id, 'transactions', refTxId), refundTx);
            } else {
              await setDoc(doc(db, 'users', user.id, 'transactions', tradeId), {
                id: tradeId,
                type: 'trade',
                amount: tAmount,
                status: 'rejected',
                date: new Date().toLocaleString(),
                txHash: `OTC TRADE LOSS (0% Refund) - Round #${roundId}`,
                timestamp: Date.now()
              });
            }
          }
        }
      }

      // Sync local user transactions state
      const txsSnap = await getDocs(collection(db, 'users', user.id, 'transactions'));
      const txsList = txsSnap.docs.map(d => d.data() as Transaction);
      
      setUser(prev => prev ? { ...prev, balance: finalBalance } : null);
      setTransactions(txsList);

      return { success: true, outcome: winningSide, won, refund };
    } catch (err) {
      console.error('Error resolving OTC trade:', err);
      return { success: false };
    }
  };

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
      loginWithGoogle,
      logout,
      deposit,
      withdraw,
      buyPlan,
      miningActive,
      setMiningActive,
      miningBalance,
      triggerMiningPayout,
      referrals,
      maintenanceMode,
      plans,
      oxapayApiKey,
      oxapayPayoutApiKey,
      updateOxapayApiKey,
      updateOxapayPayoutApiKey,
      verifyDeposit,
      minWithdrawal,
      maxWithdrawal,
      monthlyWithdrawalLimit,
      dailyWithdrawalLimit,
      updateWithdrawalLimits,
      referralCommissionRate,
      updateReferralCommissionRate,
      withdrawalsEnabled,
      updateWithdrawalsEnabled,
      referralCommFirstDeposit,
      referralCommSubsequentDeposit,
      updateReferralCommRates,
      placeOtcTrade,
      resolveOtcTrade
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
