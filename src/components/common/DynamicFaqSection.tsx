import React, { useState, useEffect } from 'react';
import { bigrockApi, DbFaq } from '../../services/bigrockApi';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageSquare, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Props {
  onOpenContactModal?: () => void;
  className?: string;
}

export const DynamicFaqSection: React.FC<Props> = ({ onOpenContactModal, className = '' }) => {
  const [faqs, setFaqs] = useState<DbFaq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | number | null>('faq-1');

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await bigrockApi.fetchFaqs();
      setFaqs(data);
      if (data.length > 0 && !openFaqId) {
        setOpenFaqId(data[0].id || 'faq-1');
      }
    } catch (err) {
      console.warn('FAQ fetch fallback active');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(faqs.map(f => f.category || 'General')))];

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = activeCategory === 'ALL' || faq.category === activeCategory;
    const matchSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleFaq = (id?: string | number) => {
    if (id === undefined || id === null) return;
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div id="dynamic-faq-section" className={`bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs space-y-7 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 tracking-wide uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help &amp; Knowledge Base</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Key answers on global trade procedures, escrow protection, and supplier verification.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {cat === 'ALL' ? 'All Topics' : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Accordion List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-slate-100 space-y-2">
          <p className="text-xs text-slate-500">No matching questions found.</p>
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFaqs.map((faq, index) => {
            const faqId = faq.id || `faq-idx-${index}`;
            const isOpen = openFaqId === faqId;

            return (
              <div
                key={faqId}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-blue-500/40 bg-blue-50/30 shadow-2xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faqId)}
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {faq.category || 'Trade'}
                    </span>
                    <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                      isOpen ? 'text-blue-700' : 'text-slate-800'
                    }`}>
                      {faq.question}
                    </span>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80">
                    <p className="pt-1.5">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Support Footer */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-600 text-center sm:text-left">
          <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Need help with a custom order or specific inquiry?</span>
        </div>

        {onOpenContactModal && (
          <button
            onClick={onOpenContactModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

