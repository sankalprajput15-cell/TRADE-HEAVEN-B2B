import re

with open('src/components/marketplace/InsightsBlog.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import React, { useEffect } from 'react';", "import React, { useEffect, useState } from 'react';")
content = content.replace("import { Calendar, User, Tag, ArrowRight, PlayCircle, Share2, TrendingUp } from 'lucide-react';", "import { Calendar, User, Tag, ArrowRight, PlayCircle, Share2, TrendingUp, X, ExternalLink } from 'lucide-react';")

# 2. Add State for Modal
state_decl = """export const InsightsBlog: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {"""
content = content.replace("""export const InsightsBlog: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  useEffect(() => {""", state_decl)

# 3. Truncate article body and add button
article3_body = """            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Breakdown of the Long Broker Chain</h3>"""
article3_replacement = """            
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
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Breakdown of the Long Broker Chain</h3>"""

content = content.replace(article3_body, article3_replacement)

# Close the hidden div before Tags
tags_str = """            {/* Tags */}"""
tags_replacement = """            </div>
            {/* Tags */}"""
content = content.replace(tags_str, tags_replacement)

# 4. Add the Modal at the end of the file
modal_html = """
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
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm">
                <Share2 className="w-4 h-4" /> Share Article
              </button>
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
"""

content = content.replace("    </div>\n  );\n};", modal_html)

with open('src/components/marketplace/InsightsBlog.tsx', 'w') as f:
    f.write(content)
