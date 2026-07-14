import { doc, getDoc, updateDoc, collection, getDocs, query, where, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../types';

/**
 * Checks if a user has made a completed deposit and activated an investment plan.
 * If both conditions are satisfied, and the user registered via a referral code,
 * we mark them as verified and increment the referrer's leaderboard scores.
 */
export const checkAndVerifyUserReferralState = async (userId: string, referredByCode: string | null | undefined): Promise<void> => {
  if (!referredByCode) return;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    
    // If already verified, do not duplicate scoring
    if (userData.referralVerified) return;

    // Check if user has at least one completed deposit transaction
    const txsRef = collection(db, 'users', userId, 'transactions');
    const txsSnap = await getDocs(txsRef);
    const hasCompletedDeposit = txsSnap.docs.some(d => {
      const tx = d.data() as Transaction;
      return tx.type === 'deposit' && tx.status === 'completed';
    });

    // Check if user has at least one active plan
    const plansRef = collection(db, 'users', userId, 'activePlans');
    const plansSnap = await getDocs(plansRef);
    const hasActivePlan = !plansSnap.empty;

    if (hasCompletedDeposit && hasActivePlan) {
      // 1. Mark user as verified referral sub-node
      await updateDoc(userRef, { referralVerified: true });

      // 2. Locate referrer profile and increment leaderboard tallies
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referredByCode));
      const referrerSnap = await getDocs(q);
      if (!referrerSnap.empty) {
        const referrerDoc = referrerSnap.docs[0];
        await updateDoc(referrerDoc.ref, {
          allTimeReferrals: increment(1),
          monthlyReferrals: increment(1)
        });
        console.log(`Referral verified successfully: ${userData.email} now counts as a leaderboard node for ${referrerDoc.data().email}`);
      }
    }
  } catch (err) {
    console.error('Error verifying user referral state:', err);
  }
};
