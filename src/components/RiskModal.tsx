import React from 'react';
import { AlertTriangle, ShieldAlert, X, FileText, CheckCircle } from 'lucide-react';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskModal: React.FC<RiskModalProps> = ({ isOpen, onClose }) => {
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
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-emerald-500/50 uppercase tracking-widest block font-bold">REGULATORY DISCLOSURE</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">RISK WARNING & DISCLOSURE PROTOCOL</h2>
          </div>
        </div>

        {/* Scrollable Content section */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-emerald-500/80 leading-relaxed custom-scrollbar">
          
          {/* Section 1 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>1. Information & Analysis Disclaimer</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              All information published on this platform, including articles, AI-generated analysis, market research, trading signals, educational materials, investment insights, news updates, and other content, is provided solely for informational purposes.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Nothing on this platform should be interpreted as financial advice, investment advice, legal advice, or a recommendation to buy, sell, or hold any financial instrument or digital asset.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ Users are encouraged to perform their own research before making any investment decisions.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>2. Third-Party Integrations</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Our platform may integrate with or provide access to third-party services, exchanges, wallets, payment processors, APIs, blockchain networks, or external websites.
            </p>
            <p className="text-[10px] uppercase text-emerald-500/70">
              We are not responsible for the availability, performance, security, policies, or actions of any third-party service provider.
            </p>
            <p className="text-[10px] uppercase text-amber-500/80 font-bold">
              ⚠️ Users interact with third-party services entirely at their own risk.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>3. Security & Account Confidentiality</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              Users are responsible for maintaining the confidentiality of their account credentials, passwords, authentication devices, wallet addresses, and security settings.
            </p>
            <p className="text-[10px] uppercase text-red-400/80 font-bold">
              🚫 We are not liable for losses resulting from unauthorized access caused by weak passwords, phishing attacks, malware, compromised devices, user negligence, or disclosure of login credentials.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>4. Limitation of Liability</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              To the fullest extent permitted by applicable law, the platform, its owners, operators, employees, affiliates, partners, developers, and service providers shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising from or related to:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[9px] uppercase text-red-400 font-bold font-mono pl-2 pt-1">
              <li>• Investment losses</li>
              <li>• Trading losses</li>
              <li>• Loss of profits</li>
              <li>• Loss of digital assets</li>
              <li>• Data loss</li>
              <li>• Service interruptions</li>
              <li>• Technical failures</li>
              <li>• Market fluctuations</li>
              <li>• Security breaches</li>
              <li>• Third-party failures</li>
              <li>• Delayed transactions</li>
              <li>• Blockchain network issues</li>
            </ul>
            <p className="text-[10px] uppercase text-emerald-400/90 font-bold mt-2">
              All investments and transactions are undertaken entirely at the user's own discretion and risk.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-slate-950/40 border border-emerald-500/5 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-emerald-400">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>5. Force Majeure</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              The platform shall not be held responsible for any failure or delay in performance resulting from events beyond our reasonable control, including but not limited to natural disasters, wars, terrorism, pandemics, government actions, power failures, internet outages, cyber attacks, or other unforeseen circumstances.
            </p>
          </div>

          {/* Section 6 */}
          <div className="bg-slate-950/40 border border-amber-500/10 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wide flex items-center gap-2 text-amber-500">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>6. Express Acknowledgment & Consent</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-500/70">
              By creating an account, accessing the platform, depositing funds, executing trades, or using any of our services, you expressly acknowledge and accept that:
            </p>
            <ul className="space-y-1 text-[9px] uppercase text-emerald-400/90 font-bold pl-2">
              <li>☑ You understand the risks associated with investing and trading.</li>
              <li>☑ You may lose part or all of your invested capital.</li>
              <li>☑ No profits or returns are guaranteed.</li>
              <li>☑ You are solely responsible for your investment decisions.</li>
              <li>☑ You have conducted your own research before investing.</li>
              <li>☑ You voluntarily assume all risks associated with using this platform.</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-red-400 text-[11px] uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
              <span>7. Final Institutional Statement</span>
            </h3>
            <p className="text-[10px] uppercase text-emerald-400 font-bold leading-relaxed">
              Invest responsibly. Never invest borrowed money, emergency funds, or money required for essential living expenses. Diversification, proper risk management, and independent research are essential components of responsible investing.
            </p>
            <p className="text-[10px] uppercase text-red-400 font-black leading-relaxed mt-1">
              ⚠️ If you do not fully understand or accept the risks described in this Risk Disclosure, you should refrain from using this platform or making any investment through our services.
            </p>
          </div>

        </div>

        {/* Footer actions section */}
        <div className="p-4 border-t border-emerald-500/10 bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-md shadow-emerald-500/10"
          >
            I Acknowledge & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
