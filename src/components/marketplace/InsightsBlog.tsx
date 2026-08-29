import React, { useEffect } from 'react';
import { Calendar, User, Tag, ArrowRight, PlayCircle, Share2, TrendingUp } from 'lucide-react';
import blogImage from '../../assets/images/regenerated_image_1787916463995.jpg';

export const InsightsBlog: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = "Insights & Industry News | Trade Heaven";
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Blog Header */}
      <div className="bg-slate-900 py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 font-display tracking-tight">
            Trade Heaven Insights
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Expert analysis, industry news, and best practices for secure and efficient global B2B commerce.
          </p>
        </div>
      </div>

      {/* Main Blog Feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Article 1 (New) */}
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          
          {/* Article Header / Meta */}
          <div className="p-8 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" /> Seller Perspective
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> August 29, 2026
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> Trade Heaven Editorial
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-display leading-tight mb-4">
              When the "Buyer" Has No Money
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              A Seller's Perspective on verifying capability in international trade.
            </p>
          </div>

          {/* Article Media (Video + Image) */}
          <div className="bg-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-100">
            {/* YouTube Video Player */}
            <div className="rounded-xl overflow-hidden shadow-md bg-slate-900 relative aspect-[9/16] md:aspect-auto md:h-[400px] flex items-center justify-center group w-full">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/Cf-_4MskP9g" 
                title="When the Buyer Has No Money" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Image */}
            <div className="rounded-xl overflow-hidden shadow-md bg-white border border-slate-200">
              <img 
                src="/src/assets/images/regenerated_image_1787986452542.jpg" 
                alt="When the Buyer Has No Money" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Article Body */}
          <div className="p-8 prose prose-lg prose-slate max-w-none">
            <p className="lead text-slate-700">
              In the world of international trade and commodity markets, the single most expensive mistake a seller can make is confusing noise with liquidity.
            </p>

            <p className="text-slate-600">
              Every single day, trading desks and supply managers are flooded with inquiries, letters of intent, and bold assertions. The phrase "I am the buyer" is repeated constantly across email chains, messaging groups, and unverified brokerage networks. But in real-world commodities—whether dealing in EN590 diesel, aviation fuels, or bulk industrial cargo—claiming to be the buyer is not proof of the ability to buy.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-xl my-8">
              <p className="text-lg italic text-slate-800 font-medium m-0">
                When sellers release sensitive corporate offers, allocation details, and proof of product before confirming a counterparty's actual capability, they expose their business to severe operational delays, wasted resources, and legal vulnerability. Until an entity can produce verifiable, credible financial proof, they are not a buyer. They are merely a prospect.
              </p>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4">Real trade execution requires rigorous qualification protocols:</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                <li><strong>Bank-to-Bank Proof of Funds (POF):</strong> Moving away from easily forged, static PDF documents passed along chains of unvetted intermediaries, and relying solely on authenticated, institutional verification.</li>
                <li><strong>Direct Financial Confirmation:</strong> Ensuring that the counterparty’s financial institution communicates availability and readiness directly to the seller’s bank.</li>
                <li><strong>Proportionate Performance Commitments:</strong> Requiring standard, legitimate transaction milestones that test genuine financial intent and capability before critical assets are locked up.</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 mb-4">This is precisely why Trade Heaven exists.</h3>
            <p className="text-slate-600">
              Trade Heaven is built to cut through the friction, bad actors, and inefficiency that plague traditional B2B commodity trading. We provide the infrastructure, verification standards, and trusted marketplace environment that modern sellers and authentic buyers need to execute with absolute confidence.
            </p>
            <p className="text-slate-600">
              At Trade Heaven, every counterparty is evaluated on principal authority, verifiable funding mechanisms, financial capability, and legitimate operational track records. We eliminate the endless chains of non-performing intermediaries so that real suppliers can connect directly with real, capitalized buyers.
            </p>

            <p className="text-slate-800 font-bold mt-8">
              Do not gamble your company’s time, allocations, or market reputation on unverified claims. Qualify early. Trade safely. Protect your business and scale your global operations with Trade Heaven—where authentic international trade actually happens.
            </p>

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
              {['CommodityTrading', 'DueDiligence', 'ProofOfFunds', 'TradeSafety', 'RiskManagement', 'B2BTrade', 'TradeHeaven'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
            <button className="flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors font-medium text-sm">
              <Share2 className="w-4 h-4" /> Share Article
            </button>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-bold text-sm transition-colors"
              >
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>

        {/* Existing Article 1 */}
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          
          {/* Article Header / Meta */}
          <div className="p-8 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-1.5 font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" /> Commodity Trading
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> August 28, 2026
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> Trade Heaven Editorial
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-display leading-tight mb-4">
              No End Buyer, No Deal
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              In physical oil trading, long broker chains do not create value. They create noise.
            </p>
          </div>

          {/* Article Media (Video + Image) */}
          <div className="bg-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-100">
            {/* YouTube Video Player */}
            <div className="rounded-xl overflow-hidden shadow-md bg-slate-900 relative aspect-[9/16] md:aspect-auto md:h-[400px] flex items-center justify-center group w-full">
              {/* Replace 'aqz-KE-bpKQ' in the src URL with your actual YouTube video ID! */}
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/fhi-Ui34u6c?rel=0" 
                title="No End Buyer, No Deal" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Image Placeholder */}
            <div className="rounded-xl overflow-hidden shadow-md bg-white border border-slate-200">
              <img 
                src={blogImage} 
                alt="No End Buyer, No Deal Cartoon" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Article Body */}
          <div className="p-8 prose prose-lg prose-slate max-w-none">
            <p className="lead text-slate-700">
              Every additional intermediary slows communication, alters information and makes one simple question impossible to answer: <strong>who can actually decide and pay?</strong>
            </p>

            <p className="text-slate-600">
              A bankable transaction requires direct access to the true End Buyer. Not a "close associate," not a mandate of a mandate, and certainly not someone who claims the buyer is ready but cannot put them on a call.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl my-8">
              <p className="text-lg italic text-slate-800 font-medium m-0">
                The End Buyer must be present. This is where product requirements, logistics, financial capacity and contractual authority become real. Everything else is just commercial theatre with too many actors and no one holding the ticket.
              </p>
            </div>

            <p className="text-slate-600">
              Serious sellers do not need ten introductions. They need one qualified decision maker. Have you ever seen a promising deal collapse because the real buyer was never actually involved?
            </p>

            <p className="text-slate-800 font-bold mt-8">
              If you are interested in these topics, let us connect.
            </p>

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
              {['OilTrading', 'OilAndGas', 'FuelTrading', 'EndBuyer', 'CommodityTrading', 'EN590', 'EnergyTrading', 'FOB', 'CIF', 'DueDiligence', 'InternationalTrade'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
            <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">
              <Share2 className="w-4 h-4" /> Share Article
            </button>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors"
              >
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>

      </div>
    </div>
  );
};
