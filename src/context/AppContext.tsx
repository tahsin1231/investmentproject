import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, ActivePlan, Transaction, StockData } from '../types';
import { INITIAL_STOCKS, updateStockPrices, PLANS } from '../utils/data';
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
  where 
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';

interface AppContextType {
  user: User | null;
  activePlans: ActivePlan[];
  transactions: Transaction[];
  stocks: StockData[];
  selectedStock: StockData;
  setSelectedStock: (stock: StockData) => void;
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  register: (email: string, password?: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deposit: (amount: number, method: string) => Promise<void>;
  withdraw: (amount: number, address: string) => Promise<{ success: boolean; error?: string }>;
  buyPlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  miningActive: boolean;
  setMiningActive: (active: boolean) => void;
  miningBalance: number;
  triggerMiningPayout: () => Promise<void>;
  referrals: { email: string; date: string; bonus: number }[];
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

  // Mining simulation states
  const [miningActive, setMiningActive] = useState<boolean>(false);
  const [miningBalance, setMiningBalance] = useState<number>(0);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
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
              referredBy: localStorage.getItem('doddoge_pending_referral') || null,
              referralsCount: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            setActivePlans([]);
            setTransactions([]);
          }
        } catch (error) {
          console.error("Error fetching verified profile:", error);
        }
      } else {
        setUser(null);
        setActivePlans([]);
        setTransactions([]);
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

  // Run auto accumulation of plan profits
  useEffect(() => {
    if (!user || activePlans.length === 0) return;

    const interval = setInterval(() => {
      if (miningActive) {
        const totalDailyProfit = activePlans.reduce((sum, p) => sum + p.dailyProfit, 0);
        // Make the simulation run 120x faster for user visual engagement
        const tickProfit = (totalDailyProfit / 86400) * 120; 
        setMiningBalance(prev => prev + tickProfit);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, activePlans, miningActive]);

  const register = async (email: string, password?: string, referralCode?: string) => {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;

      const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Check if referral code is valid
      let referredBy: string | null = null;
      const finalReferralCode = referralCode || localStorage.getItem('doddoge_pending_referral') || null;

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
        email: email.toLowerCase(),
        isVerified: true,
        balance: 0,
        activeInvestments: 0,
        totalProfit: 0,
        referralCode: refCode,
        referredBy,
        referralsCount: 0,
        createdAt: new Date().toISOString()
      };

      // Set user profile in Firestore
      await setDoc(doc(db, 'users', fbUser.uid), newUser);
      setUser(newUser);

      // Clean pending referral
      localStorage.removeItem('doddoge_pending_referral');

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
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCred.user;

      // Load profile
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        if (!userData.isVerified) {
          await updateDoc(userDocRef, { isVerified: true });
          userData.isVerified = true;
        }
        setUser(userData);

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

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const refCode = 'DOGE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Check if referral code is valid
        let referredBy: string | null = null;
        const finalReferralCode = referralCode || localStorage.getItem('doddoge_pending_referral') || null;

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
          createdAt: new Date().toISOString()
        };

        // Set user profile in Firestore
        await setDoc(userDocRef, newUser);
        setUser(newUser);
        setActivePlans([]);
        setTransactions([]);
      } else {
        const userData = userSnap.data() as User;
        if (!userData.isVerified) {
          await updateDoc(userDocRef, { isVerified: true });
          userData.isVerified = true;
        }
        setUser(userData);

        const plansSnap = await getDocs(collection(db, 'users', fbUser.uid, 'activePlans'));
        const plansList = plansSnap.docs.map(d => d.data() as ActivePlan);
        setActivePlans(plansList);

        const txsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'transactions'));
        const txsList = txsSnap.docs.map(d => d.data() as Transaction);
        setTransactions(txsList);
      }

      // Clean pending referral
      localStorage.removeItem('doddoge_pending_referral');

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
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const deposit = async (amount: number, method: string) => {
    if (!user) return;

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'deposit',
      amount,
      status: 'completed',
      date: new Date().toLocaleString(),
      txHash: '0x' + Math.random().toString(16).substring(2, 18) + '...'
    };

    try {
      // Save transaction to subcollection
      const txDocRef = doc(db, 'users', user.id, 'transactions', newTx.id);
      await setDoc(txDocRef, newTx);

      // Update balance
      const newBalance = Number((user.balance + amount).toFixed(2));
      await updateDoc(doc(db, 'users', user.id), { balance: newBalance });

      // Synchronize states
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => prev ? { ...prev, balance: newBalance } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  const withdraw = async (amount: number, address: string) => {
    if (!user) return { success: false, error: 'User session not found' };
    if (user.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    const newTx: Transaction = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      type: 'withdraw',
      amount,
      status: 'pending',
      date: new Date().toLocaleString(),
      txHash: address
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
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Plan not found' };
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
          const commission = Number((plan.price * 0.20).toFixed(2));

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
            txHash: `Commission from user invite`
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
            totalEarned: Number((p.totalEarned + (payoutAmount / activePlans.length)).toFixed(4))
          };
        }
        return p;
      });

      for (const p of updatedPlans) {
        const planDocRef = doc(db, 'users', user.id, 'activePlans', p.id);
        await updateDoc(planDocRef, { totalEarned: p.totalEarned });
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
