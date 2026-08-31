import re

with open('src/components/marketplace/InsightsBlog.tsx', 'r') as f:
    content = f.read()

related_articles_html = """              {/* Related Articles Section */}
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

              {/* Comments Section */}"""

if "{/* Comments Section */}" in content:
    content = content.replace("              {/* Comments Section */}", related_articles_html)
else:
    print("Error: Could not find {/* Comments Section */}")

with open('src/components/marketplace/InsightsBlog.tsx', 'w') as f:
    f.write(content)
