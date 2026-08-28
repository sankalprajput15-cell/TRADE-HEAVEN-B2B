import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Verified, Search, FileText, Anchor } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';

export const TrustAndSafety: React.FC = () => {
  useEffect(() => {
    document.title = "Trust & Safety | Trade Heaven B2B Marketplace";
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm mb-6">
            <ShieldCheck className="w-5 h-5" />
            Official Security & Trust Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">
            Secure, Verified, and Transparent Global Trade
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            At Trade Heaven, our mission is to eliminate the risks of cross-border commerce. We are strictly a physical goods B2B marketplace, dedicated to connecting legitimate manufacturers with serious global buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
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
            <h3 className="text-xl font-bold text-slate-900 mb-3">Transparent & Secure</h3>
            <p className="text-slate-600 leading-relaxed">
              We operate on a transparent subscription and lead-generation model. There are no hidden certificate fees or unauthorized charges. What you see is what you get: a pure B2B networking engine.
            </p>
          </div>
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
