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
        
        {/* Article 1 */}
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
