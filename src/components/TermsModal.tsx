import React from 'react';
import { ShieldCheck, X, FileText, HelpCircle, CheckCircle, AlertOctagon, Landmark } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in font-mono">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
        
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
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-emerald-500/50 uppercase tracking-widest block font-bold">TERMS OF SERVICE</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">TERMS AND CONDITIONS PROTOCOL</h2>
          </div>
        </div>

        {/* Scrollable Content section */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-emerald-500/80 leading-relaxed custom-scrollbar">
          
          {/* Welcome Text */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[12px] uppercase tracking-wide">Welcome to DODOOGE</h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Customer&quot;, &quot;Member&quot;, &quot;Investor&quot;, &quot;Trader&quot;, &quot;Client&quot;, &quot;you&quot;, or &quot;your&quot;) and <strong>DODOOGE</strong> (&quot;DODOOGE&quot;, &quot;Platform&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) governing your access to and use of the DODOOGE website, mobile applications, investment services, AI-powered analysis, trading features, referral program, digital asset services, payment services, and all related products and services (collectively, the &quot;Services&quot;).
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              By accessing, registering, creating an account, depositing funds, participating in investment activities, executing trades, referring users, withdrawing funds, or otherwise using any part of the Platform, you acknowledge that you have carefully read, understood, and agreed to be legally bound by these Terms and all policies published by DODOOGE, including but not limited to the Privacy Policy, Risk Disclosure, AML & KYC Policy, Cookie Policy, and any future amendments.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ If you do not agree with these Terms, you must immediately discontinue use of the Platform.
            </p>
          </div>

          {/* Section: Fund Management & Withdrawal Processing */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-amber-400 text-[11px] uppercase tracking-wide flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              <span>FUND MANAGEMENT & WITHDRAWAL PROCESSING</span>
            </h3>
            <p className="text-[10px] uppercase text-amber-500/80">
              DODOOGE operates as an investment and trading platform. Depending on market conditions, liquidity requirements, operational needs, treasury management, and ongoing investment activities, user funds may be actively allocated within the platform&apos;s operational framework.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80">
              Users acknowledge and agree that withdrawal requests are subject to liquidity availability, blockchain network conditions, security reviews, compliance procedures, maintenance activities, and other operational considerations.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80">
              While DODOOGE is committed to processing all legitimate withdrawal requests and returning eligible user balances in accordance with these Terms, users understand and accept that exceptional circumstances—including but not limited to extreme market volatility, liquidity constraints, cybersecurity incidents, technical failures, blockchain congestion, regulatory actions, force majeure events, or other unforeseen conditions—may result in delays in withdrawal processing.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80">
              Such delays shall not, by themselves, be interpreted as evidence of fraud, insolvency, or an intention to permanently withhold user funds. DODOOGE will make commercially reasonable efforts to restore normal operations and process pending withdrawals as soon as reasonably practicable.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ By using the platform, users acknowledge that participation in trading and investment activities involves financial risk and that all deposits, investments, and transactions are made voluntarily and entirely at the user&apos;s own risk. Users should invest only funds they can afford to have temporarily unavailable and should not rely on immediate access to invested funds under all circumstances.
            </p>
          </div>

          {/* Section 1 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>1. Eligibility</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70 mb-1">To use DODOOGE, you represent and warrant that:</p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-emerald-500/60">
              <li>You are legally capable of entering into binding contracts.</li>
              <li>You are of the legal age required under the laws of your jurisdiction.</li>
              <li>You are not prohibited by any applicable law from using investment or cryptocurrency-related services.</li>
              <li>You are using your own funds and not funds obtained through illegal activities.</li>
              <li>You will comply with all applicable laws, regulations, tax obligations, sanctions, and financial reporting requirements.</li>
              <li>All information provided to DODOOGE is true, accurate, complete, and up to date.</li>
            </ul>
            <p className="text-[10px] uppercase text-amber-500/70 font-bold mt-2">
              We reserve the right to refuse service to any individual, entity, organization, or jurisdiction at our sole discretion.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>2. Nature of the Platform</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE is an AI-powered investment and trading platform that provides users with access to analytical tools, investment opportunities, trading technologies, market insights, portfolio management features, and related digital financial services.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              The Platform may utilize artificial intelligence, algorithmic analysis, automated systems, statistical models, blockchain technology, and proprietary technologies to assist users. However, all investment activities involve substantial financial risk.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ Nothing provided on DODOOGE constitutes financial advice, investment advice, legal advice, accounting advice, tax advice, or guarantees of future performance.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>3. User Accounts</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Users are solely responsible for maintaining the confidentiality of their account credentials. You agree that:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-emerald-500/60">
              <li>Your account belongs exclusively to you.</li>
              <li>You will not share your login credentials.</li>
              <li>You will maintain strong password security.</li>
              <li>You will immediately notify DODOOGE of unauthorized account access.</li>
              <li>You are responsible for every activity performed through your account.</li>
            </ul>
            <p className="text-[10px] uppercase text-red-400/80 font-bold mt-2">
              🚫 DODOOGE shall not be liable for losses caused by user negligence, compromised devices, phishing attacks, malware, weak passwords, or unauthorized account access.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>4. Deposits</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Users may deposit supported cryptocurrencies through approved payment methods. Users acknowledge that:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-emerald-500/60">
              <li>Blockchain transactions are irreversible.</li>
              <li>Incorrect wallet addresses may result in permanent loss.</li>
              <li>Network confirmations depend entirely on blockchain networks.</li>
              <li>Deposit processing times may vary.</li>
              <li>Temporary delays may occur because of blockchain congestion or technical maintenance.</li>
            </ul>
            <p className="text-[10px] uppercase text-emerald-500/70 font-bold mt-2">
              The Platform reserves the right to reject suspicious or non-compliant deposits.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>5. Investments and Trading</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Investment opportunities available on DODOOGE involve significant uncertainty. Users acknowledge that:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-emerald-500/60">
              <li>Market prices fluctuate continuously.</li>
              <li>AI systems are not capable of predicting markets with certainty.</li>
              <li>Investment performance cannot be guaranteed.</li>
              <li>Profits are never guaranteed.</li>
              <li>Losses may exceed expectations.</li>
              <li>Historical performance is not indicative of future results.</li>
            </ul>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold mt-2">
              ⚠️ Every investment decision remains solely the responsibility of the user.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>6. Artificial Intelligence Disclaimer</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE may provide AI-generated market research, automated analysis, statistical forecasting, trading signals, and investment recommendations.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              These outputs are generated using computational models and historical market information. AI systems may produce incorrect, delayed, incomplete, inaccurate, or misleading results.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ Users acknowledge that all investment decisions remain entirely their own responsibility regardless of any AI-generated information displayed on the Platform.
            </p>
          </div>

          {/* Section 7 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>7. Withdrawal Policy</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Withdrawal requests are processed according to the Platform&apos;s operational procedures, liquidity management, compliance reviews, blockchain conditions, and internal security measures.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Withdrawal requests may require identity verification, fraud screening, transaction monitoring, manual review, blockchain confirmations, or additional compliance checks.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Processing times may vary significantly depending on network traffic, maintenance activities, security investigations, payment gateway performance, liquidity availability, and regulatory requirements.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70 font-bold">
              The Platform may temporarily delay withdrawals whenever reasonably necessary to protect users, maintain operational stability, or comply with applicable laws.
            </p>
          </div>

          {/* Section 8 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>8. Liquidity Management</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE actively manages its operational treasury, liquidity reserves, trading capital, strategic allocations, and platform resources in order to maintain long-term sustainability and efficient platform operations.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Users understand that deposited funds may form part of the Platform&apos;s managed operational liquidity while remaining recorded within the user&apos;s account balance in accordance with applicable internal accounting procedures.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Under exceptional circumstances—including but not limited to extreme market volatility, sudden liquidity shortages, unexpected trading losses, cyber incidents, infrastructure failures, banking interruptions, payment processor issues, blockchain congestion, regulatory actions, force majeure events, or other extraordinary operational situations—withdrawal processing may require additional time.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE remains committed to processing legitimate withdrawal requests in accordance with these Terms. However, users acknowledge that immediate access to invested funds cannot always be guaranteed under all market conditions.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ Users further acknowledge that participation in investment activities inherently involves financial and liquidity risks. Accordingly, all investments, deposits, and transactions are undertaken voluntarily and entirely at the user&apos;s own risk. Users should only invest funds they can afford to leave invested for an extended period and should never rely on immediate liquidity for emergency financial needs.
            </p>
          </div>

          {/* Section 9 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>9. Risk Acceptance</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">By using DODOOGE you acknowledge and agree that:</p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-red-400 font-semibold">
              <li>You may lose all invested funds.</li>
              <li>Cryptocurrency markets are highly volatile.</li>
              <li>Trading systems may fail.</li>
              <li>AI systems may produce inaccurate analysis.</li>
              <li>Technical issues may interrupt services.</li>
              <li>Government regulations may change.</li>
              <li>Payment providers may suspend services.</li>
              <li>Blockchain networks may experience congestion.</li>
              <li>Exchange rates may fluctuate dramatically.</li>
            </ul>
            <p className="text-[10px] uppercase text-emerald-500/70 font-bold mt-2">
              You voluntarily accept every financial risk associated with using the Platform.
            </p>
          </div>

          {/* Section 10 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>10. Prohibited Activities</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">Users shall not:</p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-emerald-500/60">
              <li>Commit fraud.</li>
              <li>Launder money.</li>
              <li>Finance terrorism.</li>
              <li>Manipulate markets.</li>
              <li>Abuse referral programs.</li>
              <li>Create fake accounts.</li>
              <li>Use stolen identities.</li>
              <li>Attempt unauthorized access.</li>
              <li>Reverse engineer the Platform.</li>
              <li>Upload malicious software.</li>
              <li>Conduct phishing attacks.</li>
              <li>Exploit vulnerabilities.</li>
              <li>Interfere with Platform operations.</li>
            </ul>
            <p className="text-[10px] uppercase text-red-400/80 font-bold mt-2">
              Violation may result in immediate suspension, permanent account termination, forfeiture of bonuses, reporting to authorities, and legal action.
            </p>
          </div>

          {/* Section 11 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>11. Suspension and Termination</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE reserves the unrestricted right to suspend, restrict, investigate, freeze, or permanently terminate any account where suspicious activity, fraud, abuse, regulatory concerns, sanctions risks, compliance failures, technical threats, or security concerns are identified.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ Such action may be taken without prior notice whenever necessary to protect the Platform or its users.
            </p>
          </div>

          {/* Section 12 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>12. Limitation of Liability</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              To the fullest extent permitted by law, DODOOGE, its owners, operators, affiliates, employees, partners, contractors, developers, licensors, and service providers shall not be liable for any direct, indirect, incidental, consequential, punitive, exemplary, or special damages arising from:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[9px] uppercase text-red-400/80">
              <li>Investment losses</li>
              <li>Trading losses</li>
              <li>Lost profits</li>
              <li>Missed opportunities</li>
              <li>Blockchain failures</li>
              <li>Cyber attacks</li>
              <li>Exchange failures</li>
              <li>Wallet compromises</li>
              <li>Smart contract vulnerabilities</li>
              <li>Regulatory changes</li>
              <li>Payment processor interruptions</li>
              <li>Internet outages</li>
              <li>Hardware failures</li>
              <li>Software bugs</li>
              <li>AI prediction errors</li>
              <li>Human error</li>
              <li>Third-party failures</li>
            </ul>
            <p className="text-[10px] uppercase text-emerald-500/70 font-bold mt-2">
              Users accept full responsibility for every investment decision they make.
            </p>
          </div>

          {/* Section 13 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>13. Force Majeure</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE shall not be liable for delays or failures caused by events beyond reasonable control including natural disasters, wars, terrorism, riots, government restrictions, sanctions, epidemics, pandemics, cyber attacks, power failures, internet outages, cloud infrastructure failures, exchange failures, blockchain disruptions, or financial market emergencies.
            </p>
          </div>

          {/* Section 14 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>14. Amendments</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              DODOOGE reserves the absolute right to modify, update, replace, suspend, or discontinue any portion of these Terms, Services, fees, policies, investment products, trading features, AI systems, referral programs, or operational procedures at any time.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Continued use of the Platform after modifications constitutes acceptance of the revised Terms.
            </p>
          </div>

          {/* Section 15 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>15. Governing Principles</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              These Terms shall be interpreted to the maximum extent permitted by applicable law.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              If any provision is determined to be invalid or unenforceable, the remaining provisions shall remain fully effective.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Failure by DODOOGE to enforce any provision shall not constitute a waiver of its rights.
            </p>
          </div>

          {/* Final Acknowledgement */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[12px] uppercase tracking-wide">Final Acknowledgement</h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              By creating an account, depositing digital assets, investing, trading, referring users, withdrawing funds, or otherwise using DODOOGE, you expressly acknowledge and agree that you fully understand the significant risks associated with cryptocurrency, digital assets, financial markets, AI-assisted trading, automated investment technologies, blockchain infrastructure, and online financial services.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              You acknowledge that profits are never guaranteed, losses may occur at any time, withdrawals may be subject to operational processing periods under exceptional circumstances, and all financial decisions are made entirely at your own discretion and risk.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              You further acknowledge that DODOOGE makes no representation or warranty regarding future performance, profitability, uninterrupted service availability, or investment outcomes. Your continued use of the Platform constitutes your complete acceptance of these Terms and Conditions, the Privacy Policy, the Risk Disclosure, and all other policies published by DODOOGE.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70 font-bold">
              Invest responsibly, conduct your own independent research, understand the risks involved, and never invest funds that you cannot afford to lose.
            </p>
          </div>

        </div>

        {/* Footer Accept section */}
        <div className="p-4 bg-slate-950/60 border-t border-emerald-500/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
          >
            I Acknowledge & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
