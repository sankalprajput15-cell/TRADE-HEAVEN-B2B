import React, { useEffect } from 'react';
import { Building2, Globe2, Target, Award, ArrowRight } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';

export const AboutUs: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = "About Us | Trade Heaven Official";
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">
            Revolutionizing Global B2B Commerce
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Trade Heaven is setting a new standard for secure, verified international trade and protecting buyers from global sourcing risks.
          </p>
        </div>
      </div>

      {/* Press Release Content */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg prose-slate max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 font-display">A Commitment to Verified Trade</h2>
            
            <p className="text-slate-600 leading-relaxed mb-6">
              In the rapidly expanding world of global commerce, finding reliable manufacturing partners and buyers can be a daunting task. For years, the B2B marketplace industry has struggled with fake listings, unverified suppliers, and poor lead quality. Enter <strong>Trade Heaven (tradeheaven.net)</strong>—a next-generation B2B marketplace platform built specifically to restore trust, transparency, and efficiency to international trade.
            </p>

            <p className="text-slate-600 leading-relaxed mb-10">
              Unlike legacy directories that suffer from cluttered interfaces and outdated listings, Trade Heaven is designed to be a streamlined, enterprise-grade engine for serious businesses. The platform focuses strictly on connecting legitimate manufacturers, exporters, and buyers globally.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-2xl mb-10">
              <p className="text-xl italic text-slate-800 font-medium m-0">
                "Our primary mission is to create a secure ecosystem where businesses can source products and close deals without the fear of bad actors. We understand the risks businesses face in cross-border logistics, which is why we are investing heavily in a secure platform architecture and transparent pricing models."
                <br /><span className="text-sm text-slate-500 mt-4 block not-italic">— Official Statement from Trade Heaven</span>
              </p>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-8 font-display">Clearing the Confusion: A Physical Goods Marketplace</h2>
            <p className="text-slate-600 leading-relaxed mb-10">
              In the digital age, brand confusion can happen. Trade Heaven wants to make it abundantly clear to its global user base: <strong>Trade Heaven (tradeheaven.net) is strictly a B2B marketplace for physical goods, manufacturing, and international export.</strong>
            </p>
            <p className="text-slate-600 leading-relaxed mb-10">
              The company has no affiliation whatsoever with unregulated financial speculation, forex trading software, or cryptocurrency brokers (such as the unrelated entity "Trade Heaven FX"). By maintaining a strict focus on physical supply chains and wholesale commerce, Trade Heaven ensures its users are engaging in tangible, legitimate business growth.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mb-8 font-display">Why Businesses are Choosing Trade Heaven</h2>
            <ul className="space-y-6 mb-12 list-none pl-0">
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 text-blue-600 p-1.5 rounded-full"><Award className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xl mb-1">Modern, Uncluttered Interface</h4>
                  <p className="text-slate-600">Moving away from the chaotic designs of older platforms, Trade Heaven offers a clean, user-friendly experience designed to get deals done faster.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 text-blue-600 p-1.5 rounded-full"><Target className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xl mb-1">Focus on Quality over Quantity</h4>
                  <p className="text-slate-600">Rather than inflating numbers with dead-end inquiries, Trade Heaven focuses on real sourcing requirements (RFQs) and connecting businesses with verified intent to purchase.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 text-blue-600 p-1.5 rounded-full"><Globe2 className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xl mb-1">Transparent B2B Model</h4>
                  <p className="text-slate-600">No hidden certificate fees. Trade Heaven operates on a clear, straightforward subscription model designed to provide genuine ROI for exporters and manufacturers.</p>
                </div>
              </li>
            </ul>

            <div className="text-center pt-8 border-t border-slate-200">
              <p className="text-lg text-slate-600 mb-6">
                As international trade continues to digitize, platforms that prioritize security and user success will lead the pack. Trade Heaven is actively proving that with the right architecture, cross-border commerce can be both safe and highly profitable for everyone involved.
              </p>
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  Explore the Marketplace <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

          </article>
        </div>
      </div>
    </div>
  );
};
