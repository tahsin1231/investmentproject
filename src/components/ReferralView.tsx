import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { User } from '../types';
import { 
  Award, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  HelpCircle,
  Share2,
  Lock
} from 'lucide-react';

interface LeaderboardUser {
  username: string;
  email: string;
  monthlyReferrals: number;
  allTimeReferrals: number;
  isCurrentUser: boolean;
}

export const ReferralView: React.FC = () => {
  const { user, language, referralCommissionRate } = useApp();
  const t = translations[language];

  const [copiedLink, setCopiedLink] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'monthly' | 'alltime'>('alltime');
  const [referralsTab, setReferralsTab] = useState<'pending' | 'verified'>('verified');
  
  // Real-time queries
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [pendingRefs, setPendingRefs] = useState<any[]>([]);
  const [verifiedRefs, setVerifiedRefs] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Derive referral link
  const referralLink = user ? `${window.location.origin}/?ref=${user.referralCode}` : '';

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Fetch Leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const usersRef = collection(db, 'users');
        const snap = await getDocs(usersRef);
        
        const allUsers = snap.docs.map(docSnap => {
          const u = docSnap.data();
          const boost = Number(u.adminReferralBoost || 0);
          const rawAllTime = Number(u.allTimeReferrals || 0);
          const rawMonthly = Number(u.monthlyReferrals || 0);
          
          return {
            username: u.username || 'anonymous',
            email: u.email || '',
            monthlyReferrals: rawMonthly + boost,
            allTimeReferrals: rawAllTime + boost,
            isCurrentUser: u.id === user?.id
          };
        });

        // Sort based on current tab
        if (leaderboardTab === 'monthly') {
          allUsers.sort((a, b) => b.monthlyReferrals - a.monthlyReferrals);
        } else {
          allUsers.sort((a, b) => b.allTimeReferrals - a.allTimeReferrals);
        }

        // Limit to top 10
        setLeaderboard(allUsers.slice(0, 10));
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardTab, user]);

  // Fetch Referred Users lists
  useEffect(() => {
    if (!user) return;
    
    const fetchReferredUsers = async () => {
      setLoadingRefs(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referredBy', '==', user.referralCode));
        const snap = await getDocs(q);
        
        const pendingList: any[] = [];
        const verifiedList: any[] = [];
        
        snap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const item = {
            email: d.email,
            username: d.username,
            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            referralVerified: !!d.referralVerified
          };
          
          if (d.referralVerified) {
            verifiedList.push(item);
          } else {
            pendingList.push(item);
          }
        });

        setPendingRefs(pendingList);
        setVerifiedRefs(verifiedList);
      } catch (err) {
        console.error('Error fetching referred list:', err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchReferredUsers();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6 font-mono text-emerald-400">
      
      {/* Top Banner section */}
      <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/10">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Share2 className="w-24 h-24 text-emerald-500" />
        </div>
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">AFFILIATE REVENUE HUB</span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">DODOOGE DELEGATE NETWORKING</h2>
          <p className="text-emerald-500/80 text-xs leading-relaxed uppercase">
            Deploy your unique sub-node registration telemetry. Earn up to {referralCommissionRate || 20}% instant cash back commission inside your master ledger every single time your referred delegates subscribe or activate mining contracts.
          </p>
          <div className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 leading-relaxed uppercase font-sans">
            🎁 <b>Sub-node Benefit:</b> Your referrals receive a <b>50% instant refund on lost OTC trades</b> when they register using your referral link! Direct signups get 0% refund.
          </div>
        </div>
      </div>

      {/* Referral Link Copy widget */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4">
          <div>
            <span className="text-[9px] text-emerald-500/50 uppercase tracking-widest block mb-1">YOUR REFERRAL PROFILE</span>
            <span className="text-xs font-bold text-white uppercase">COMMISSION STATUS: ACTIVE</span>
          </div>

          <div className="space-y-1.5 bg-slate-900 border border-emerald-500/10 rounded-lg p-3">
            <span className="text-[8px] text-emerald-500/40 uppercase block font-bold">REFERRAL CODE</span>
            <span className="text-sm font-bold text-emerald-300 font-mono tracking-wider">{user.referralCode}</span>
          </div>

          <div className="space-y-2 bg-slate-900 border border-emerald-500/10 rounded-lg p-3.5">
            <label className="block text-[8px] text-emerald-500/40 uppercase tracking-widest font-bold">INVITATION LINK</label>
            <div className="flex items-center space-x-2 bg-slate-950 border border-emerald-500/20 rounded px-2.5 py-1.5 justify-between">
              <span className="text-[10px] text-emerald-400/80 truncate pr-2 select-all font-mono">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="bg-slate-900 hover:bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-400 px-2.5 py-1 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer uppercase tracking-wider"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-emerald-400" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time stats row */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-emerald-500/40 uppercase block tracking-wider">TOTAL INVITATIONS</span>
              <span className="text-xs text-emerald-500/60 font-semibold block uppercase mt-1">DIRECT PEER NODES</span>
            </div>
            <div className="text-3xl font-bold text-white mt-4 font-mono">
              {pendingRefs.length + verifiedRefs.length} <span className="text-xs text-slate-500">PEERS</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-red-500/20 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-red-500/50 uppercase block tracking-wider">PENDING DELEGATES</span>
              <span className="text-xs text-red-500/40 font-semibold block uppercase mt-1">NOT YET PLAN ACTIVATED</span>
            </div>
            <div className="text-3xl font-bold text-red-400 mt-4 font-mono">
              {pendingRefs.length} <span className="text-xs text-slate-500">PENDING</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-emerald-400/50 uppercase block tracking-wider">VERIFIED DELEGATES</span>
              <span className="text-xs text-emerald-500/60 font-semibold block uppercase mt-1">COUNTED ON LEADERBOARD</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400 mt-4 font-mono">
              {verifiedRefs.length} <span className="text-xs text-slate-500">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main split grid: LEADERBOARD on left (8 columns), USER REFERRAL LIST on right (4 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEADERBOARD VIEW - 7 columns */}
        <div className="lg:col-span-7 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/10 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">GLOBAL AFFILIATE LEADERBOARD</h3>
                <p className="text-[8px] text-emerald-500/40 uppercase">LIVE NETWORK RANKINGS (ADMIN INFLUENCE ACTIVE)</p>
              </div>
            </div>

            {/* Monthly / All-time Tab selector */}
            <div className="flex space-x-1.5 bg-slate-900 border border-emerald-500/10 p-1 rounded-lg">
              <button
                onClick={() => setLeaderboardTab('alltime')}
                className={`px-3 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                  leaderboardTab === 'alltime'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-emerald-500/55 hover:text-emerald-400'
                }`}
              >
                ALL TIME
              </button>
              <button
                onClick={() => setLeaderboardTab('monthly')}
                className={`px-3 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                  leaderboardTab === 'monthly'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-emerald-500/55 hover:text-emerald-400'
                }`}
              >
                THIS MONTH
              </button>
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="py-20 text-center text-xs uppercase animate-pulse">
              Connecting to central mainframe...
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="py-12 text-center text-[10px] uppercase text-emerald-500/30">No registered data streams available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse uppercase font-mono">
                <thead>
                  <tr className="border-b border-emerald-500/10 text-emerald-500/40 pb-2 text-[9px]">
                    <th className="py-2 text-center w-12">RANK</th>
                    <th className="py-2">USERNAME / PEER NODE</th>
                    <th className="py-2 text-right">VERIFIED REF COUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item, idx) => {
                    const rank = idx + 1;
                    let rankBadge = rank.toString();
                    if (rank === 1) rankBadge = '🥇';
                    else if (rank === 2) rankBadge = '🥈';
                    else if (rank === 3) rankBadge = '🥉';

                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-all ${
                          item.isCurrentUser ? 'bg-emerald-500/10 text-white font-bold border-l-2 border-l-emerald-500' : 'text-emerald-400/80'
                        }`}
                      >
                        <td className="py-3 text-center text-xs font-bold">{rankBadge}</td>
                        <td className="py-3 font-semibold">
                          <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                            <span className="truncate">@{item.username}</span>
                            {item.isCurrentUser && (
                              <span className="text-[8px] bg-emerald-500 text-slate-950 font-bold px-1 rounded">YOU</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-300">
                          {leaderboardTab === 'monthly' ? item.monthlyReferrals : item.allTimeReferrals} Nodes
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* YOUR DIRECT INVITATIONS LIST - 5 columns */}
        <div className="lg:col-span-5 bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>YOUR INVITED PEERS</span>
            </h3>

            {/* Pending / Verified selector */}
            <div className="flex space-x-1.5 bg-slate-900 border border-emerald-500/10 p-1 rounded-lg">
              <button
                onClick={() => setReferralsTab('verified')}
                className={`px-2.5 py-1 text-[8px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                  referralsTab === 'verified'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-emerald-500/55 hover:text-emerald-400'
                }`}
              >
                VERIFIED ({verifiedRefs.length})
              </button>
              <button
                onClick={() => setReferralsTab('pending')}
                className={`px-2.5 py-1 text-[8px] font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                  referralsTab === 'pending'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-emerald-500/55 hover:text-emerald-400'
                }`}
              >
                PENDING ({pendingRefs.length})
              </button>
            </div>
          </div>

          {loadingRefs ? (
            <div className="py-12 text-center text-[10px] uppercase animate-pulse">Scanning peer nodes...</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar pr-1">
              {referralsTab === 'verified' ? (
                verifiedRefs.length === 0 ? (
                  <div className="p-8 text-center text-[10px] text-emerald-500/30 uppercase border border-dashed border-emerald-500/10 rounded-lg leading-relaxed">
                    No verified sub-nodes identified.<br />
                    Sub-nodes move here once they purchase an active mining plan!
                  </div>
                ) : (
                  verifiedRefs.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-3 border border-emerald-500/15 rounded-lg flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-bold text-emerald-300 font-mono">@{item.username || item.email.split('@')[0]}</p>
                        <p className="text-[9px] text-emerald-500/40 font-mono">Invite Date: {item.date}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[8px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    </div>
                  ))
                )
              ) : (
                pendingRefs.length === 0 ? (
                  <div className="p-8 text-center text-[10px] text-emerald-500/30 uppercase border border-dashed border-emerald-500/10 rounded-lg">
                    No pending invitations.
                  </div>
                ) : (
                  pendingRefs.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-3 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-bold text-slate-400 font-mono">@{item.username || item.email.split('@')[0]}</p>
                        <p className="text-[9px] text-slate-600 font-mono">Registered: {item.date}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800 text-[8px] font-bold">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>PENDING</span>
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          )}

          {/* Help note */}
          <div className="bg-slate-900/60 border border-emerald-500/10 rounded p-3 flex items-start space-x-2 text-[9px] leading-relaxed text-emerald-500/60 uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500/40 shrink-0 mt-0.5" />
            <span>
              PENDING delegates REGISTERED UNDER YOUR NODE ID BUT HAVE NOT YET FUNDED AND ACTIVATED A CONTRACT. DELEGATES ARE INSTANTLY ROUTED TO VERIFIED ONCE THEY INITIATE AT LEAST ONE ACTIVE INVESTMENT PLAN.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
