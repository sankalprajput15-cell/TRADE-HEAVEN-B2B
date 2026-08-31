import React, { useEffect, useState } from 'react';
import { AuthUser } from '../../types';
import { Calendar, User, Tag, ArrowRight, PlayCircle, Share2, TrendingUp, X, ExternalLink, Linkedin, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import blogImage from '../../assets/images/regenerated_image_1787916463995.jpg';
import buyerNoMoneyImage from '../../assets/images/regenerated_image_1787986452542.jpg';
import brokersImage from '../../assets/images/regenerated_image_1788177506942.jpg';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface InsightsBlogProps {
  onNavigate?: (view: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export const InsightsBlog: React.FC<InsightsBlogProps> = ({ onNavigate, currentUser, onOpenAuthModal }) => {
const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const [comments, setComments] = useState<Record<string, Comment[]>>({
    'brokers-article': [
      {
        id: '1',
        userId: 'u1',
        userName: 'Michael Chen',
        text: 'This is spot on. We wasted 3 weeks last month verifying a chain of 4 intermediaries only to find out none of them actually had direct allocation from the refinery.',
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Sarah Jenkins',
        text: 'Agreed. The platform verification process here is a breath of fresh air. No more "I know a guy who knows the mandate".',
        timestamp: '5 hours ago',
      }
    ]
  });
  const [newComment, setNewComment] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePostComment = () => {
    if (!currentUser || !newComment.trim() || !selectedArticleId) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name || 'Anonymous User',
      text: newComment.trim(),
      timestamp: 'Just now',
    };

    setComments(prev => ({
      ...prev,
      [selectedArticleId]: [...(prev[selectedArticleId] || []), comment]
    }));
    setNewComment('');
  };

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
        
        
        {/* Article 3 (New: Brokers) */}
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
          {/* Article Header / Meta */}
          <div className="p-8 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" /> Market Efficiency
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> August 31, 2026
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> Trade Heaven Editorial
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-display leading-tight mb-4">
              Why Too Many Intermediaries Kill Commodity Deals (And How Trade Heaven Solves It)
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Physical fuel and energy trading does not become safer simply because fifteen intermediaries are copied into an email chain. In high-stakes commodity markets, the exact opposite happens.
            </p>
          </div>

          {/* Article Media (Video + Image) */}
          <div className="bg-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-100">
            {/* YouTube Video Player */}
            <div className="rounded-xl overflow-hidden shadow-md bg-slate-900 relative aspect-[9/16] md:aspect-auto md:h-[400px] flex items-center justify-center group w-full">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/6O-3LHetZpc?rel=0" 
                title="Why Too Many Intermediaries Kill Commodity Deals" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Image Placeholder */}
            <div className="rounded-xl overflow-hidden shadow-md bg-white border border-slate-200">
              <img 
                src={brokersImage} 
                alt="Brokers and Intermediaries" 
                className="w-full h-auto object-cover md:h-[400px]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Article Body */}
          <div className="p-8 prose prose-lg prose-slate max-w-none">
            <p className="lead text-slate-700">
              Every extra broker layer introduces friction: pricing escalates, commercial terms get distorted, critical timelines slip, and direct buyer-seller clarity vanishes. When everyone claims mandate but no one has allocation, viable deals fall apart.
            </p>

            
            {/* Read More Button */}
            <div className="mt-8">
              <button 
                onClick={() => setSelectedArticleId('brokers-article')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Read Full Article <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden">
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Breakdown of the Long Broker Chain</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                <li><strong>Distorted Pricing & Procedures:</strong> Details shift as information passes through unverified parties.</li>
                <li><strong>Lack of Direct Transparency:</strong> Locating the actual principal buyer or seller requires endless back-and-forth rather than direct due diligence.</li>
                <li><strong>Deal Fatigue:</strong> Bureaucratic friction delays allocation slots, leading to dropped contracts and missed shipping windows.</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Trade Heaven Advantage: Direct, Transparent Sourcing</h3>
            <p className="text-slate-600">
              Intermediaries should create value by facilitating swift execution—not by becoming the obstacle. At <strong>Trade Heaven</strong>, we streamline global B2B commodity trading by connecting verified buyers and suppliers directly.
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                <li><strong>Direct Counterparty Access:</strong> Bypass unnecessary intermediary chains and negotiate straight with authorized representatives.</li>
                <li><strong>Verified Trading Network:</strong> Ensure counterparty credibility before initiating contracts.</li>
                <li><strong>Efficient Deal Execution:</strong> Keep negotiations lean, fast, and commercially viable.</li>
            </ul>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-xl my-8">
              <p className="text-lg italic text-slate-800 font-medium m-0">
                A professional supply chain should always be direct enough to identify the buyer and seller immediately.
              </p>
            </div>

            <p className="text-slate-800 font-bold mt-8">
              Ready to eliminate trading bottlenecks and scale your global sourcing? Connect with <strong>Trade Heaven</strong> today to streamline your commodity deals.
            </p>

            </div>
            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
              {['TradeHeaven', 'CommodityTrading', 'OilAndGas', 'EnergyTrading', 'FuelTrading', 'B2BMarketplace', 'GlobalTrade', 'InternationalTrade'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article Footer */}
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mr-1 hidden sm:flex">
                <Share2 className="w-4 h-4" /> Share:
              </span>
              <button 
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this article on Trade Heaven!')}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this article on Trade Heaven! ' + window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
              >
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </article>

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
                src={buyerNoMoneyImage} 
                alt="When the Buyer Has No Money" 
                className="w-full h-auto object-contain"
                referrerPolicy="no-referrer"
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mr-1 hidden sm:flex">
                <Share2 className="w-4 h-4" /> Share:
              </span>
              <button 
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this article on Trade Heaven!')}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this article on Trade Heaven! ' + window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
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
                referrerPolicy="no-referrer"
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mr-1 hidden sm:flex">
                <Share2 className="w-4 h-4" /> Share:
              </span>
              <button 
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this article on Trade Heaven!')}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this article on Trade Heaven! ' + window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
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

      {/* Full Article Modal */}
      {selectedArticleId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-slideUp">
            
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setSelectedArticleId(null)}
                className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-8 sm:p-12">
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm mb-4">
                  <TrendingUp className="w-4 h-4" /> Market Efficiency
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display leading-tight mb-6">
                  Why Too Many Intermediaries Kill Commodity Deals (And How Trade Heaven Solves It)
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-500 pb-8 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> August 31, 2026
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Trade Heaven Editorial
                  </span>
                </div>
              </div>

              <div className="prose prose-lg prose-slate max-w-none">
                <p className="lead text-slate-700 text-xl font-medium mb-8">
                  Physical fuel and energy trading does not become safer simply because fifteen intermediaries are copied into an email chain. In high-stakes commodity markets, the exact opposite happens.
                </p>
                
                <img 
                  src={brokersImage}
                  alt="Brokers and Intermediaries" 
                  className="w-full h-auto object-cover rounded-2xl mb-8"
                  referrerPolicy="no-referrer"
                />

                <p className="text-slate-600">
                  Every extra broker layer introduces friction: pricing escalates, commercial terms get distorted, critical timelines slip, and direct buyer-seller clarity vanishes. When everyone claims mandate but no one has allocation, viable deals fall apart.
                </p>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Breakdown of the Long Broker Chain</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                    <li><strong>Distorted Pricing & Procedures:</strong> Details shift as information passes through unverified parties.</li>
                    <li><strong>Lack of Direct Transparency:</strong> Locating the actual principal buyer or seller requires endless back-and-forth rather than direct due diligence.</li>
                    <li><strong>Deal Fatigue:</strong> Bureaucratic friction delays allocation slots, leading to dropped contracts and missed shipping windows.</li>
                </ul>

                <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Trade Heaven Advantage: Direct, Transparent Sourcing</h3>
                <p className="text-slate-600">
                  Intermediaries should create value by facilitating swift execution—not by becoming the obstacle. At <strong>Trade Heaven</strong>, we streamline global B2B commodity trading by connecting verified buyers and suppliers directly.
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                    <li><strong>Direct Counterparty Access:</strong> Bypass unnecessary intermediary chains and negotiate straight with authorized representatives.</li>
                    <li><strong>Verified Trading Network:</strong> Ensure counterparty credibility before initiating contracts.</li>
                    <li><strong>Efficient Deal Execution:</strong> Keep negotiations lean, fast, and commercially viable.</li>
                </ul>

                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-xl my-8">
                  <p className="text-lg italic text-slate-800 font-medium m-0">
                    A professional supply chain should always be direct enough to identify the buyer and seller immediately.
                  </p>
                </div>

                <p className="text-slate-800 font-bold mt-8">
                  Ready to eliminate trading bottlenecks and scale your global sourcing? Connect with <strong>Trade Heaven</strong> today to streamline your commodity deals.
                </p>
              </div>
              
              {/* Related Articles Section */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Related Articles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Article 1 */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
                    <div className="h-32 bg-slate-200 overflow-hidden relative">
                      <img src={blogImage} alt="Related Article" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 mb-2 tracking-wide uppercase">Market Efficiency</span>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">The True Cost of Hidden Fees in B2B Trade</h4>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">Analyzing the impact of stacked intermediary margins on end-buyer procurement costs.</p>
                      <div className="flex items-center text-xs text-indigo-600 font-bold mt-auto">
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Article 2 */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
                    <div className="h-32 bg-slate-200 overflow-hidden relative">
                      <img src={buyerNoMoneyImage} alt="Related Article" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 mb-2 tracking-wide uppercase">Due Diligence</span>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">How to Verify Supplier Mandates Before Signing</h4>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">A step-by-step guide to separating real allocation holders from chain brokers.</p>
                      <div className="flex items-center text-xs text-indigo-600 font-bold mt-auto">
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Article 3 */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
                    <div className="h-32 bg-slate-900 overflow-hidden relative flex items-center justify-center">
                       <TrendingUp className="w-8 h-8 text-slate-700 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 mb-2 tracking-wide uppercase">Market Efficiency</span>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">Digital vs. Traditional Brokerage Margins</h4>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">Why tech-enabled direct sourcing is replacing traditional brokerage networks globally.</p>
                      <div className="flex items-center text-xs text-indigo-600 font-bold mt-auto">
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-indigo-600" /> Discussion
                </h3>
                
                {/* Comment Input */}
                <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  {currentUser ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {currentUser.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700">{currentUser.name}</span>
                      </div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add to the discussion..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handlePostComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-600 mb-4">You must be logged in to participate in the discussion.</p>
                      <button
                        onClick={onOpenAuthModal}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors inline-block"
                      >
                        Log In to Join
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {(comments[selectedArticleId] || []).map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-slate-900">{comment.userName}</span>
                          <span className="text-sm text-slate-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!comments[selectedArticleId] || comments[selectedArticleId].length === 0) && (
                    <p className="text-slate-500 text-center py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mr-1 hidden sm:flex">
                <Share2 className="w-4 h-4" /> Share:
              </span>
              <button 
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this article on Trade Heaven!')}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this article on Trade Heaven! ' + window.location.href)}`, '_blank')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer shadow-sm"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer shadow-sm"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
              {onNavigate && (
                <button 
                  onClick={() => {
                    setSelectedArticleId(null);
                    onNavigate('PRODUCT_DIRECTORY');
                  }}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                >
                  Explore Marketplace <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

