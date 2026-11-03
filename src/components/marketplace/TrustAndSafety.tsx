import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Verified, Search, Anchor } from 'lucide-react';
import { TradeHeavenMediatorView } from './TradeHeavenMediatorView';

export const TrustAndSafety: React.FC = () => {
  useEffect(() => {
    document.title = "Trust & Safety | Trade Heaven B2B Marketplace";
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm mb-4">
            <ShieldCheck className="w-5 h-5" />
            <span>Official Security &amp; Escrow Mediation Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">
            Secure, Verified, and Transparent Global Trade
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            At Trade Heaven, our mission is to eliminate the risks of cross-border commerce. We are strictly a physical goods B2B marketplace, dedicated to connecting legitimate manufacturers with serious global buyers through ACID-compliant escrow mediation.
          </p>
        </div>

        {/* Interactive TradeHeavenMediatorEngine Console */}
        <TradeHeavenMediatorView embedded={true} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Verified className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Strict Supplier Verification</h3>
            <p className="text-slate-600 leading-relaxed">
              Every supplier on our platform undergoes a vetting process. We check corporate credentials, manufacturing capabilities, and export history to ensure you are dealing with real, established businesses.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Anchor className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Physical Goods Only</h3>
            <p className="text-slate-600 leading-relaxed">
              Trade Heaven is exclusively a marketplace for physical manufacturing, export, and wholesale trade. We have zero affiliation with financial speculation, cryptocurrency, or forex trading platforms.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Transparent &amp; Secure Escrow</h3>
            <p className="text-slate-600 leading-relaxed">
              Funds deposited by buyers are held in row-locked escrow wallets until delivery and inspection milestones are confirmed, then settled atomically to verified supplier bank accounts.
            </p>
          </div>
        </div>

        {/* Trade Assurance Mishap & Stuck Payment Loss Coverage Banner */}
        <div className="bg-emerald-950 text-white rounded-3xl p-8 md:p-10 border border-emerald-800 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Assurance of Trade Heaven — Stuck Payment &amp; Mishap Protection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Protected Against Stuck Payments &amp; Trade Mishaps
            </h2>
            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
              In case of any transactional mishap—such as a <strong>payment stuck in clearing</strong>, correspondent bank hold, or settlement bottleneck—where either the <strong>Supplier or the Buyer holds active Trade Assurance</strong>, losses are actively tried to be covered with the direct assistance of <strong>Trade Heaven</strong>, and <strong>Full Assurance is of Trade Heaven</strong> up to the certified escrow protection limit.
            </p>
          </div>
          <div className="shrink-0 bg-emerald-900/70 border border-emerald-700/80 rounded-2xl p-5 text-left space-y-1.5">
            <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Assurance Underwriter</div>
            <div className="text-lg font-black text-white">100% Trade Heaven Backed</div>
            <div className="text-xs text-emerald-200">Covers Verified Suppliers &amp; Buyers</div>
          </div>
        </div>

        {/* Off-Record Secret Communication & Instant Service Termination Clause */}
        <div className="bg-rose-950 text-white rounded-3xl p-8 md:p-10 border border-rose-800 shadow-lg space-y-3">
          <div className="inline-flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Mandatory Export Manager Supervision &amp; Anti-Circumvention Clause</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Instant Service Termination for Off-Record Secret Dealing
          </h2>
          <p className="text-rose-100/90 text-sm md:text-base leading-relaxed">
            If suppliers try to communicate outside the record with buyers—such as on any other social media or unauthorized channel which is not known to the <strong>Export Manager</strong> and not under his eyes (where he is not in communication)—and they deal secretly, <strong>services are terminated instantly</strong> with no refund eligibility, as <strong>Trade Heaven will not be accountable for any loss due to the supplier&apos;s greed</strong>.
          </p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center lg:text-left text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-2/3">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">Beware of Brand Impersonators</h2>
            <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
              <p>
                Please be aware that legitimate Trade Heaven operations only take place through our official domain: <strong>tradeheaven.net</strong>. 
              </p>
              <p>
                We have received reports of unrelated, fraudulent websites (such as "Trade Heaven FX") using similar names to run unregulated forex and cryptocurrency scams. <strong>Trade Heaven (tradeheaven.net) does not offer financial trading, investment software, or broker services.</strong>
              </p>
              <p>
                If you are ever asked to deposit money for "trading software" or "crypto investments" under a similar name, it is a scam and you should report it immediately.
              </p>
            </div>
          </div>
          <div className="lg:w-1/3 flex justify-center">
            <div className="bg-white/10 p-8 rounded-full border border-white/20 backdrop-blur-sm">
              <Search className="w-24 h-24 text-blue-400" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

