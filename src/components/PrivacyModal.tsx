import React from 'react';
import { Shield, Lock, X, FileText, Eye, CheckCircle2, Cpu, HelpCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in font-mono select-text">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-500/60 hover:text-emerald-400 text-xs hover:scale-110 transition-all cursor-pointer p-1 rounded hover:bg-slate-800"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header section */}
        <div className="p-6 border-b border-emerald-500/10 bg-slate-950/50 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-emerald-500/50 uppercase tracking-widest block font-bold">DATA PROTOCOL</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">PRIVACY & POLICY DISCLOSURE</h2>
          </div>
        </div>

        {/* Scrollable Content section */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-emerald-500/80 leading-relaxed custom-scrollbar">
          
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-[10px] uppercase space-y-2">
            <p className="font-bold text-white">WELCOME TO DODOOGE (&quot;DODOOGE&quot;, &quot;WE&quot;, &quot;OUR&quot;, OR &quot;US&quot;).</p>
            <p className="text-emerald-500/75">
              WE ARE COMMITTED TO PROTECTING YOUR PRIVACY AND HANDLING YOUR PERSONAL INFORMATION IN A TRANSPARENT, SECURE, AND RESPONSIBLE MANNER.
            </p>
            <p className="text-emerald-500/75">
              THIS PRIVACY POLICY EXPLAINS HOW DODOOGE COLLECTS, USES, STORES, PROTECTS, AND DISCLOSES YOUR INFORMATION WHEN YOU ACCESS OR USE OUR WEBSITE, APPLICATIONS, PRODUCTS, SERVICES, TRADING TOOLS, AI-POWERED ANALYSIS, INVESTMENT FEATURES, AND ANY RELATED SERVICES (COLLECTIVELY, THE &quot;SERVICES&quot;).
            </p>
            <p className="text-amber-400 font-bold">
              💡 BY CREATING AN ACCOUNT, ACCESSING OUR PLATFORM, OR USING ANY OF OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY.
            </p>
          </div>

          {/* Section 1 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400 border-b border-emerald-500/10 pb-2">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>1. INFORMATION WE COLLECT</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              TO PROVIDE OUR SERVICES EFFICIENTLY, WE MAY COLLECT DIFFERENT CATEGORIES OF INFORMATION, INCLUDING BUT NOT LIMITED TO:
            </p>
            
            <div className="space-y-3.5">
              <div className="space-y-1">
                <span className="text-[9px] text-white font-bold block tracking-wider">// PERSONAL INFORMATION</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
                  <li>• FULL NAME</li>
                  <li>• USERNAME</li>
                  <li>• EMAIL ADDRESS</li>
                  <li>• PHONE NUMBER</li>
                  <li>• DATE OF BIRTH</li>
                  <li>• COUNTRY OR REGION OF RESIDENCE</li>
                  <li>• GOVERNMENT-ISSUED IDENTIFICATION DOCUMENTS</li>
                  <li>• SELFIE OR IDENTITY VERIFICATION PHOTOGRAPHS</li>
                  <li>• BILLING &amp; PAYMENT-RELATED INFORMATION</li>
                  <li>• CRYPTOCURRENCY WALLET ADDRESSES</li>
                  <li>• PROFILE INFORMATION</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-white font-bold block tracking-wider">// ACCOUNT INFORMATION</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
                  <li>• ACCOUNT REGISTRATION DATE</li>
                  <li>• LOGIN HISTORY</li>
                  <li>• PASSWORD (STORED IN ENCRYPTED FORM)</li>
                  <li>• SECURITY PREFERENCES</li>
                  <li>• TWO-FACTOR AUTHENTICATION STATUS</li>
                  <li>• REFERRAL INFORMATION</li>
                  <li>• USER PREFERENCES</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-white font-bold block tracking-wider">// FINANCIAL INFORMATION</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
                  <li>• DEPOSIT HISTORY</li>
                  <li>• WITHDRAWAL HISTORY</li>
                  <li>• TRADING HISTORY</li>
                  <li>• INVESTMENT RECORDS</li>
                  <li>• WALLET BALANCES</li>
                  <li>• TRANSACTION IDENTIFIERS</li>
                  <li>• BLOCKCHAIN TRANSACTION HASHES</li>
                  <li>• PAYMENT PROCESSOR INFORMATION</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-white font-bold block tracking-wider">// TECHNICAL INFORMATION</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
                  <li>• IP ADDRESS</li>
                  <li>• BROWSER TYPE</li>
                  <li>• DEVICE INFORMATION &amp; OPERATING SYSTEM</li>
                  <li>• DEVICE IDENTIFIERS</li>
                  <li>• LANGUAGE SETTINGS</li>
                  <li>• SCREEN RESOLUTION</li>
                  <li>• TIME ZONE &amp; CONNECTION INFORMATION</li>
                  <li>• ERROR REPORTS &amp; PERFORMANCE LOGS</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-white font-bold block tracking-wider">// USAGE INFORMATION</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
                  <li>• PAGES VISITED &amp; FEATURES USED</li>
                  <li>• SEARCH HISTORY &amp; SESSION DURATION</li>
                  <li>• CLICK ACTIVITY &amp; NAVIGATION BEHAVIOR</li>
                  <li>• AI ANALYSIS REQUESTS</li>
                  <li>• TRADING &amp; REFERRAL ACTIVITIES</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>2. COOKIES AND SIMILAR TECHNOLOGIES</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE USES COOKIES AND SIMILAR TECHNOLOGIES TO IMPROVE USER EXPERIENCE, MAINTAIN SECURITY, REMEMBER USER PREFERENCES, ANALYZE WEBSITE PERFORMANCE, AND ENHANCE OUR SERVICES.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              COOKIES MAY BE USED FOR: AUTHENTICATION, SESSION MANAGEMENT, SECURITY, ANALYTICS, WEBSITE PERFORMANCE, LANGUAGE PREFERENCES, AND PERSONALIZED EXPERIENCE.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/60 italic">
              * USERS MAY DISABLE COOKIES THROUGH THEIR BROWSER SETTINGS; HOWEVER, SOME FEATURES OF THE PLATFORM MAY NOT FUNCTION PROPERLY.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>3. HOW WE USE YOUR INFORMATION</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              YOUR INFORMATION MAY BE USED TO:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
              <li>• CREATE AND MANAGE YOUR ACCOUNT</li>
              <li>• VERIFY YOUR IDENTITY (KYC/AML)</li>
              <li>• PROCESS DEPOSITS AND WITHDRAWALS</li>
              <li>• EXECUTE TRADES AND TRANSACTIONS</li>
              <li>• PROVIDE RELIABLE CUSTOMER SUPPORT</li>
              <li>• IMPROVE AND DEPLOY NEW TERMINAL SERVICES</li>
              <li>• ENHANCE PLATFORM CYBERSECURITY &amp; SYSTEM STABILITY</li>
              <li>• DETECT FRAUD AND SUSPICIOUS FINANCIAL ACTIVITIES</li>
              <li>• COMPLY WITH INTERNATIONAL LEGAL OBLIGATIONS</li>
              <li>• RESPOND TO AUTHORIZED REGULATORY REQUESTS</li>
              <li>• SEND ACCOUNT COMPLIANCE &amp; SECURITY NOTIFICATIONS</li>
              <li>• OPTIMIZE AI-POWERED ANALYSIS &amp; TELEMETRY</li>
              <li>• RESOLVE DISPUTES AND ENFORCE TERMS OF SERVICE</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>4. AI-POWERED FEATURES</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE MAY USE ARTIFICIAL INTELLIGENCE AND AUTOMATED ALGORITHMIC TECHNOLOGIES TO PROVIDE REAL-TIME MARKET INSIGHTS, QUANTITATIVE TRADING ANALYSIS, RESEARCH SUGGESTIONS, FRAUD DETECTION, AND PLATFORM LATENCY OPTIMIZATION.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ AI-GENERATED DATA AND INDICATORS ARE INTENDED SOLELY FOR INFORMATIONAL PURPOSES AND MUST NOT BE INTERPRETED AS DIRECT FINANCIAL ADVICE OR GUARANTEED RETURNS.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>5. DATA SECURITY &amp; CRYPTOGRAPHY</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              PROTECTING USER INFORMATION IS ONE OF OUR HIGHEST PRIORITIES. WE IMPLEMENT APPROPRIATE TECHNICAL, ADMINISTRATIVE, AND ORGANIZATIONAL SAFEGUARDS, INCLUDING:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
              <li>• END-TO-END SSL/TLS ENCRYPTION</li>
              <li>• SECURE BACKEND &amp; SERVER INFRASTRUCTURE</li>
              <li>• FIREWALL &amp; DDOS PROTECTION</li>
              <li>• ENCRYPTED PASSWORD STORAGE (ARGON2/BCRYPT)</li>
              <li>• STRICT SEGREGATED ACCESS CONTROLS</li>
              <li>• CONTINUOUS SECURITY MONITORING &amp; AUDITS</li>
              <li>• AUTOMATED FRAUD DETECTION SYSTEMS</li>
              <li>• REGULAR SECURITY PATCHING &amp; FIRMWARE UPDATES</li>
              <li>• ENFORCED INTERNAL DATA PROTECTION POLICIES</li>
            </ul>
            <p className="text-[10px] uppercase text-red-400/80 font-bold mt-2">
              🚫 WHILE WE STRIVE TO MAINTAIN INDUSTRY-STANDARD CYBERSECURITY, NO METHOD OF ELECTRONIC STORAGE OR TRANSMISSION CAN BE GUARANTEED TO BE 100% IMMUNE TO COMPROMISE.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>6. SHARING OF INFORMATION</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70 font-bold text-white">
              WE DO NOT SELL YOUR PERSONAL INFORMATION.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              WE MAY SHARE INFORMATION ONLY WHEN STRICTLY NECESSARY WITH AUTHORIZED PARTNERS:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
              <li>• PAYMENT SERVICE PROVIDERS</li>
              <li>• CRYPTOCURRENCY PAYMENT PROCESSORS</li>
              <li>• BLOCKCHAIN INFRASTRUCTURE PROVIDERS</li>
              <li>• IDENTITY VERIFICATION SERVICES (KYC)</li>
              <li>• SECURE CLOUD HOSTING PROVIDERS</li>
              <li>• ANALYTICS &amp; MONITORING PROVIDERS</li>
              <li>• CUSTOMER SUPPORT PLATFORMS</li>
              <li>• LEGAL AUTHORITIES AND REGULATORY AGENCIES WHEN REQUIRED</li>
              <li>• PROFESSIONAL AUDITORS &amp; ADVISORS</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>7. BLOCKCHAIN TRANSACTIONS</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              CRYPTOCURRENCY TRANSACTIONS ARE PERMANENTLY RECORDED ON PUBLIC BLOCKCHAIN NETWORKS.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              BLOCKCHAIN LEDGER RECORDS ARE DECENTRALIZED, IMMUTABLE, AND PUBLICLY ACCESSIBLE. DODOOGE CANNOT MODIFY, DELETE, OR OBSCURE TRANSACTION DATA ON-CHAIN.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ USERS MUST CAREFULLY VERIFY RECIPIENT WALLET ADDRESSES BEFORE SUBMITTING WITHDRAWALS.
            </p>
          </div>

          {/* Section 8 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>8. INTERNATIONAL DATA TRANSFERS</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              YOUR INFORMATION MAY BE PROCESSED OR STORED ON SECURED CLOUD SERVERS LOCATED IN DIFFERENT GEOGRAPHIC REGIONS.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              BY USING OUR SERVICES, YOU CONSENT TO THE TRANSFER, STORAGE, AND SECURE PROCESSING OF YOUR INFORMATION IN JURISDICTIONS THAT MAY HAVE DIFFERENT DATA PROTECTION LAWS THAN YOUR HOME COUNTRY.
            </p>
          </div>

          {/* Section 9 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>9. DATA RETENTION POLICY</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              WE RETAIN TRANSACTION AND ACCOUNT INFORMATION FOR AS LONG AS NECESSARY TO:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
              <li>• PROVIDE RELIABLE SERVICES</li>
              <li>• MAINTAIN ACCURATE ACCOUNT RECORDS</li>
              <li>• RESOLVE USER INQUIRIES &amp; DISPUTES</li>
              <li>• PREVENT FRAUD &amp; CYBER ATTACKS</li>
              <li>• COMPLY WITH STATUTORY RETENTION LAWS</li>
              <li>• ENFORCE OUR SERVICE AGREEMENTS</li>
              <li>• MAINTAIN REGULATORY FINANCIAL RECORDS</li>
            </ul>
            <p className="text-[10px] uppercase text-emerald-500/60 italic mt-1.5">
              * AFTER THE APPLICABLE COMPLIANCE RETENTION PERIOD EXPIRES, INFORMATION WILL BE SECURELY DELETED OR ANONYMIZED.
            </p>
          </div>

          {/* Section 10 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>10. YOUR STATUTORY RIGHTS</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              SUBJECT TO JURISDICTIONAL DATA LAWS (SUCH AS GDPR OR CCPA), YOU MAY HAVE THE RIGHT TO:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
              <li>• ACCESS YOUR PERSONAL DATA PROFILE</li>
              <li>• RECTIFY INACCURATE OR OUTDATED INFO</li>
              <li>• UPDATE YOUR ACCOUNT PREFERENCES</li>
              <li>• REQUEST ERASURE / ACCOUNT DELETION</li>
              <li>• RESTRICT PROCESSING OF DATA</li>
              <li>• WITHDRAW CONSENT AT ANY TIME</li>
              <li>• REQUEST A COPY OF YOUR PERSONAL PORTABILITY LEDGER</li>
              <li>• OBJECT TO AUTOMATED DECISION-MAKING</li>
            </ul>
            <p className="text-[10px] uppercase text-emerald-500/65 mt-2 italic">
              * INQUIRIES AND REQUESTS ARE SUBJECT TO STRICT IDENTITY VERIFICATION PROTOCOLS.
            </p>
          </div>

          {/* Section 11 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>11. THIRD-PARTY SERVICES &amp; OUTSIDE LINKS</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              OUR TERMINAL PLATFORM MAY CONTAIN INTEGRATED ACCESS OR HYPERLINKS TO THIRD-PARTY WEBSITES, EXCHANGES, CRYPTO GATEWAYS, OR EXTERNAL BLOCKCHAIN APPLICATIONS.
            </p>
            <p className="text-[10px] uppercase text-red-400/80 font-bold">
              🚫 DODOOGE IS NOT RESPONSIBLE FOR THE DATA PRACTICES, SECURITY STRUCTURES, OR SYSTEM CONTENT OF INDEPENDENT THIRD-PARTY PLATFORMS.
            </p>
          </div>

          {/* Section 12 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>12. CHILDREN&apos;S PRIVACY</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE IS STRICTLY INTENDED FOR ADULT INDIVIDUALS WHO ARE LEGALLY PERMITTED TO ACCESS AND USE TRADING TELEMETRY SYSTEMS UNDER APPLICABLE REGULATORY STATUTES.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              WE DO NOT KNOWINGLY GATHER PERSONAL CLASSIFIED DATA FROM MINORS. IF WE DETECT ANY REGISTRATION COMPROMISING THIS PRINCIPLE, IMMEDIATE TERMINATION STEPS WILL BE DEPLOYED.
            </p>
          </div>

          {/* Section 13 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>13. LEGAL DISCLOSURE COMPLIANCE</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              WE RESERVE THE RIGHT TO DISCLOSE CLASSIFIED VISITOR DATA IN EXTENUATING CIRCUMSTANCES WHERE MANDATED TO:
            </p>
            <ul className="space-y-1 text-[9px] uppercase text-emerald-500/60 pl-2">
              <li>• COMPLY WITH APPLICABLE STATUTES AND COURT SUBPOENAS</li>
              <li>• RESPOND TO AUTHORIZED GOVERNMENT REQUISITIONS</li>
              <li>• PROTECT THE CONSTITUTIONAL RIGHTS &amp; ASSETS OF DODOOGE</li>
              <li>• PREVENT IN-PROGRESS FINANCIAL CRIME, FRAUD, OR CYBER ATTACKS</li>
              <li>• PROTECT USER AND PUBLIC BIOLOGICAL SAFETY</li>
              <li>• ENFORCE THE MASTER TERMS OF SERVICE INTERFACES</li>
            </ul>
          </div>

          {/* Section 14 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>14. AMENDMENTS &amp; REVISIONS</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              WE RESERVE THE RIGHT TO REVISE, UPDATE, OR COMPLETELY REDRAFT THIS PRIVACY DISCLOSURE DOCUMENT AT OUR DISCRETION.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              ALL CHANGES BECOME EFFECTIVE IMMEDIATELY UPON PUBLICATION. USERS ARE RESPONSIBLE FOR RE-VERIFYING THIS DOCUMENT ON A ROUTINE SESSION BASIS.
            </p>
          </div>

          {/* Section 15 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>15. SYSTEM CONTACT DETAILS</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              IF YOU OWN CONCERNS, DISPUTES, OR SECURITY REPORTS REGARDING DATA INTEGRATION PRACTICES, COMMUNICATE DIRECTLY WITH OUR SYSTEM DESK:
            </p>
            <div className="text-[10px] uppercase text-emerald-400 font-bold bg-slate-950/60 border border-emerald-500/10 rounded p-2.5 space-y-1 font-mono">
              <div>• EMAIL DESK: DODOOGESUPPORT@GMAIL.COM</div>
              <div>• SYSTEM SUPPORT NODE: HTTPS://T.ME/DODOOGE_SUPPORT</div>
            </div>
          </div>

          {/* Final Statement */}
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-4 space-y-2">
            <h3 className="font-black text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-400 animate-pulse" />
              <span>FINAL INSTITUTIONAL STATEMENT</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-400 font-bold leading-relaxed">
              AT DODOOGE, WE VALUE YOUR TRUST AND ARE COMMITTED TO PROTECTING YOUR PRIVACY THROUGH RESPONSIBLE DATA PRACTICES, MODERN SECURITY MEASURES, AND TRANSPARENT INFORMATION MANAGEMENT. BY CONTINUING TO USE OUR PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREED TO THE PRACTICES DESCRIBED IN THIS PRIVACY POLICY.
            </p>
          </div>

        </div>

        {/* Footer actions section */}
        <div className="p-4 border-t border-emerald-500/10 bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-md shadow-emerald-500/10"
          >
            I Acknowledge &amp; Accept
          </button>
        </div>

      </div>
    </div>
  );
};
